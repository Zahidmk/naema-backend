"use strict";
/**
 * Import Odoo Products to MedusaJS
 *
 * This script fetches all products from Odoo and creates them in MedusaJS.
 * It will replace the existing demo products with real Odoo products.
 *
 * Usage: npx medusa exec ./src/scripts/import-odoo-products.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = importOdooProducts;
const utils_1 = require("@medusajs/framework/utils");
const https_1 = __importDefault(require("https"));
// Odoo JSON-RPC helper
async function odooJsonRpc(hostname, db, uid, password, model, method, args) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [db, uid, password, model, method, ...args],
            },
            id: Date.now(),
        });
        const options = {
            hostname,
            port: 443,
            path: "/jsonrpc",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
            },
        };
        const req = https_1.default.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                try {
                    const result = JSON.parse(body);
                    if (result.error) {
                        reject(new Error(result.error.message || "Odoo error"));
                    }
                    else {
                        resolve(result.result);
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}
// Authenticate with Odoo
async function authenticateOdoo(hostname, db, username, password) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [db, username, password, {}],
            },
            id: 1,
        });
        const options = {
            hostname,
            port: 443,
            path: "/jsonrpc",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
            },
        };
        const req = https_1.default.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                try {
                    const result = JSON.parse(body);
                    if (result.result === false) {
                        reject(new Error("Authentication failed"));
                    }
                    else {
                        resolve(result.result);
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 100);
}
async function importOdooProducts({ container }) {
    const logger = container.resolve("logger");
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    const regionService = container.resolve(utils_1.Modules.REGION);
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    logger.info("=== ODOO PRODUCT IMPORT ===");
    logger.info("");
    // Get Odoo config from environment
    const odooUrl = process.env.ODOO_URL || "";
    const odooDb = process.env.ODOO_DB_NAME || "";
    const odooUsername = process.env.ODOO_USERNAME || "";
    const odooPassword = process.env.ODOO_PASSWORD || "";
    if (!odooUrl || !odooDb || !odooUsername || !odooPassword) {
        logger.error("Missing Odoo configuration. Please set:");
        logger.error("  ODOO_URL, ODOO_DB_NAME, ODOO_USERNAME, ODOO_PASSWORD");
        return;
    }
    const hostname = new URL(odooUrl).hostname;
    logger.info(`Connecting to Odoo: ${hostname}`);
    // Authenticate
    let uid;
    try {
        uid = await authenticateOdoo(hostname, odooDb, odooUsername, odooPassword);
        logger.info(`Authenticated with Odoo! UID: ${uid}`);
    }
    catch (error) {
        logger.error(`Authentication failed: ${error.message}`);
        return;
    }
    // Fetch products from Odoo
    logger.info("Fetching products from Odoo...");
    let odooProducts;
    try {
        odooProducts = await odooJsonRpc(hostname, odooDb, uid, odooPassword, "product.product", "search_read", [
            [[["sale_ok", "=", true]]],
            {
                fields: [
                    "id",
                    "name",
                    "default_code",
                    "list_price",
                    "standard_price",
                    "description_sale",
                    "categ_id",
                    "qty_available",
                    "barcode",
                    "weight",
                ],
                limit: 500,
            },
        ]);
        logger.info(`Fetched ${odooProducts.length} products from Odoo`);
    }
    catch (error) {
        logger.error(`Failed to fetch products: ${error.message}`);
        return;
    }
    // Get default region and sales channel
    const regions = await regionService.listRegions({}, { take: 1 });
    const salesChannels = await salesChannelService.listSalesChannels({}, { take: 1 });
    if (regions.length === 0) {
        logger.error("No regions found. Please create a region first.");
        return;
    }
    const defaultRegion = regions[0];
    const defaultSalesChannel = salesChannels[0];
    logger.info(`Using region: ${defaultRegion.name}`);
    logger.info(`Using sales channel: ${defaultSalesChannel?.name || "None"}`);
    // Get existing products
    const existingProducts = await productService.listProducts({}, { take: 1000 });
    logger.info(`Found ${existingProducts.length} existing products in MedusaJS`);
    // Option 1: Delete old demo products first (uncomment if needed)
    // logger.info("Deleting old demo products...")
    // for (const product of existingProducts) {
    //   if (!product.metadata?.odoo_id) {
    //     await productService.deleteProducts([product.id])
    //     logger.info(`Deleted: ${product.title}`)
    //   }
    // }
    let created = 0;
    let updated = 0;
    let errors = [];
    for (const odooProduct of odooProducts) {
        try {
            const sku = odooProduct.default_code || `ODOO-${odooProduct.id}`;
            const handle = slugify(odooProduct.name);
            // Check if product already exists (by odoo_id in metadata)
            const existingProduct = existingProducts.find((p) => p.metadata?.odoo_id === odooProduct.id);
            if (existingProduct) {
                // Update existing product
                await productService.updateProducts(existingProduct.id, {
                    title: odooProduct.name,
                    description: odooProduct.description_sale || undefined,
                    metadata: {
                        ...existingProduct.metadata,
                        odoo_id: odooProduct.id,
                        odoo_sku: sku,
                        odoo_category: odooProduct.categ_id ? odooProduct.categ_id[1] : null,
                        odoo_stock: odooProduct.qty_available,
                        odoo_last_sync: new Date().toISOString(),
                    },
                });
                updated++;
            }
            else {
                // Create new product
                const newProduct = await productService.createProducts({
                    title: odooProduct.name,
                    handle: handle,
                    description: odooProduct.description_sale || undefined,
                    status: "published",
                    metadata: {
                        odoo_id: odooProduct.id,
                        odoo_sku: sku,
                        odoo_category: odooProduct.categ_id ? odooProduct.categ_id[1] : null,
                        odoo_stock: odooProduct.qty_available,
                        odoo_barcode: odooProduct.barcode || null,
                        odoo_price: odooProduct.list_price,
                        odoo_last_sync: new Date().toISOString(),
                    },
                    variants: [
                        {
                            title: "Default",
                            sku: sku,
                            barcode: odooProduct.barcode || undefined,
                            manage_inventory: true,
                            metadata: {
                                odoo_stock: odooProduct.qty_available,
                                odoo_price: odooProduct.list_price,
                            },
                        },
                    ],
                    options: [],
                });
                created++;
                logger.info(`Created: ${odooProduct.name} (${sku}) - ${odooProduct.list_price} AED`);
            }
        }
        catch (error) {
            errors.push(`${odooProduct.name}: ${error.message}`);
            logger.warn(`Error with ${odooProduct.name}: ${error.message}`);
        }
    }
    logger.info("");
    logger.info("=== IMPORT SUMMARY ===");
    logger.info(`Created: ${created}`);
    logger.info(`Updated: ${updated}`);
    logger.info(`Errors: ${errors.length}`);
    if (errors.length > 0) {
        logger.info("Error details:");
        errors.slice(0, 10).forEach((e) => logger.info(`  - ${e}`));
    }
    logger.info("");
    logger.info("Import complete! Refresh the admin dashboard to see the new products.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LW9kb28tcHJvZHVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9pbXBvcnQtb2Rvby1wcm9kdWN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7R0FPRzs7Ozs7QUF5SUgscUNBaUxDO0FBdlRELHFEQUFtRDtBQUNuRCxrREFBeUI7QUFnQnpCLHVCQUF1QjtBQUN2QixLQUFLLFVBQVUsV0FBVyxDQUN4QixRQUFnQixFQUNoQixFQUFVLEVBQ1YsR0FBVyxFQUNYLFFBQWdCLEVBQ2hCLEtBQWEsRUFDYixNQUFjLEVBQ2QsSUFBVztJQUVYLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUMxQixPQUFPLEVBQUUsS0FBSztZQUNkLE1BQU0sRUFBRSxNQUFNO1lBQ2QsTUFBTSxFQUFFO2dCQUNOLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQzthQUNsRDtZQUNELEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1NBQ2YsQ0FBQyxDQUFBO1FBRUYsTUFBTSxPQUFPLEdBQUc7WUFDZCxRQUFRO1lBQ1IsSUFBSSxFQUFFLEdBQUc7WUFDVCxJQUFJLEVBQUUsVUFBVTtZQUNoQixNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQzthQUMxQztTQUNGLENBQUE7UUFFRCxNQUFNLEdBQUcsR0FBRyxlQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxD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