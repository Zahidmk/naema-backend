"use strict";
/**
 * Test Odoo Connection Script using JSON-RPC
 * Run with: npx ts-node src/scripts/test-odoo-jsonrpc.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
// Odoo credentials from the user
// Using the hosting URL - on Odoo.sh single-tenant the DB name might be empty or match subdomain
const ODOO_URL = "https://me281a.odoo.com";
// Try with empty database name (single-tenant mode) or default "odoo"
const ODOO_DB_NAME = ""; // Empty for single-tenant / auto-detect
const ODOO_USERNAME = "admin";
const ODOO_API_KEY = "bcbf8f1f9949b7bb66203265b7b88ebfd84b248f";
/**
 * Create axios client for Odoo JSON-RPC
 */
function createOdooClient() {
    return axios_1.default.create({
        baseURL: ODOO_URL,
        headers: {
            "Content-Type": "application/json",
        },
        httpsAgent: new https_1.default.Agent({
            rejectUnauthorized: false, // Allow self-signed certs for dev
        }),
    });
}
let requestId = 0;
/**
 * Make JSON-RPC call to Odoo
 */
async function jsonRpc(client, url, method, params) {
    const request = {
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: ++requestId,
    };
    console.log(`Making request to ${url}:`, JSON.stringify(request, null, 2));
    try {
        const response = await client.post(url, request);
        if (response.data.error) {
            throw new Error(JSON.stringify(response.data.error));
        }
        return response.data.result;
    }
    catch (error) {
        if (error.response) {
            console.error(`Response status: ${error.response.status}`);
            console.error(`Response data:`, error.response.data);
        }
        throw error;
    }
}
/**
 * Authenticate with Odoo and get session
 */
async function authenticateOdoo(client) {
    try {
        const result = await jsonRpc(client, "/web/session/authenticate", "call", {
            db: ODOO_DB_NAME,
            login: ODOO_USERNAME,
            password: ODOO_API_KEY,
        });
        if (result && result.uid) {
            return result.uid;
        }
        return false;
    }
    catch (error) {
        console.error("Authentication error:", error);
        return false;
    }
}
/**
 * Execute Odoo method using JSON-RPC
 */
async function executeOdoo(client, model, method, args, kwargs = {}) {
    return jsonRpc(client, "/web/dataset/call_kw", "call", {
        model: model,
        method: method,
        args: args,
        kwargs: kwargs,
    });
}
/**
 * Search and read records using the read controller
 */
async function searchRead(client, model, domain, fields, limit = 100, offset = 0) {
    return jsonRpc(client, "/web/dataset/search_read", "call", {
        model: model,
        domain: domain,
        fields: fields,
        limit: limit,
        offset: offset,
    });
}
/**
 * Fetch products from Odoo
 */
async function fetchProducts(client) {
    try {
        const result = await searchRead(client, "product.product", [["active", "=", true]], [
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
            "barcode",
            "type",
            "image_1920",
        ], 100);
        return result.records || result || [];
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}
/**
 * Fetch categories from Odoo
 */
async function fetchCategories(client) {
    try {
        const result = await searchRead(client, "product.category", [], ["id", "name", "parent_id", "complete_name"], 100);
        return result.records || result || [];
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
/**
 * Fetch inventory from Odoo
 */
async function fetchInventory(client) {
    try {
        const result = await searchRead(client, "stock.quant", [["quantity", ">", 0]], ["id", "product_id", "location_id", "quantity", "reserved_quantity"], 100);
        return result.records || result || [];
    }
    catch (error) {
        console.error("Error fetching inventory:", error);
        return [];
    }
}
/**
 * Main test function
 */
async function main() {
    console.log("🔄 Testing Odoo Connection (JSON-RPC)...");
    console.log(`URL: ${ODOO_URL}`);
    console.log(`Database: ${ODOO_DB_NAME}`);
    console.log(`Username: ${ODOO_USERNAME}`);
    console.log("---");
    const client = createOdooClient();
    try {
        // Authenticate
        console.log("\n🔐 Authenticating...");
        const uid = await authenticateOdoo(client);
        if (!uid) {
            console.error("❌ Authentication failed - invalid credentials");
            return;
        }
        console.log(`✅ Authentication successful! User ID: ${uid}`);
        // Fetch categories
        console.log("\n📁 Fetching categories...");
        const categories = await fetchCategories(client);
        console.log(`Found ${categories.length} categories`);
        console.log("Categories sample:", JSON.stringify(categories.slice(0, 5), null, 2));
        // Fetch products
        console.log("\n📦 Fetching products...");
        const products = await fetchProducts(client);
        console.log(`Found ${products.length} products`);
        console.log("Products sample:");
        products.slice(0, 5).forEach((p) => {
            console.log(`  - ${p.name} (SKU: ${p.default_code || "N/A"}) - Price: ${p.list_price} - Stock: ${p.qty_available}`);
        });
        // Fetch inventory
        console.log("\n📊 Fetching inventory...");
        const inventory = await fetchInventory(client);
        console.log(`Found ${inventory.length} stock quants`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1vZG9vLWpzb25ycGMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy90ZXN0LW9kb28tanNvbnJwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQUVILGtEQUE0QztBQUM1QyxrREFBeUI7QUFFekIsaUNBQWlDO0FBQ2pDLGlHQUFpRztBQUNqRyxNQUFNLFFBQVEsR0FBRyx5QkFBeUIsQ0FBQTtBQUMxQyxzRUFBc0U7QUFDdEUsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFBLENBQUUsd0NBQXdDO0FBQ2pFLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQTtBQUM3QixNQUFNLFlBQVksR0FBRywwQ0FBMEMsQ0FBQTtBQTJCL0Q7O0dBRUc7QUFDSCxTQUFTLGdCQUFnQjtJQUN2QixPQUFPLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDbEIsT0FBTyxFQUFFLFFBQVE7UUFDakIsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztRQUNELFVBQVUsRUFBRSxJQUFJLGVBQUssQ0FBQyxLQUFLLENBQUM7WUFDMUIsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLGtDQUFrQztTQUM5RCxDQUFDO0tBQ0gsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQTtBQUVqQjs7R0FFRztBQUNILEtBQUssVUFBVSxPQUFPLENBQ3BCLE1BQXFCLEVBQ3JCLEdBQVcsRUFDWCxNQUFjLEVBQ2QsTUFBMkI7SUFFM0IsTUFBTSxPQUFPLEdBQW1CO1FBQzlCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsTUFBTSxFQUFFLE1BQU07UUFDZCxNQUFNLEVBQUUsTUFBTTtRQUNkLEVBQUUsRUFBRSxFQUFFLFNBQVM7S0FDaEIsQ0FBQTtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFF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