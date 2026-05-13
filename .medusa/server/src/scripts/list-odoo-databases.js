"use strict";
/**
 * List Odoo Databases Script
 * Run with: npx ts-node src/scripts/list-odoo-databases.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
// Odoo server URLs to try
const URLS_TO_TRY = [
    "https://me281a.odoo.com",
    "https://oskarllc-stage-27028831.dev.odoo.com",
];
/**
 * Create axios client for Odoo JSON-RPC
 */
function createOdooClient(baseURL) {
    return axios_1.default.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
        },
        httpsAgent: new https_1.default.Agent({
            rejectUnauthorized: false, // Allow self-signed certs for dev
        }),
    });
}
/**
 * List available databases on Odoo server
 */
async function listDatabases(baseURL) {
    const client = createOdooClient(baseURL);
    try {
        console.log(`\nTrying to list databases from: ${baseURL}`);
        // Method 1: Using /web/database/list
        const response = await client.post("/web/database/list", {
            jsonrpc: "2.0",
            method: "call",
            params: {},
            id: 1,
        });
        console.log("Response:", JSON.stringify(response.data, null, 2));
        if (response.data.result) {
            return response.data.result;
        }
        return [];
    }
    catch (error) {
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Data: ${JSON.stringify(error.response.data).slice(0, 500)}`);
        }
        else {
            console.log(`Error: ${error.message}`);
        }
        return [];
    }
}
/**
 * Try to get database info via different methods
 */
async function getDatabaseInfo(baseURL) {
    const client = createOdooClient(baseURL);
    console.log(`\n--- Database Info for ${baseURL} ---`);
    // Try /web/database/selector
    try {
        console.log("\nTrying /web/database/selector...");
        const response = await client.get("/web/database/selector");
        console.log("Response:", response.data.slice(0, 500));
    }
    catch (error) {
        console.log(`Error: ${error.response?.status || error.message}`);
    }
    // Try /web/database/manager
    try {
        console.log("\nTrying /web/database/manager...");
        const response = await client.get("/web/database/manager");
        console.log("Response:", typeof response.data === 'string' ? response.data.slice(0, 500) : JSON.stringify(response.data).slice(0, 500));
    }
    catch (error) {
        console.log(`Error: ${error.response?.status || error.message}`);
    }
    // Try root to see redirect/info
    try {
        console.log("\nTrying root /...");
        const response = await client.get("/", { maxRedirects: 0 });
        console.log("Response:", typeof response.data === 'string' ? response.data.slice(0, 500) : JSON.stringify(response.data).slice(0, 500));
    }
    catch (error) {
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Headers: ${JSON.stringify(error.response.headers).slice(0, 500)}`);
            console.log(`Data: ${typeof error.response.data === 'string' ? error.response.data.slice(0, 500) : JSON.stringify(error.response.data).slice(0, 500)}`);
        }
    }
}
/**
 * Main function
 */
async function main() {
    console.log("🔍 Searching for Odoo databases...\n");
    for (const url of URLS_TO_TRY) {
        await getDatabaseInfo(url);
        const databases = await listDatabases(url);
        if (databases.length > 0) {
            console.log(`\n✅ Found databases on ${url}:`);
            databases.forEach((db) => console.log(`  - ${db}`));
        }
    }
    // Also try the exact URL from credentials
    console.log("\n--- Trying original URL ---");
    const originalUrl = "https://oskarllc-stage-27028831.dev.odoo.com";
    await getDatabaseInfo(originalUrl);
    await listDatabases(originalUrl);
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1vZG9vLWRhdGFiYXNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2xpc3Qtb2Rvby1kYXRhYmFzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFFSCxrREFBNEM7QUFDNUMsa0RBQXlCO0FBRXpCLDBCQUEwQjtBQUMxQixNQUFNLFdBQVcsR0FBRztJQUNsQix5QkFBeUI7SUFDekIsOENBQThDO0NBQy9DLENBQUE7QUFFRDs7R0FFRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsT0FBZTtJQUN2QyxPQUFPLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDbEIsT0FBTztRQUNQLE9BQU8sRUFBRTtZQUNQLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkM7UUFDRCxVQUFVLEVBQUUsSUFBSSxlQUFLLENBQUMsS0FBSyxDQUFDO1lBQzFCLGtCQUFrQixFQUFFLEtBQUssRUFBRSxrQ0FBa0M7U0FDOUQsQ0FBQztLQUNILENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILEtBQUssVUFBVSxhQUFhLENBQUMsT0FBZTtJQUMxQyxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUV4QyxJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBRTFELHFDQUFxQztRQUNyQyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDdkQsT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUsTUFBTTtZQUNkLE1BQU0sRUFBRSxFQUFFO1lBQ1YsRUFBRSxFQUFFLENBQUM7U0FDTixDQUFDLENBQUE7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFF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