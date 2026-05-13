"use strict";
/**
 * Sync Brands + Categories from Odoo → MedusaJS
 *
 * - Downloads brand logos from Odoo (base64 → saves as file on server)
 * - Downloads category images from Odoo (base64 → saves as file on server)
 * - Deletes old dummy categories (Unsplash/placeholder images)
 * - Creates/updates real categories from Odoo public categories
 * - Creates/updates brands with real logo URLs
 *
 * Usage: npx medusa exec ./src/scripts/sync-brands-categories.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncBrandsCategories;
const utils_1 = require("@medusajs/framework/utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const service_1 = __importDefault(require("../modules/odoo-sync/service"));
// ─────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────
const ODOO_BASE_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
// Where to save images on the server
const BRANDS_UPLOAD_DIR = path_1.default.join(process.cwd(), "static", "uploads", "brands");
const CATEGORIES_UPLOAD_DIR = path_1.default.join(process.cwd(), "static", "uploads", "categories");
// Public URL prefix (served by MedusaJS static middleware)
const BRANDS_URL_PREFIX = "/static/uploads/brands";
const CATEGORIES_URL_PREFIX = "/static/uploads/categories";
// ─────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 100);
}
/**
 * Save a base64 image string to disk.
 * Returns the public URL or null if no image data.
 */
