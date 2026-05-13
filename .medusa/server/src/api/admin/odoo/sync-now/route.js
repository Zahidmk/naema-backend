"use strict";
/**
 * Manual Odoo Sync Endpoint
 * POST /admin/odoo/sync-now - Trigger immediate sync
 * GET /admin/odoo/sync-status - Check sync status
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const https_1 = __importDefault(require("https"));
const ODOO_CONFIG = {
    url: process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com",
    db: process.env.ODOO_DB_NAME || "oskarllc-new-27289548",
    username: process.env.ODOO_USERNAME || "SYG",
    password: process.env.ODOO_PASSWORD || "S123456",
};
async function odooJsonRpc(params) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params,
            id: Date.now(),
        });
        const url = new URL(ODOO_CONFIG.url);
        const options = {
            hostname: url.hostname,
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
                    resolve(result.result);
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
// POST /admin/odoo/sync-now - Trigger immediate full sync
async function POST(req, res) {
    const { Pool } = require("pg");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || "postgres://marqa_user:marqa123@localhost:5432/marqa_souq_dev",
    });
    try {
        // Authenticate with Odoo
        const uid = await odooJsonRpc({
            service: "common",
            method: "authenticate",
            args: [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.password, {}],
        });
        if (!uid) {
            return res.status(401).json({ success: false, error: "Failed to authenticate with Odoo" });
        }
        // Fetch ALL products from Odoo
        const odooProducts = await odooJsonRpc({
            service: "object",
            method: "execute_kw",
            args: [
                ODOO_CONFIG.db,
                uid,
                ODOO_CONFIG.password,
                "product.product",
                "search_read",
                [[["sale_ok", "=", true]]],
                {
                    fields: ["id", "name", "default_code", "list_price", "barcode", "categ_id", "qty_available", "image_1920"],
                    limit: 1000,
                },
            ],
        });
        // Get existing products
        const existingProducts = await pool.query("SELECT id, handle, metadata FROM product");
        const existingOdooIds = new Set(existingProducts.rows
            .filter((p) => p.metadata?.odoo_id)
            .map((p) => p.metadata.odoo_id));
        const existingHandles = new Set(existingProducts.rows.map((p) => p.handle));
        // Get sales channel
        const salesChannelResult = await pool.query("SELECT id FROM sales_channel LIMIT 1");
        const salesChannelId = salesChannelResult.rows[0]?.id;
        let imported = 0;
        let skipped = 0;
        for (const product of odooProducts) {
            // Skip if already imported
            if (existingOdooIds.has(product.id)) {
                skipped++;
                continue;
            }
            const handle = product.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")
                .substring(0, 100);
            // Skip if handle exists
            if (existingHandles.has(handle)) {
                skipped++;
                continue;
            }
            const sku = product.default_code || `ODOO-${product.id}`;
            try {
                const productId = `prod_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
                // Create product
                await pool.query(`INSERT INTO product (id, title, handle, status, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, 'published', $4, NOW(), NOW())`, [
                    productId,
                    product.name,
                    handle,
                    JSON.stringify({
                        odoo_id: product.id,
                        odoo_sku: sku,
                        odoo_category: product.categ_id ? product.categ_id[1] : null,
                    }),
                ]);
                // Create variant
                const variantId = `variant_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
                await pool.query(`INSERT INTO product_variant (id, product_id, title, sku, metadata, created_at, updated_at)
           VALUES ($1, $2, 'Default', $3, $4, NOW(), NOW())`, [variantId, productId, sku, JSON.stringify({ odoo_id: product.id })]);
                // Add to sales channel
                if (salesChannelId) {
                    await pool.query(`INSERT INTO product_sales_channel (product_id, sales_channel_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [productId, salesChannelId]);
                }
                // Add image if exists
                if (product.image_1920) {
                    const imageUrl = `${ODOO_CONFIG.url}/web/image/product.product/${product.id}/image_1920`;
                    await pool.query(`INSERT INTO product_image (id, product_id, url, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())`, [`img_${Date.now()}${Math.random().toString(36).substr(2, 9)}`, productId, imageUrl]);
                }
                existingHandles.add(handle);
                existingOdooIds.add(product.id);
                imported++;
            }
            catch (error) {
                console.error(`Failed to import ${product.name}:`, error.message);
            }
        }
        await pool.end();
        res.json({
            success: true,
            message: `Sync completed! Imported ${imported} new products, skipped ${skipped} existing.`,
            stats: {
                odoo_total: odooProducts.length,
                imported,
                skipped,
                medusa_total: existingProducts.rows.length + imported,
            },
        });
    }
    catch (error) {
        await pool.end();
        res.status(500).json({ success: false, error: error.message });
    }
}
// GET /admin/odoo/sync-now - Get sync status
async function GET(req, res) {
    const { Pool } = require("pg");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || "postgres://marqa_user:marqa123@localhost:5432/marqa_souq_dev",
    });
    try {
        // Get Odoo product count
        const uid = await odooJsonRpc({
            service: "common",
            method: "authenticate",
            args: [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.password, {}],
        });
        const odooCount = await odooJsonRpc({
            service: "object",
            method: "execute_kw",
            args: [
                ODOO_CONFIG.db,
                uid,
                ODOO_CONFIG.password,
                "product.product",
                "search_count",
                [[["sale_ok", "=", true]]],
            ],
        });
        // Get MedusaJS product count
        const medusaResult = await pool.query("SELECT COUNT(*) as count FROM product");
        const medusaCount = parseInt(medusaResult.rows[0].count);
        // Get last sync time
        let lastSync = null;
        try {
            const syncResult = await pool.query("SELECT value FROM system_config WHERE key = 'odoo_last_sync'");
            lastSync = syncResult.rows[0]?.value;
        }
        catch (e) { }
        await pool.end();
        res.json({
            success: true,
            odoo_products: odooCount,
            medusa_products: medusaCount,
            missing: odooCount - medusaCount,
            last_sync: lastSync,
            auto_sync_enabled: true,
            auto_sync_interval: "5 minutes",
        });
    }
    catch (error) {
        await pool.end();
        res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29kb28vc3luYy1ub3cvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7Ozs7O0FBcURILG9CQStJQztBQUdELGtCQXFEQztBQXpQRCxrREFBeUI7QUFFekIsTUFBTSxXQUFXLEdBQUc7SUFDbEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLDRDQUE0QztJQUN6RSxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksdUJBQXVCO0lBQ3ZELFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxLQUFLO0lBQzVDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTO0NBQ2pELENBQUE7QUFFRCxLQUFLLFVBQVUsV0FBVyxDQUFDLE1BQVc7SUFDcEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzFCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsTUFBTSxFQUFFLE1BQU07WUFDZCxNQUFNO1lBQ04sRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7U0FDZixDQUFDLENBQUE7UUFFRixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEMsTUFBTSxPQUFPLEdBQUc7WUFDZCxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7WUFDdEIsSUFBSSxFQUFFLEdBQUc7WUFDVCxJQUFJLEVBQUUsVUFBVTtZQUNoQixNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQzthQUMxQztTQUNGLENBQUE7UUFFRCxNQUFNLEdBQUcsR0FBRyxlQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3pDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtZQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFBO1lBQzFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDakIsSUFBSSxDQUFDO29CQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQy9CLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBQ3hCLENBQUM7Z0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDWCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ1gsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7UUFFRixHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUN2QixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2YsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ1gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsMERBQTBEO0FBQ25ELEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDO1FBQ3BCLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLDhEQUE4RDtLQUM3RyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUM7UUFDSCx5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxXQUFXLENBQUM7WUFDNUIsT0FBTyxFQUFFLFFBQVE7WUFDakIsTUFBTSxFQUFFLGNBQWM7WUFDdEIsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO1NBQ3ZFLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNULE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxrQ0FBa0MsRUFBRSxDQUFDLENBQUE7UUFDNUYsQ0FBQztRQUVELCtCQUErQjtRQUMvQixNQUFNLFlBQVksR0FBRyxNQUFNLFdBQVcsQ0FBQztZQUNyQyxPQUFPLEVBQUUsUUFBUTtZQUNqQixNQUFNLEVBQUUsWUFBWTtZQUNwQixJQUFJLEVBQUU7Z0JBQ0osV0FBVyxDQUFDLEVBQUU7Z0JBQ2QsR0FBRztnQkFDSCxXQUFXLENBQUMsUUFBUTtnQkFDcEIsaUJBQWlCO2dCQUNqQixhQUFhO2dCQUNiLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDMUI7b0JBQ0UsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQztvQkFDMUcsS0FBSyxFQUFFLElBQUk7aUJBQ1o7YUFDRjtTQUNGLENBQUMsQ0FBQTtRQUVGLHdCQUF3QjtRQUN4QixNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO1FBQ3JGLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUM3QixnQkFBZ0IsQ0FBQyxJQUFJO2FBQ2xCLE1BQU0sQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7YUFDdkMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUN2QyxDQUFBO1FBQ0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFFaEYsb0JBQW9CO1FBQ3BCLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUE7UUFDbkYsTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQTtRQUVyRCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUE7UUFDaEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFBO1FBRWYsS0FBSyxNQUFNLE9BQU8sSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNuQywyQkFBMkI7WUFDM0IsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxPQUFPLEVBQUUsQ0FBQTtnQkFDVCxTQUFRO1lBQ1YsQ0FBQztZQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJO2lCQUN4QixXQUFXLEVBQUU7aUJBQ2IsT0FBTyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUM7aUJBQzNCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO2lCQUNuQixPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztpQkFDckIsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUVwQix3QkFBd0I7WUFDeEIsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLE9BQU8sRUFBRSxDQUFBO2dCQUNULFNBQVE7WUFDVixDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFlBQVksSUFBSSxRQUFRLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQTtZQUV4RCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxTQUFTLEdBQUcsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUE7Z0JBRWhGLGlCQUFpQjtnQkFDakIsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUNkOzhEQUNvRCxFQUNwRDtvQkFDRSxTQUFTO29CQUNULE9BQU8sQ0FBQyxJQUFJO29CQUNaLE1BQU07b0JBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7d0JBQ25CLFFBQVEsRUFBRSxHQUFHO3dCQUNiLGFBQWEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO3FCQUM3RCxDQUFDO2lCQUNILENBQ0YsQ0FBQTtnQkFFRCxpQkFBaUI7Z0JBQ2pCLE1BQU0sU0FBUyxHQUFHLFdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFBO2dCQUNuRixNQUFNLElBQUksQ0FBQyxLQUFLLENBQ2Q7NERBQ2tELEVBQ2xELENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUNyRSxDQUFBO2dCQUVELHVCQUF1QjtnQkFDdkIsSUFBSSxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUNkLHlHQUF5RyxFQUN6RyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FDNUIsQ0FBQTtnQkFDSCxDQUFDO2dCQUVELHNCQUFzQjtnQkFDdEIsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsOEJBQThCLE9BQU8sQ0FBQyxFQUFFLGFBQWEsQ0FBQTtvQkFDeEYsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUNkOytDQUNtQyxFQUNuQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FDckYsQ0FBQTtnQkFDSCxDQUFDO2dCQUVELGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7Z0JBQzNCLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUMvQixRQUFRLEVBQUUsQ0FBQTtZQUNaLENBQUM7WUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO2dCQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixPQUFPLENBQUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ25FLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7UUFFaEIsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNQLE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTyxFQUFFLDRCQUE0QixRQUFRLDBCQUEwQixPQUFPLFlBQVk7WUFDMUYsS0FBSyxFQUFFO2dCQUNMLFVBQVUsRUFBRSxZQUFZLENBQUMsTUFBTTtnQkFDL0IsUUFBUTtnQkFDUixPQUFPO2dCQUNQLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVE7YUFDdEQ7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ2hFLENBQUM7QUFDSCxDQUFDO0FBRUQsNkNBQTZDO0FBQ3RDLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDO1FBQ3BCLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLDhEQUE4RDtLQUM3RyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUM7UUFDSCx5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxXQUFXLENBQUM7WUFDNUIsT0FBTyxFQUFFLFFBQVE7WUFDakIsTUFBTSxFQUFFLGNBQWM7WUFDdEIsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO1NBQ3ZFLENBQUMsQ0FBQTtRQUVGLE1BQU0sU0FBUyxHQUFHLE1BQU0sV0FBVyxDQUFDO1lBQ2xDLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLElBQUksRUFBRTtnQkFDSixXQUFXLENBQUMsRUFBRTtnQkFDZCxHQUFHO2dCQUNILFdBQVcsQ0FBQyxRQUFRO2dCQUNwQixpQkFBaUI7Z0JBQ2pCLGNBQWM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsNkJBQTZCO1FBQzdCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFBO1FBQzlFLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXhELHFCQUFxQjtRQUNyQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUE7UUFDbkIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLDhEQUE4RCxDQUFDLENBQUE7WUFDbkcsUUFBUSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFBO1FBQ3RDLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQztRQUVkLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBRWhCLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxPQUFPLEVBQUUsSUFBSTtZQUNiLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLGVBQWUsRUFBRSxXQUFXO1lBQzVCLE9BQU8sRUFBRSxTQUFTLEdBQUcsV0FBVztZQUNoQyxTQUFTLEVBQUUsUUFBUTtZQUNuQixpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLGtCQUFrQixFQUFFLFdBQVc7U0FDaEMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDaEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0FBQ0gsQ0FBQyJ9