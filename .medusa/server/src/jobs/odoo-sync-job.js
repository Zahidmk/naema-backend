"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = odooSyncJob;
const utils_1 = require("@medusajs/framework/utils");
async function odooSyncJob(container) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const pgConnection = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_LINK);
    let odooSyncService;
    try {
        odooSyncService = container.resolve("odooSyncService");
    }
    catch {
        logger.warn("[Odoo Sync Job] OdooSyncService not registered, skipping.");
        return;
    }
    logger.info("[Odoo Sync Job] Starting delta sync...");
    try {
        // Get last sync timestamp from system_config
        let lastSync = null;
        try {
            const result = await pgConnection.raw(`SELECT value FROM system_config WHERE key = ?`, ["odoo_last_sync"]);
            if (result.rows?.length > 0) {
                lastSync = result.rows[0].value;
            }
        }
        catch {
            // Table may not exist yet
            try {
                await pgConnection.raw(`
          CREATE TABLE IF NOT EXISTS system_config (
            key VARCHAR(255) PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
            }
            catch {
                logger.warn("[Odoo Sync Job] Could not create system_config table");
            }
        }
        // Fetch products modified since last sync
        const products = await odooSyncService.fetchProductsSince(lastSync);
        if (!products || products.length === 0) {
            logger.info("[Odoo Sync Job] No new/updated products found.");
            await updateLastSync(pgConnection, logger);
            return;
        }
        logger.info(`[Odoo Sync Job] Found ${products.length} products to sync.`);
        let created = 0;
        let updated = 0;
        let errors = 0;
        for (const odooProduct of products) {
            try {
                const medusaData = odooSyncService.convertToMedusaProduct(odooProduct);
                // Check if product exists by odoo_id
                const existing = await productService.listProducts({}, { select: ["id", "metadata"], take: 5000 });
                const existingProduct = existing.find((p) => p.metadata?.odoo_id === odooProduct.id ||
                    p.metadata?.odoo_id === String(odooProduct.id));
                let medusaProductId;
                if (existingProduct) {
                    await productService.updateProducts(existingProduct.id, {
                        title: medusaData.title,
                        description: medusaData.description,
                        handle: medusaData.handle,
                        status: medusaData.status,
                        metadata: medusaData.metadata,
                    });
                    medusaProductId = existingProduct.id;
                    updated++;
                    logger.info(`[Odoo Sync Job] Updated: ${medusaData.title} (${medusaProductId})`);
                }
                else {
                    const created_products = await productService.createProducts(medusaData);
                    const created_product = Array.isArray(created_products) ? created_products[0] : created_products;
                    medusaProductId = created_product.id;
                    created++;
                    logger.info(`[Odoo Sync Job] Created: ${medusaData.title} (${medusaProductId})`);
                }
                // Sync prices via Pricing module
                const price = odooProduct.list_price || odooProduct.lst_price || 0;
                const currency = (odooProduct.currency_id?.[1] || "OMR").toString().toLowerCase();
                if (price > 0) {
                    try {
                        const product = await productService.retrieveProduct(medusaProductId, {
                            relations: ["variants"],
                        });
                        for (const variant of product.variants || []) {
                            const priceSet = await pricingService.createPriceSets({
                                prices: [{ amount: price, currency_code: currency }],
                            });
                            await remoteLink.create({
                                [utils_1.Modules.PRODUCT]: { variant_id: variant.id },
                                [utils_1.Modules.PRICING]: { price_set_id: priceSet.id },
                            });
                        }
                    }
                    catch (priceError) {
                        logger.warn(`[Odoo Sync Job] Price sync failed for ${medusaData.title}: ${priceError.message}`);
                    }
                }
            }
            catch (productError) {
                errors++;
                logger.error(`[Odoo Sync Job] Failed to sync product ${odooProduct.id}: ${productError.message}`);
            }
        }
        await updateLastSync(pgConnection, logger);
        logger.info(`[Odoo Sync Job] Completed: ${created} created, ${updated} updated, ${errors} errors`);
    }
    catch (error) {
        logger.error(`[Odoo Sync Job] Fatal error: ${error.message}`);
    }
}
async function updateLastSync(pgConnection, logger) {
    try {
        const now = new Date().toISOString();
        await pgConnection.raw(`INSERT INTO system_config (key, value, updated_at)
       VALUES (?, ?, NOW())
       ON CONFLICT (key) DO UPDATE SET value = ?, updated_at = NOW()`, ["odoo_last_sync", now, now]);
    }
    catch (e) {
        logger.warn(`[Odoo Sync Job] Could not update last sync: ${e.message}`);
    }
}
exports.config = {
    name: "odoo-product-sync",
    schedule: "*/5 * * * *",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2Rvby1zeW5jLWpvYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9qb2JzL29kb28tc3luYy1qb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZUEsOEJBZ0lDO0FBcklELHFEQUdtQztBQUVwQixLQUFLLFVBQVUsV0FBVyxDQUFDLFNBQTBCO0lBQ2xFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkUsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRixNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRTVFLElBQUksZUFBb0IsQ0FBQztJQUN6QixJQUFJLENBQUM7UUFDSCxlQUFlLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFBQyxNQUFNLENBQUM7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLDJEQUEyRCxDQUFDLENBQUM7UUFDekUsT0FBTztJQUNULENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7SUFFdEQsSUFBSSxDQUFDO1FBQ0gsNkNBQTZDO1FBQzdDLElBQUksUUFBUSxHQUFrQixJQUFJLENBQUM7UUFDbkMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNuQywrQ0FBK0MsRUFDL0MsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUNuQixDQUFDO1lBQ0YsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ2xDLENBQUM7UUFDSCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AsMEJBQTBCO1lBQzFCLElBQUksQ0FBQztnQkFDSCxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQUM7Ozs7OztTQU10QixDQUFDLENBQUM7WUFDTCxDQUFDO1lBQUMsTUFBTSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0RBQXNELENBQUMsQ0FBQztZQUN0RSxDQUFDO1FBQ0gsQ0FBQztRQUVELDBDQUEwQztRQUMxQyxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwRSxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1lBQzlELE1BQU0sY0FBYyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQyxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLFFBQVEsQ0FBQyxNQUFNLG9CQUFvQixDQUFDLENBQUM7UUFFMUUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFZixLQUFLLE1BQU0sV0FBVyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQztnQkFDSCxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRXZFLHFDQUFxQztnQkFDckMsTUFBTSxRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsWUFBWSxDQUNoRCxFQUFTLEVBQ1QsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUMzQyxDQUFDO2dCQUNGLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQ25DLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FDVCxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sS0FBSyxXQUFXLENBQUMsRUFBRTtvQkFDdEMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLEtBQUssTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FDakQsQ0FBQztnQkFFRixJQUFJLGVBQXVCLENBQUM7Z0JBRTVCLElBQUksZUFBZSxFQUFFLENBQUM7b0JBQ3BCLE1BQU0sY0FBYyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFO3dCQUN0RCxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7d0JBQ3ZCLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVzt3QkFDbkMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxNQUFNO3dCQUN6QixNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07d0JBQ3pCLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtxQkFDOUIsQ0FBQyxDQUFDO29CQUNILGVBQWUsR0FBRyxlQUFlLENBQUMsRUFBRSxDQUFDO29CQUNyQyxPQUFPLEVBQUUsQ0FBQztvQkFDVixNQUFNLENBQUMsSUFBSSxDQUFDLDRCQUE0QixVQUFVLENBQUMsS0FBSyxLQUFLLGVBQWUsR0FBRyxDQUFDLENBQUM7Z0JBQ25GLENBQUM7cUJBQU0sQ0FBQztvQkFDTixNQUFNLGdCQUFnQixHQUFHLE1BQU0sY0FBYyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDekUsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7b0JBQ2pHLGVBQWUsR0FBRyxlQUFlLENBQUMsRUFBRSxDQUFDO29CQUNyQyxPQUFPLEVBQUUsQ0FBQztvQkFDVixNQUFNLENBQUMsSUFBSSxDQUFDLDRCQUE0QixVQUFVLENBQUMsS0FBSyxLQUFLLGVBQWUsR0FBRyxDQUFDLENBQUM7Z0JBQ25GLENBQUM7Z0JBRUQsaUNBQWlDO2dCQUNqQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsVUFBVSxJQUFJLFdBQVcsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO2dCQUNuRSxNQUFNLFFBQVEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFFbEYsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ2QsSUFBSSxDQUFDO3dCQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUU7NEJBQ3BFLFNBQVMsRUFBRSxDQUFDLFVBQVUsQ0FBQzt5QkFDeEIsQ0FBQyxDQUFDO3dCQUVILEtBQUssTUFBTSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUUsQ0FBQzs0QkFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsZUFBZSxDQUFDO2dDQUNwRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxDQUFDOzZCQUNyRCxDQUFDLENBQUM7NEJBQ0gsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDO2dDQUN0QixDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFO2dDQUM3QyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFOzZCQUNqRCxDQUFDLENBQUM7d0JBQ0wsQ0FBQztvQkFDSCxDQUFDO29CQUFDLE9BQU8sVUFBZSxFQUFFLENBQUM7d0JBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMseUNBQXlDLFVBQVUsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQ2xHLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7WUFBQyxPQUFPLFlBQWlCLEVBQUUsQ0FBQztnQkFDM0IsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsV0FBVyxDQUFDLEVBQUUsS0FBSyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwRyxDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sY0FBYyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixPQUFPLGFBQWEsT0FBTyxhQUFhLE1BQU0sU0FBUyxDQUFDLENBQUM7SUFDckcsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztBQUNILENBQUM7QUFFRCxLQUFLLFVBQVUsY0FBYyxDQUFDLFlBQWlCLEVBQUUsTUFBVztJQUMxRCxJQUFJLENBQUM7UUFDSCxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDcEI7O3FFQUUrRCxFQUMvRCxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FDN0IsQ0FBQztJQUNKLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsK0NBQStDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzFFLENBQUM7QUFDSCxDQUFDO0FBRVksUUFBQSxNQUFNLEdBQUc7SUFDcEIsSUFBSSxFQUFFLG1CQUFtQjtJQUN6QixRQUFRLEVBQUUsYUFBYTtDQUN4QixDQUFDIn0=