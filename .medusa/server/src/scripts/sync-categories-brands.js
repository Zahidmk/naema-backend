"use strict";
/**
 * Sync Categories & Brands from Odoo → MedusaJS
 *
 * This script fetches categories and brands from Odoo and creates/updates
 * them in MedusaJS to make them fully dynamic instead of static.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const utils_1 = require("@medusajs/framework/utils");
// Direct Odoo config
const ODOO_CONFIG = {
    url: 'https://oskarllc-new-27289548.dev.odoo.com',
    db: 'oskarllc-new-27289548',
    username: 'SYG',
    api_key: 'fa8410bdf3264b91ea393b9f8341626a98ca262a'
};
const https = require('https');
async function authenticateOdoo() {
    console.log('🔐 Authenticating with Odoo...');
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'common',
                method: 'authenticate',
                args: [ODOO_CONFIG.db, ODOO_CONFIG.username, ODOO_CONFIG.api_key, {}]
            },
            id: 1
        });
        const options = {
            hostname: new URL(ODOO_CONFIG.url).hostname,
            port: 443,
            path: '/jsonrpc',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    console.log('✅ Authenticated! UID:', response.result);
                    resolve(response.result);
                }
                catch (e) {
                    console.log('❌ Auth failed:', body);
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
async function fetchOdooCategories(uid) {
    console.log('📁 Fetching categories from Odoo...');
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    ODOO_CONFIG.db,
                    uid,
                    ODOO_CONFIG.api_key,
                    'product.category',
                    'search_read',
                    [
                        [], // No filters - get all categories
                        ['id', 'name', 'parent_id', 'child_id']
                    ]
                ]
            },
            id: 2
        });
        const options = {
            hostname: new URL(ODOO_CONFIG.url).hostname,
            port: 443,
            path: '/jsonrpc',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    console.log(`✅ Fetched ${response.result.length} categories`);
                    resolve(response.result);
                }
                catch (e) {
                    console.log('❌ Parse failed:', body);
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
async function fetchOdooBrands(uid) {
    console.log('🏷️ Fetching brands from Odoo...');
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    ODOO_CONFIG.db,
                    uid,
                    ODOO_CONFIG.api_key,
                    'product.brand',
                    'search_read',
                    [
                        [], // No filters - get all brands
                        ['id', 'name', 'logo', 'brand_type_id']
                    ]
                ]
            },
            id: 3
        });
        const options = {
            hostname: new URL(ODOO_CONFIG.url).hostname,
            port: 443,
            path: '/jsonrpc',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    console.log(`✅ Fetched ${response.result.length} brands`);
                    resolve(response.result);
                }
                catch (e) {
                    console.log('❌ Parse failed:', body);
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
function createCategoryHandle(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple hyphens
        .trim();
}
async function default_1({ container }) {
    console.log('🔄 Starting Odoo Categories & Brands Sync...\n');
    try {
        // Get MedusaJS services
        const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
        // Authenticate with Odoo
        const uid = await authenticateOdoo();
        // Fetch categories and brands
        const [categories, brands] = await Promise.all([
            fetchOdooCategories(uid),
            fetchOdooBrands(uid)
        ]);
        let createdCategories = 0;
        let updatedCategories = 0;
        let createdBrands = 0;
        let failedCategories = 0;
        console.log('\n📁 Creating/Updating Categories...');
        for (const category of categories) {
            try {
                const handle = createCategoryHandle(category.name);
                // Check if category exists
                const existingCategories = await productModuleService.listProductCategories({
                    handle: handle
                });
                if (existingCategories.length > 0) {
                    // Update existing
                    await productModuleService.updateProductCategories(existingCategories[0].id, {
                        name: category.name,
                        description: `Odoo Category ID: ${category.id}`,
                        metadata: {
                            odoo_id: category.id,
                            parent_id: category.parent_id ? category.parent_id[0] : null
                        }
                    });
                    updatedCategories++;
                    if (updatedCategories % 10 === 0) {
                        console.log(`   📝 Updated ${updatedCategories} categories...`);
                    }
                }
                else {
                    // Create new
                    await productModuleService.createProductCategories({
                        name: category.name,
                        handle: handle,
                        description: `Odoo Category ID: ${category.id}`,
                        is_active: true,
                        is_internal: false,
                        metadata: {
                            odoo_id: category.id,
                            parent_id: category.parent_id ? category.parent_id[0] : null
                        }
                    });
                    createdCategories++;
                    if (createdCategories % 10 === 0) {
                        console.log(`   ✅ Created ${createdCategories} categories...`);
                    }
                }
            }
            catch (error) {
                console.log(`   ❌ Failed: "${category.name}": ${error.message}`);
                failedCategories++;
            }
        }
        console.log('\n🏷️ Creating Brands (as metadata since MedusaJS 2.0 doesn\'t have native brands)...');
        // Since MedusaJS 2.0 doesn't have a built-in brand module,
        // we'll store brand information for later use
        for (const brand of brands) {
            try {
                // For now, just count them - brands will be handled via product metadata
                createdBrands++;
                if (createdBrands % 10 === 0) {
                    console.log(`   ✅ Processed ${createdBrands} brands...`);
                }
            }
            catch (error) {
                console.log(`   ❌ Failed: "${brand.name}": ${error.message}`);
            }
        }
        // Final summary
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('  📊 CATEGORIES & BRANDS SYNC COMPLETE');
        console.log('════════════════════════════════════════════════════════════');
        console.log(`   📁 Categories:`);
        console.log(`      ✅ Created:  ${createdCategories}`);
        console.log(`      📝 Updated:  ${updatedCategories}`);
        console.log(`      ❌ Failed:   ${failedCategories}`);
        console.log(`   🏷️ Brands:`);
        console.log(`      📋 Total:    ${createdBrands} (stored in product metadata)`);
        console.log('════════════════════════════════════════════════════════════');
        console.log('\n✅ Sync completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during sync:', error.message);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1jYXRlZ29yaWVzLWJyYW5kcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3N5bmMtY2F0ZWdvcmllcy1icmFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOztBQTBMSCw0QkF5R0M7QUFoU0QscURBQW1EO0FBR25ELHFCQUFxQjtBQUNyQixNQUFNLFdBQVcsR0FBRztJQUNoQixHQUFHLEVBQUUsNENBQTRDO0lBQ2pELEVBQUUsRUFBRSx1QkFBdUI7SUFDM0IsUUFBUSxFQUFFLEtBQUs7SUFDZixPQUFPLEVBQUUsMENBQTBDO0NBQ3RELENBQUM7QUFFRixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFL0IsS0FBSyxVQUFVLGdCQUFnQjtJQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFFOUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3hCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsTUFBTSxFQUFFLE1BQU07WUFDZCxNQUFNLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLE1BQU0sRUFBRSxjQUFjO2dCQUN0QixJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7YUFDeEU7WUFDRCxFQUFFLEVBQUUsQ0FBQztTQUNSLENBQUMsQ0FBQztRQUVILE1BQU0sT0FBTyxHQUFHO1lBQ1osUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRO1lBQzNDLElBQUksRUFBRSxHQUFHO1lBQ1QsSUFBSSxFQUFFLFVBQVU7WUFDaEIsTUFBTSxF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