function saveBase64Image(base64Data, dir, filename) {
    if (!base64Data || typeof base64Data !== "string")
        return null;
    // Odoo returns base64 without data: prefix
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 100)
        return null; // empty / corrupt
    // Detect image type from magic bytes
    let ext = "jpg";
    if (buffer[0] === 0x89 && buffer[1] === 0x50)
        ext = "png";
    else if (buffer[0] === 0x47 && buffer[1] === 0x49)
        ext = "gif";
    else if (buffer[0] === 0x52 && buffer[1] === 0x49)
        ext = "webp";
    const fullFilename = `${filename}.${ext}`;
    const filePath = path_1.default.join(dir, fullFilename);
    fs_1.default.writeFileSync(filePath, buffer);
    return fullFilename;
}
/**
 * Ensure upload directory exists
 */
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
        console.log(`   📁 Created directory: ${dir}`);
    }
}
// ─────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────
async function syncBrandsCategories({ container }) {
    const pgConnection = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    let brandService;
    try {
        brandService = container.resolve("brands");
    }
    catch {
        console.error("❌ Brands module not available");
        return;
    }
    console.log("\n" + "═".repeat(60));
    console.log("  🔄 ODOO → BRANDS + CATEGORIES SYNC");
    console.log("  📅 " + new Date().toISOString());
    console.log("═".repeat(60));
    // ── Connect to Odoo ──
    const odoo = new service_1.default();
    if (!odoo.isConfigured()) {
        console.error("❌ Odoo not configured. Check ODOO_URL, ODOO_DB_NAME, ODOO_USERNAME, ODOO_API_KEY in .env");
        return;
    }
    const connectionTest = await odoo.testConnection();
    if (!connectionTest.success) {
        console.error("❌ Odoo connection failed:", connectionTest.message);
        return;
    }
    console.log(`\n✅ Connected to Odoo (${ODOO_BASE_URL})`);
    // Ensure upload directories exist
    ensureDir(BRANDS_UPLOAD_DIR);
    ensureDir(CATEGORIES_UPLOAD_DIR);
    // ══════════════════════════════════════════════
    //  PART 1 — BRANDS
    // ══════════════════════════════════════════════
    console.log("\n" + "─".repeat(60));
    console.log("  🏷️  SYNCING BRANDS");
    console.log("─".repeat(60));
    let odooBrands = [];
    try {
        odooBrands = await odoo.fetchBrands();
        console.log(`\n   📥 Fetched ${odooBrands.length} brands from Odoo`);
    }
    catch (err) {
        console.warn(`   ⚠️  Could not fetch brands: ${err.message}`);
    }
    let brandsCreated = 0;
    let brandsUpdated = 0;
    let brandsNoLogo = 0;
    for (const odooBrand of odooBrands) {
        try {
            const slug = slugify(odooBrand.name);
            // Save logo image from base64
            let logoUrl = null;
            if (odooBrand.logo && typeof odooBrand.logo === "string") {
                const filename = saveBase64Image(odooBrand.logo, BRANDS_UPLOAD_DIR, `brand-${slug}`);
                if (filename) {
                    logoUrl = `${BRANDS_URL_PREFIX}/${filename}`;
                    console.log(`   🖼️  Logo saved: ${odooBrand.name} → ${filename}`);
                }
                else {
                    brandsNoLogo++;
                    console.log(`   ⚠️  No logo data for brand: ${odooBrand.name}`);
                }
            }
            else {
                brandsNoLogo++;
                console.log(`   ⚠️  Brand "${odooBrand.name}" has no logo in Odoo`);
            }
            // Check if brand exists
            const existing = await brandService.listBrands({ slug });
            if (existing.length === 0) {
                // Create new brand
                await brandService.createBrands({
                    name: odooBrand.name,
                    slug,
                    description: odooBrand.description || null,
                    logo_url: logoUrl,
                    is_active: true,
                });
                brandsCreated++;
                console.log(`   ✅ Created brand: ${odooBrand.name}`);
            }
            else {
                // Update existing brand logo_url
                await pgConnection.raw(`UPDATE brand SET logo_url = ?, updated_at = NOW() WHERE id = ?`, [logoUrl, existing[0].id]);
                brandsUpdated++;
                console.log(`   📝 Updated brand: ${odooBrand.name}`);
            }
        }
        catch (err) {
            console.warn(`   ❌ Brand "${odooBrand.name}" failed: ${err.message}`);
        }
    }
    console.log(`\n   ✅ Created: ${brandsCreated}`);
    console.log(`   📝 Updated: ${brandsUpdated}`);
    console.log(`   ⚠️  No logo (ask Odoo dev to add): ${brandsNoLogo}`);
    // ══════════════════════════════════════════════
    //  PART 2 — CATEGORIES
    // ══════════════════════════════════════════════
    console.log("\n" + "─".repeat(60));
    console.log("  📁 SYNCING CATEGORIES");
    console.log("─".repeat(60));
    let odooCategories = [];
    try {
        odooCategories = await odoo.fetchPublicCategories();
        console.log(`\n   📥 Fetched ${odooCategories.length} categories from Odoo`);
    }
    catch (err) {
        console.error(`   ❌ Could not fetch categories: ${err.message}`);
        return;
    }
    if (odooCategories.length === 0) {
        console.log("   ⚠️  No categories found in Odoo. Ask Odoo developer to add them.");
        return;
    }
    // ── Step 1: Delete old dummy categories ──
    console.log("\n   🗑️  Removing old dummy categories...");
    try {
        // Soft-delete all existing categories
        await pgConnection.raw(`UPDATE product_category SET deleted_at = NOW() WHERE deleted_at IS NULL`);
        console.log("   ✅ Old categories cleared");
    }
    catch (err) {
        console.warn(`   ⚠️  Could not clear old categories: ${err.message}`);
    }
    // ── Step 2: Build parent→children map for ordering ──
    // Process parent categories first, then children
    const rootCategories = odooCategories.filter(c => !c.parent_id);
    const childCategories = odooCategories.filter(c => !!c.parent_id);
    console.log(`\n   📊 Root categories: ${rootCategories.length}, Sub-categories: ${childCategories.length}`);
    let catsCreated = 0;
    let catsNoImage = 0;
    // Map Odoo category ID → Medusa category handle (for parent linking)
    const odooIdToHandle = new Map();
    // ── Step 3: Create root categories first ──
    console.log("\n   Creating root categories...");
    for (const oCategory of rootCategories) {
        await createOrUpdateCategory(oCategory, null, pgConnection, productService, {
            odooIdToHandle,
            catsCreated: () => catsCreated++,
            catsNoImage: () => catsNoImage++,
        });
    }
    // ── Step 4: Create child categories ──
    console.log("\n   Creating sub-categories...");
    for (const oCategory of childCategories) {
        const parentOdooId = Array.isArray(oCategory.parent_id) ? oCategory.parent_id[0] : null;
        const parentHandle = parentOdooId ? odooIdToHandle.get(parentOdooId) : null;
        let parentMedusaId = null;
        if (parentHandle) {
            const parentRows = await pgConnection.raw(`SELECT id FROM product_category WHERE handle = ? AND deleted_at IS NULL LIMIT 1`, [parentHandle]);
            parentMedusaId = parentRows.rows[0]?.id || null;
        }
        await createOrUpdateCategory(oCategory, parentMedusaId, pgConnection, productService, {
            odooIdToHandle,
            catsCreated: () => catsCreated++,
            catsNoImage: () => catsNoImage++,
        });
    }
    console.log(`\n   ✅ Created: ${catsCreated}`);
    console.log(`   ⚠️  No image (ask Odoo dev to add): ${catsNoImage}`);
    // ══════════════════════════════════════════════
    //  DONE
    // ══════════════════════════════════════════════
    console.log("\n" + "═".repeat(60));
    console.log("  ✅ SYNC COMPLETE");
    console.log("═".repeat(60));
    console.log(`   🏷️  Brands: ${brandsCreated} created, ${brandsUpdated} updated, ${brandsNoLogo} missing logo`);
    console.log(`   📁 Categories: ${catsCreated} created, ${catsNoImage} missing image`);
    if (brandsNoLogo > 0 || catsNoImage > 0) {
        console.log(`\n   📢 Action needed: Ask Odoo developer to add missing images.`);
        console.log(`      Then re-run: npx medusa exec ./src/scripts/sync-brands-categories.ts`);
    }
    console.log("═".repeat(60) + "\n");
}
// ─────────────────────────────────────────────────
//  HELPER — Create or update a single category
// ─────────────────────────────────────────────────
async function createOrUpdateCategory(oCategory, parentMedusaId, pgConnection, productService, counters) {
    try {
        const handle = slugify(oCategory.name);
        counters.odooIdToHandle.set(oCategory.id, handle);
        // Save category image from base64
        let imageUrl = null;
        if (oCategory.image_128 && typeof oCategory.image_128 === "string") {
            const filename = saveBase64Image(oCategory.image_128, CATEGORIES_UPLOAD_DIR, `cat-${handle}`);
            if (filename) {
                imageUrl = `${CATEGORIES_URL_PREFIX}/${filename}`;
                console.log(`   🖼️  Image saved: ${oCategory.name} → ${filename}`);
            }
            else {
                counters.catsNoImage();
                console.log(`   ⚠️  No image data for category: ${oCategory.name}`);
            }
        }
        else {
            counters.catsNoImage();
            console.log(`   ⚠️  Category "${oCategory.name}" has no image in Odoo`);
        }
        // Check if category already exists (even soft-deleted, we restore it)
        const existing = await pgConnection.raw(`SELECT id FROM product_category WHERE handle = ? LIMIT 1`, [handle]);
        const metadata = {
            image_url: imageUrl,
            odoo_id: oCategory.id,
        };
        if (existing.rows.length > 0) {
            // Restore + update
            await pgConnection.raw(`UPDATE product_category 
         SET name = ?, parent_category_id = ?, metadata = ?, is_active = true, deleted_at = NULL, updated_at = NOW()
         WHERE handle = ?`, [oCategory.name, parentMedusaId, JSON.stringify(metadata), handle]);
        }
        else {
            // Create new
            await productService.createProductCategories({
                name: oCategory.name,
                handle,
                parent_category_id: parentMedusaId,
                is_active: true,
                metadata,
            });
        }
        counters.catsCreated();
        console.log(`   ✅ ${parentMedusaId ? "  " : ""}${oCategory.name}${imageUrl ? " 🖼️" : " (no image)"}`);
    }
    catch (err) {
        console.warn(`   ❌ Category "${oCategory.name}" failed: ${err.message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1icmFuZHMtY2F0ZWdvcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3N5bmMtYnJhbmRzLWNhdGVnb3JpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7O0dBVUc7Ozs7O0FBeUVILHVDQTJNQztBQWpSRCxxREFBOEU7QUFDOUUsNENBQW1CO0FBQ25CLGdEQUF1QjtBQUN2QiwyRUFBNkY7QUFFN0Ysb0RBQW9EO0FBQ3BELFVBQVU7QUFDVixvREFBb0Q7QUFFcEQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksNENBQTRDLENBQUE7QUFFMUYscUNBQXFDO0FBQ3JDLE1BQU0saUJBQWlCLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUNqRixNQUFNLHFCQUFxQixHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUE7QUFFekYsMkRBQTJEO0FBQzNELE1BQU0saUJBQWlCLEdBQUcsd0JBQXdCLENBQUE7QUFDbEQsTUFBTSxxQkFBcUIsR0FBRyw0QkFBNEIsQ0FBQTtBQUUxRCxvREFBb0Q7QUFDcEQsV0FBVztBQUNYLG9EQUFvRDtBQUVwRCxTQUFTLE9BQU8sQ0FBQyxJQUFZO0lBQzNCLE9BQU8sSUFBSTtTQUNSLFdBQVcsRUFBRTtTQUNiLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO1NBQzVCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO1NBQ3ZCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDdEIsQ0FBQztBQUVEOzs7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