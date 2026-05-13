"use strict";
/**
 * Odoo Inventory Sync Job (v2 — Extended Fields)
 *
 * Runs every 15 minutes. Syncs inventory quantities from Odoo
 * including qty_available, forecasted_qty, incoming_qty, outgoing_qty.
 *
 * Uses the OdooSyncService for consistent Odoo communication.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = odooInventorySyncJob;
const service_1 = __importDefault(require("../modules/odoo-sync/service"));
const STOCK_FIELDS = [
    "id",
    "default_code",
    "name",
    "qty_available",
    "virtual_available",
    "incoming_qty",
    "outgoing_qty",
    "free_qty",
];
async function odooInventorySyncJob(container) {
    const logger = container.resolve("logger");
    logger.info("📦 [Inventory Job] Starting Odoo inventory sync...");
    const odoo = new service_1.default();
    if (!odoo.isConfigured()) {
        logger.warn("⚠️  Odoo not configured, skipping inventory sync");
        return;
    }
    try {
        const authOk = await odoo.authenticate();
        if (!authOk) {
            logger.warn("[Inventory Job] Could not authenticate with Odoo");
            return;
        }
        // Fetch all active product variants with stock fields
        const odooVariants = await odoo.fetchVariantStock(1000);
        logger.info(`[Inventory Job] Fetched ${odooVariants.length} variants from Odoo`);
        // Build SKU → stock map
        const odooInventory = new Map();
        for (const v of odooVariants) {
            const sku = typeof v.default_code === "string"
                ? v.default_code
                : `ODOO-${v.id}`;
            odooInventory.set(sku, {
                qty: Math.max(0, Math.floor(v.qty_available)),
                forecasted: Math.max(0, Math.floor(v.virtual_available)),
                incoming: Math.max(0, Math.floor(v.incoming_qty)),
                outgoing: Math.max(0, Math.floor(v.outgoing_qty)),
                freeQty: Math.max(0, Math.floor(v.free_qty)),
                odooId: v.id,
                name: v.name,
            });
        }
        // Get Medusa services
        const productModuleService = container.resolve("product");
        const inventoryModuleService = container.resolve("inventory");
        const stockLocationService = container.resolve("stock_location");
        // Get existing products with variants
        const existingProducts = await productModuleService.listProducts({}, {
            select: ["id", "handle", "metadata"],
            relations: ["variants"],
            take: 5000,
        });
        // Get inventory items
        const inventoryItems = await inventoryModuleService.listInventoryItems({}, { take: 5000 });
        const inventoryItemMap = new Map();
        for (const item of inventoryItems) {
            if (item.sku)
                inventoryItemMap.set(item.sku, item);
        }
        // Get default location
        const locations = await stockLocationService.listStockLocations({});
        if (locations.length === 0) {
            logger.warn("[Inventory Job] No stock locations found");
            return;
        }
        const location = locations[0];
        let updatedCount = 0;
        let metadataUpdated = 0;
        let errorCount = 0;
        for (const product of existingProducts) {
            for (const variant of product.variants || []) {
                const sku = variant.sku;
                if (!sku)
                    continue;
                const odooStock = odooInventory.get(sku);
                if (!odooStock)
                    continue;
                try {
                    // 1) Update Medusa inventory levels
                    const inventoryItem = inventoryItemMap.get(sku);
                    if (inventoryItem) {
                        const levels = await inventoryModuleService.listInventoryLevels({
                            inventory_item_id: inventoryItem.id,
                            location_id: location.id,
                        });
                        if (levels.length > 0) {
                            await inventoryModuleService.updateInventoryLevels({
                                inventory_item_id: inventoryItem.id,
                                location_id: location.id,
                                stocked_quantity: odooStock.qty,
                            });
                        }
                        else {
                            await inventoryModuleService.createInventoryLevels({
                                inventory_item_id: inventoryItem.id,
                                location_id: location.id,
                                stocked_quantity: odooStock.qty,
                            });
                        }
                        updatedCount++;
                    }
                    // 2) Also store extended stock info in product metadata
                    const existingMeta = product.metadata || {};
                    const stockMeta = {
                        ...existingMeta,
                        stock_qty: odooStock.qty,
                        stock_forecasted: odooStock.forecasted,
                        stock_incoming: odooStock.incoming,
                        stock_outgoing: odooStock.outgoing,
                        stock_free_qty: odooStock.freeQty,
                        stock_synced_at: new Date().toISOString(),
                    };
                    // Only update metadata if stock values changed
                    if (existingMeta.stock_qty !== odooStock.qty ||
                        existingMeta.stock_forecasted !== odooStock.forecasted) {
                        await productModuleService.updateProducts(product.id, {
                            metadata: stockMeta,
                        });
                        metadataUpdated++;
                    }
                }
                catch (error) {
                    errorCount++;
                    if (errorCount <= 5) {
                        logger.warn(`[Inventory Job] Error updating ${sku}: ${error.message}`);
                    }
                }
            }
        }
        logger.info(`✅ [Inventory Job] Completed: ${updatedCount} levels updated, ${metadataUpdated} metadata updated, ${errorCount} errors`);
    }
    catch (error) {
        logger.error(`[Inventory Job] Error: ${error.message}`);
    }
}
// Job configuration — run every 15 minutes
exports.config = {
    name: "odoo-inventory-sync",
    schedule: "*/15 * * * *",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2Rvby1pbnZlbnRvcnktc3luYy1qb2IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvam9icy9vZG9vLWludmVudG9yeS1zeW5jLWpvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7R0FPRzs7Ozs7O0FBMkJILHVDQW9LQztBQTVMRCwyRUFBMEQ7QUFhMUQsTUFBTSxZQUFZLEdBQUc7SUFDbkIsSUFBSTtJQUNKLGNBQWM7SUFDZCxNQUFNO0lBQ04sZUFBZTtJQUNmLG1CQUFtQjtJQUNuQixjQUFjO0lBQ2QsY0FBYztJQUNkLFVBQVU7Q0FDWCxDQUFBO0FBRWMsS0FBSyxVQUFVLG9CQUFvQixDQUNoRCxTQUEwQjtJQUUxQixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtJQUVqRSxNQUFNLElBQUksR0FBRyxJQUFJLGlCQUFlLEVBQUUsQ0FBQTtJQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxrREFBa0QsQ0FBQyxDQUFBO1FBQy9ELE9BQU07SUFDUixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDeEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxrREFBa0QsQ0FBQyxDQUFBO1lBQy9ELE9BQU07UUFDUixDQUFDO1FBRUQsc0RBQXNEO1FBQ3RELE1BQU0sWUFBWSxHQUF1QixNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUUzRSxNQUFNLENBQUMsSUFBSSxDQUNULDJCQUEyQixZQUFZLENBQUMsTUFBTSxxQkFBcUIsQ0FDcEUsQ0FBQTtR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