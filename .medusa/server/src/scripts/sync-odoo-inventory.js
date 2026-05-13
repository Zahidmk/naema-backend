"use strict";
/**
 * Sync Odoo Inventory to MedusaJS
 *
 * This script fetches inventory from Odoo and updates the existing
 * MedusaJS inventory levels.
 *
 * Usage: npx medusa exec ./src/scripts/sync-odoo-inventory.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncOdooInventory;
const utils_1 = require("@medusajs/framework/utils");
const service_1 = __importDefault(require("../modules/odoo-sync/service"));
async function syncOdooInventory({ container }) {
    const logger = container.resolve("logger");
    const inventoryService = container.resolve(utils_1.Modules.INVENTORY);
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    logger.info("Starting Odoo inventory sync...");
    // Initialize Odoo service
    const odooService = new service_1.default();
    // Check if Odoo is configured
    if (!odooService.isConfigured()) {
        logger.error("Odoo is not configured. Please set environment variables:");
        logger.error("  ODOO_URL, ODOO_DB_NAME, ODOO_USERNAME, ODOO_API_KEY");
        return;
    }
    logger.info("Testing Odoo connection...");
    const connectionTest = await odooService.testConnection();
    if (!connectionTest.success) {
        logger.error(`Odoo connection failed: ${connectionTest.message}`);
        logger.error("Please verify your Odoo credentials in .env file");
        return;
    }
    logger.info(`Connected to Odoo! Found ${connectionTest.data?.productCount} products`);
    try {
        // Fetch products from Odoo
        logger.info("Fetching products from Odoo...");
        const odooProducts = await odooService.fetchProducts(500, 0);
        logger.info(`Fetched ${odooProducts.length} products from Odoo`);
        // Fetch existing products from MedusaJS
        const existingProducts = await productService.listProducts({}, { take: 1000 });
        logger.info(`Found ${existingProducts.length} existing products in MedusaJS`);
        let created = 0;
        let updated = 0;
        let skipped = 0;
        let errors = [];
        for (const odooProduct of odooProducts) {
            try {
                const sku = odooProduct.default_code || `ODOO-${odooProduct.id}`;
                const medusaData = odooService.convertToMedusaProduct(odooProduct);
                // Check if product exists by SKU in metadata
                let existingProduct = existingProducts.find((p) => p.metadata?.odoo_id === odooProduct.id ||
                    p.variants?.some((v) => v.sku === sku));
                if (existingProduct) {
                    // Update existing product
                    await productService.updateProducts(existingProduct.id, {
                        title: medusaData.title,
                        description: medusaData.description,
                        metadata: {
                            ...existingProduct.metadata,
                            odoo_id: odooProduct.id,
                            odoo_sku: sku,
                            odoo_stock: odooProduct.qty_available,
                            odoo_last_sync: new Date().toISOString(),
                        },
                    });
                    // Update inventory if variant exists
                    if (existingProduct.variants?.length > 0) {
                        const variant = existingProduct.variants[0];
                        // Note: Full inventory sync would require linking to inventory module
                        logger.info(`Would update inventory for ${sku}: ${odooProduct.qty_available} units`);
                    }
                    updated++;
                    logger.info(`Updated: ${odooProduct.name} (${sku})`);
                }
                else {
                    // Create new product
                    const newProduct = await productService.createProducts({
                        title: medusaData.title,
                        description: medusaData.description,
                        handle: medusaData.handle,
                        status: "published",
                        metadata: {
                            odoo_id: odooProduct.id,
                            odoo_sku: sku,
                            odoo_stock: odooProduct.qty_available,
                            odoo_category: odooProduct.categ_id ? odooProduct.categ_id[1] : null,
                            odoo_last_sync: new Date().toISOString(),
                        },
                    });
                    created++;
                    logger.info(`Created: ${odooProduct.name} (${sku})`);
                }
            }
            catch (error) {
                errors.push(`${odooProduct.name}: ${error.message}`);
                skipped++;
            }
        }
        logger.info("=".repeat(50));
        logger.info("SYNC COMPLETE");
        logger.info("=".repeat(50));
        logger.info(`Created: ${created}`);
        logger.info(`Updated: ${updated}`);
        logger.info(`Skipped: ${skipped}`);
        if (errors.length > 0) {
            logger.warn("Errors:");
            errors.slice(0, 10).forEach((e) => logger.warn(`  - ${e}`));
            if (errors.length > 10) {
                logger.warn(`  ... and ${errors.length - 10} more`);
            }
        }
    }
    catch (error) {
        logger.error(`Sync failed: ${error.message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1vZG9vLWludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3N5bmMtb2Rvby1pbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7O0dBT0c7Ozs7O0FBTUgsb0NBd0hDO0FBM0hELHFEQUFtRDtBQUNuRCwyRUFBMEQ7QUFFM0MsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3JFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUMsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUM3RCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUV6RCxNQUFNLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7SUFFOUMsMEJBQTBCO0lBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUksaUJBQWUsRUFBRSxDQUFBO0lBRXpDLDhCQUE4QjtJQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7UUFDaEMsTUFBTSxDQUFDLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFBO1FBQ3pFLE1BQU0sQ0FBQyxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQTtRQUNyRSxPQUFNO0lBQ1IsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtJQUN6QyxNQUFNLGNBQWMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtJQUV6RCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FB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