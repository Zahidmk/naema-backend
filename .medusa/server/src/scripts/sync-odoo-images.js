"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncOdooImages;
const axios_1 = __importDefault(require("axios"));
// Odoo configuration
const ODOO_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
const ODOO_DB = process.env.ODOO_DB_NAME || "oskarllc-new-27289548";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "SYG";
const ODOO_PASSWORD = process.env.ODOO_API_KEY || process.env.ODOO_PASSWORD || "S123456";
async function syncOdooImages({ container }) {
    console.log("\n🖼️  Starting Odoo Image Sync (Direct URL mode)...");
    console.log("=".repeat(50));
    // Authenticate with Odoo
    console.log("\n1️⃣  Authenticating with Odoo...");
    let uid;
    try {
        const authResponse = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {}]
            },
            id: 1
        });
        uid = authResponse.data.result;
        if (!uid) {
            console.error("❌ Authentication failed");
            return;
        }
        console.log(`✅ Authenticated (UID: ${uid})`);
    }
    catch (error) {
        console.error("❌ Authentication failed:", error.message);
        return;
    }
    // Get database connection
    const { Pool } = require("pg");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || "postgres://marqa_user:marqa123@localhost:5432/marqa_souq_dev",
    });
    // Get all products with odoo_id that don't have images yet
    console.log("\n2️⃣  Finding products that need images...");
    const productsResult = await pool.query(`
    SELECT p.id, p.title, p.metadata
    FROM product p
    WHERE p.metadata->>'odoo_id' IS NOT NULL
    AND p.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM image i 
      WHERE i.product_id = p.id 
      AND i.deleted_at IS NULL
    )
    ORDER BY p.created_at DESC
    LIMIT 300
  `);
    const productsWithoutImages = productsResult.rows;
    console.log(`📦 Found ${productsWithoutImages.length} products needing images`);
    if (productsWithoutImages.length === 0) {
        console.log("✅ All products already have images!");
        await pool.end();
        return;
    }
    // Get Odoo IDs for these products
    const odooIds = productsWithoutImages
        .map(p => p.metadata?.odoo_id)
        .filter(Boolean);
    // Fetch images from Odoo
    console.log("\n3️⃣  Fetching images from Odoo...");
    let odooProducts = [];
    try {
        const response = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_DB,
                    uid,
                    ODOO_PASSWORD,
                    "product.product",
                    "search_read",
                    [[["id", "in", odooIds]]],
                    {
                        fields: ["id", "name", "image_1920"],
                        limit: 500
                    }
                ]
            },
            id: 2
        });
        odooProducts = response.data.result || [];
        console.log(`✅ Fetched ${odooProducts.length} products from Odoo`);
    }
    catch (error) {
        console.error("❌ Failed to fetch from Odoo:", error.message);
        await pool.end();
        return;
    }
    // Create a set of Odoo IDs that have images
    const odooIdsWithImages = new Set();
    for (const product of odooProducts) {
        // Odoo returns image_1920 as base64 string if image exists, false if not
        if (product.image_1920 && product.image_1920 !== false) {
            odooIdsWithImages.add(product.id);
        }
    }
    console.log(`📷 Products with images: ${odooIdsWithImages.size}`);
    // Process and set direct Odoo image URLs
    console.log("\n4️⃣  Setting Odoo direct image URLs...");
    let savedCount = 0;
    let errorCount = 0;
    let noImageCount = 0;
    for (const product of productsWithoutImages) {
        const odooId = product.metadata?.odoo_id;
        if (!odooId)
            continue;
        if (!odooIdsWithImages.has(odooId)) {
            noImageCount++;
            continue;
        }
        try {
            // Use Odoo's direct public image URL instead of downloading
            const imageUrl = `${ODOO_URL}/web/image/product.product/${odooId}/image_1920`;
            // Insert image record into database
            const imageId = `img_odoo_${odooId}_${Date.now()}`;
            await pool.query(`INSERT INTO image (id, product_id, url, rank, created_at, updated_at)
         VALUES ($1, $2, $3, 0, NOW(), NOW())
         ON CONFLICT DO NOTHING`, [imageId, product.id, imageUrl]);
            // Also update the product thumbnail
            await pool.query(`UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = $2 AND (thumbnail IS NULL OR thumbnail LIKE '/static/%' OR thumbnail LIKE 'http://localhost%')`, [imageUrl, product.id]);
            savedCount++;
            if (savedCount % 20 === 0) {
                console.log(`  ✅ Set ${savedCount} image URLs...`);
            }
        }
        catch (error) {
            errorCount++;
            console.log(`  ❌ Error setting image for ${product.title}: ${error.message}`);
        }
    }
    // Close database connection
    await pool.end();
    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 IMAGE SYNC SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Image URLs set: ${savedCount}`);
    console.log(`📷 No image in Odoo: ${noImageCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`� URL pattern: ${ODOO_URL}/web/image/product.product/{id}/image_1920`);
    console.log("\n✅ Image sync completed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1vZG9vLWltYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3N5bmMtb2Rvby1pbWFnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUE2QkEsaUNBNEtDO0FBeE1ELGtEQUF5QjtBQXNCekIscUJBQXFCO0FBQ3JCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLDRDQUE0QyxDQUFBO0FBQ3JGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFBO0FBQ25FLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQTtBQUN4RCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUE7QUFFekUsS0FBSyxVQUFVLGNBQWMsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxDQUFDLENBQUE7SUFDbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFFNUIseUJBQXlCO0lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtJQUVqRCxJQUFJLEdBQVcsQ0FBQTtJQUNmLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsVUFBVSxFQUFFO1lBQzNELE9BQU8sRUFBRSxLQUFLO1lBQ2QsTUFBTSxFQUFFLE1BQU07WUFDZCxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLE1BQU0sRUFBRSxjQUFjO2dCQUN0QixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUs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