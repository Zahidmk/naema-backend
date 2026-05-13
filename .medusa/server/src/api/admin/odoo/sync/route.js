"use strict";
/**
 * Odoo Sync Admin API
 * Endpoints for syncing products from Odoo to MedusaJS
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const service_1 = __importDefault(require("../../../../modules/odoo-sync/service"));
const odooService = new service_1.default();
/**
 * POST /admin/odoo/sync
 * Sync products from Odoo to MedusaJS
 */
async function POST(req, res) {
    try {
        const { limit = 100, dryRun = true } = req.body;
        if (!odooService.isConfigured()) {
            res.status(400).json({
                success: false,
                error: "Odoo is not configured. Please set environment variables.",
            });
            return;
        }
        console.log(`Starting Odoo sync (dryRun: ${dryRun}, limit: ${limit})`);
        // Fetch products from Odoo
        const odooProducts = await odooService.fetchProducts(limit, 0);
        console.log(`Fetched ${odooProducts.length} products from Odoo`);
        const result = {
            success: true,
            synced: 0,
            updated: 0,
            failed: 0,
            errors: [],
            products: [],
        };
        // Get the product service from the container
        const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
        for (const odooProduct of odooProducts) {
            try {
                const medusaProduct = odooService.convertToMedusaProduct(odooProduct);
                result.products.push(medusaProduct);
                if (!dryRun) {
                    // Check if product already exists by SKU
                    const existingProducts = await productService.listProducts({
                        q: medusaProduct.variants[0].sku,
                    });
                    const existingProduct = existingProducts.find((p) => p.variants?.some((v) => v.sku === medusaProduct.variants[0].sku));
                    if (existingProduct) {
                        // Update existing product
                        await productService.updateProducts(existingProduct.id, {
                            title: medusaProduct.title,
                            description: medusaProduct.description,
                            metadata: medusaProduct.metadata,
                        });
                        result.updated++;
                    }
                    else {
                        // Create new product
                        const productData = {
                            title: medusaProduct.title,
                            description: medusaProduct.description,
                            handle: medusaProduct.handle,
                            status: medusaProduct.status,
                            weight: medusaProduct.weight,
                            metadata: medusaProduct.metadata,
                        };
                        await productService.createProducts(productData);
                        result.synced++;
                    }
                }
                else {
                    result.synced++;
                }
            }
            catch (error) {
                result.failed++;
                result.errors.push(`Product ${odooProduct.name} (ID: ${odooProduct.id}): ${error.message}`);
            }
        }
        res.json({
            success: result.success,
            data: {
                dryRun,
                totalFetched: odooProducts.length,
                synced: result.synced,
                updated: result.updated,
                failed: result.failed,
                errors: result.errors,
                products: dryRun ? result.products : undefined,
            },
        });
    }
    catch (error) {
        console.error("Sync error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * GET /admin/odoo/sync
 * Get sync status and history
 */
async function GET(req, res) {
    try {
        const isConfigured = odooService.isConfigured();
        const config = odooService.getConfig();
        let odooStatus = null;
        if (isConfigured) {
            try {
                const connectionTest = await odooService.testConnection();
                odooStatus = connectionTest;
            }
            catch (error) {
                odooStatus = {
                    success: false,
                    message: error.message,
                };
            }
        }
        res.json({
            success: true,
            data: {
                configured: isConfigured,
                config: {
                    url: config.url,
                    dbName: config.dbName,
                    username: config.username,
                },
                odooStatus,
                endpoints: {
                    products: "/admin/odoo/products",
                    categories: "/admin/odoo/categories",
                    inventory: "/admin/odoo/inventory",
                    sync: "/admin/odoo/sync (POST)",
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29kb28vc3luYy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQXFCSCxvQkF5R0M7QUFNRCxrQkE2Q0M7QUE5S0QscURBQW1EO0FBQ25ELG9GQUFtRTtBQUVuRSxNQUFNLFdBQVcsR0FBRyxJQUFJLGlCQUFlLEVBQUUsQ0FBQTtBQVd6Qzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUFrQixFQUNsQixHQUFtQjtJQUVuQixJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBRzFDLENBQUE7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7WUFDaEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSwyREFBMkQ7YUFDbkUsQ0FBQyxDQUFBO1lBQ0YsT0FBTTtRQUNSLENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixNQUFNLFlBQVksS0FBSyxHQUFHLENBQUMsQ0FBQTtRQUV0RSwyQkFBMkI7UUFDM0IsTUFBTSxZQUFZLEdBQUcsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsWUFBWSxDQUFDLE1BQU0scUJBQXFCLENBQUMsQ0FBQTtRQUVoRSxNQUFNLE1BQU0sR0FBZTtZQUN6QixPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxDQUFDO1lBQ1QsT0FBTyxFQUFFLENBQUM7WUFDVixNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0s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