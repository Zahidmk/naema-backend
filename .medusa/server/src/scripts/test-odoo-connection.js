"use strict";
/**
 * Test Odoo Connection Script
 * Run with: npx ts-node src/scripts/test-odoo-connection.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmlrpc_1 = __importDefault(require("xmlrpc"));
// Disable SSL verification for dev Odoo instances
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// Odoo credentials from the user
const ODOO_URL = "https://oskarllc-stage-27028831.dev.odoo.com";
const ODOO_DB_NAME = "oskarllc-stage-27028831";
const ODOO_USERNAME = "admin";
const ODOO_API_KEY = "bcbf8f1f9949b7bb66203265b7b88ebfd84b248f";
/**
 * Create XML-RPC client for Odoo
 */
function createOdooClient(path) {
    const url = new URL(path, ODOO_URL);
    const isSecure = url.protocol === "https:";
    const clientOptions = {
        host: url.hostname,
        port: isSecure ? 443 : (parseInt(url.port) || 80),
        path: url.pathname,
        rejectUnauthorized: false, // Allow self-signed certs for dev
    };
    if (isSecure) {
        return xmlrpc_1.default.createSecureClient(clientOptions);
    }
    return xmlrpc_1.default.createClient(clientOptions);
}
/**
 * Authenticate with Odoo and get user ID
 */
async function authenticateOdoo() {
    return new Promise((resolve, reject) => {
        const client = createOdooClient("/xmlrpc/2/common");
        client.methodCall("authenticate", [ODOO_DB_NAME, ODOO_USERNAME, ODOO_API_KEY, {}], (error, uid) => {
            if (error) {
                console.error("Authentication error:", error);
                reject(error);
                return;
            }
            resolve(uid);
        });
    });
}
/**
 * Check Odoo version
 */
async function getOdooVersion() {
    return new Promise((resolve, reject) => {
        const client = createOdooClient("/xmlrpc/2/common");
        client.methodCall("version", [], (error, result) => {
            if (error) {
                console.error("Version check error:", error);
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}
/**
 * Execute Odoo method
 */
async function executeOdoo(uid, model, method, args, kwargs = {}) {
    return new Promise((resolve, reject) => {
        const client = createOdooClient("/xmlrpc/2/object");
        client.methodCall("execute_kw", [ODOO_DB_NAME, uid, ODOO_API_KEY, model, method, args, kwargs], (error, result) => {
            if (error) {
                console.error(`Error executing ${model}.${method}:`, error);
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}
/**
 * Fetch products from Odoo
 */
async function fetchProducts(uid) {
    // Get product IDs
    const productIds = await executeOdoo(uid, "product.product", "search", [[["active", "=", true]]], { limit: 100 });
    console.log(`Found ${productIds.length} products`);
    if (productIds.length === 0) {
        return [];
    }
    // Fetch product details
    const products = await executeOdoo(uid, "product.product", "read", [productIds], {
        fields: [
            "id",
            "name",
            "default_code",
            "list_price",
            "standard_price",
            "description_sale",
            "description",
            "categ_id",
            "weight",
            "qty_available",
            "virtual_available",
            "active",
            "barcode",
            "type",
            "image_1920",
        ],
    });
    return products;
}
/**
 * Fetch inventory/stock levels from Odoo
 */
async function fetchInventory(uid) {
    // Get stock quants (inventory levels)
    const quantIds = await executeOdoo(uid, "stock.quant", "search", [[["quantity", ">", 0]]], { limit: 100 });
    console.log(`Found ${quantIds.length} stock quants`);
    if (quantIds.length === 0) {
        return [];
    }
    // Fetch quant details
    const quants = await executeOdoo(uid, "stock.quant", "read", [quantIds], {
        fields: [
            "id",
            "product_id",
            "location_id",
            "quantity",
            "reserved_quantity",
        ],
    });
    return quants;
}
/**
 * Fetch categories from Odoo
 */
async function fetchCategories(uid) {
    const categoryIds = await executeOdoo(uid, "product.category", "search", [[]], { limit: 100 });
    console.log(`Found ${categoryIds.length} categories`);
    if (categoryIds.length === 0) {
        return [];
    }
    const categories = await executeOdoo(uid, "product.category", "read", [categoryIds], {
        fields: ["id", "name", "parent_id", "complete_name"],
    });
    return categories;
}
/**
 * Main test function
 */
async function main() {
    console.log("🔄 Testing Odoo Connection...");
    console.log(`URL: ${ODOO_URL}`);
    console.log(`Database: ${ODOO_DB_NAME}`);
    console.log(`Username: ${ODOO_USERNAME}`);
    console.log("---");
    try {
        // Check version
        console.log("\n📋 Checking Odoo version...");
        const version = await getOdooVersion();
        console.log("Odoo Version:", JSON.stringify(version, null, 2));
        // Authenticate
        console.log("\n🔐 Authenticating...");
        const uid = await authenticateOdoo();
        if (!uid) {
            console.error("❌ Authentication failed - invalid credentials");
            return;
        }
        console.log(`✅ Authentication successful! User ID: ${uid}`);
        // Fetch categories
        console.log("\n📁 Fetching categories...");
        const categories = await fetchCategories(uid);
        console.log("Categories sample:", JSON.stringify(categories.slice(0, 5), null, 2));
        // Fetch products
        console.log("\n📦 Fetching products...");
        const products = await fetchProducts(uid);
        console.log("Products sample:");
        products.slice(0, 5).forEach((p) => {
            console.log(`  - ${p.name} (SKU: ${p.default_code || "N/A"}) - Price: ${p.list_price} - Stock: ${p.qty_available}`);
        });
        // Fetch inventory
        console.log("\n📊 Fetching inventory...");
        const inventory = await fetchInventory(uid);
        console.log("Inventory sample:", JSON.stringify(inventory.slice(0, 5), null, 2));
        // Summary
        console.log("\n" + "=".repeat(50));
        console.log("📈 SUMMARY");
        console.log("=".repeat(50));
        console.log(`Total Categories: ${categories.length}`);
        console.log(`Total Products: ${products.length}`);
        console.log(`Total Stock Quants: ${inventory.length}`);
        // Save products to JSON for review
        const fs = await import("fs");
        const outputPath = "./odoo-products-export.json";
        fs.writeFileSync(outputPath, JSON.stringify({ categories, products, inventory }, null, 2));
        console.log(`\n💾 Full data exported to: ${outputPath}`);
    }
    catch (error) {
        console.error("❌ Error:", error);
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1vZG9vLWNvbm5lY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy90ZXN0LW9kb28tY29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQUVILG9EQUEyQjtBQUkzQixrREFBa0Q7QUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsR0FBRyxHQUFHLENBQUE7QUFFOUMsaUNBQWlDO0FBQ2pDLE1BQU0sUUFBUSxHQUFHLDhDQUE4QyxDQUFBO0FBQy9ELE1BQU0sWUFBWSxHQUFHLHlCQUF5QixDQUFBO0FBQzlDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQTtBQUM3QixNQUFNLFlBQVksR0FBRywwQ0FBMEMsQ0FBQTtBQW9CL0Q7O0dBRUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLElBQVk7SUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ25DLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFBO0lBRTFDLE1BQU0sYUFBYSxHQUFRO1FBQ3pCLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUTtRQUNsQixJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRO1FBQ2xCLGtCQUFrQixFQUFFLEtBQUssRUFBRSxrQ0FBa0M7S0FDOUQsQ0FBQTtJQUVELElBQUksUUFBUSxFQUFFLENBQUM7UUFDYixPQUFPLGdCQUFNLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUNELE9BQU8sZ0JBQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUE7QUFD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