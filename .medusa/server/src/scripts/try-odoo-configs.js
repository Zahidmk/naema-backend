"use strict";
/**
 * Try multiple Odoo configurations
 * Run with: npx ts-node src/scripts/try-odoo-configs.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const ODOO_USERNAME = "admin";
const ODOO_API_KEY = "bcbf8f1f9949b7bb66203265b7b88ebfd84b248f";
// All possible configurations to try
const CONFIGS = [
    // Main hosting server with different DB name patterns
    { url: "https://me281a.odoo.com", db: "me281a" },
    { url: "https://me281a.odoo.com", db: "oskarllc" },
    { url: "https://me281a.odoo.com", db: "oskarllc-stage" },
    { url: "https://me281a.odoo.com", db: "stage" },
    { url: "https://me281a.odoo.com", db: "production" },
    { url: "https://me281a.odoo.com", db: "odoo" },
    { url: "https://me281a.odoo.com", db: "main" },
    { url: "https://me281a.odoo.com", db: "default" },
    // Original URL patterns (in case they work)
    { url: "https://oskarllc-stage-27028831.dev.odoo.com", db: "oskarllc-stage-27028831" },
    { url: "https://oskarllc.odoo.com", db: "oskarllc" },
];
/**
 * Create axios client
 */
function createClient(baseURL) {
    return axios_1.default.create({
        baseURL,
        headers: { "Content-Type": "application/json" },
        httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false }),
        timeout: 10000,
    });
}
/**
 * Test authentication
 */
async function testAuth(config) {
    const client = createClient(config.url);
    try {
        const response = await client.post("/web/session/authenticate", {
            jsonrpc: "2.0",
            method: "call",
            params: {
                db: config.db,
                login: ODOO_USERNAME,
                password: ODOO_API_KEY,
            },
            id: 1,
        });
        if (response.data.result?.uid) {
            console.log(`✅ SUCCESS: ${config.url} with db="${config.db}"`);
            console.log(`   User ID: ${response.data.result.uid}`);
            console.log(`   Name: ${response.data.result.name}`);
            return true;
        }
        if (response.data.error) {
            const errorMsg = response.data.error.message || response.data.error.data?.message || 'Unknown error';
            console.log(`❌ FAILED: ${config.url} / ${config.db}`);
            console.log(`   Error: ${errorMsg.slice(0, 100)}`);
        }
        else {
            console.log(`❓ UNKNOWN: ${config.url} / ${config.db}`);
            console.log(`   Response: ${JSON.stringify(response.data).slice(0, 100)}`);
        }
        return false;
    }
    catch (error) {
        const status = error.response?.status || 'N/A';
        const msg = error.message || 'Unknown';
        console.log(`❌ ERROR: ${config.url} / ${config.db}`);
        console.log(`   Status: ${status}, Message: ${msg.slice(0, 80)}`);
        return false;
    }
}
/**
 * Main
 */
async function main() {
    console.log("🔍 Trying multiple Odoo configurations...\n");
    for (const config of CONFIGS) {
        await testAuth(config);
        console.log("");
    }
    console.log("\n📋 Please verify your Odoo credentials:");
    console.log("   - Confirm the exact URL from your Odoo instance");
    console.log("   - Confirm the database name (usually shown in Odoo URL or settings)");
    console.log("   - Ensure the API key is valid and has proper permissions");
    console.log("\nYou can find the database name by:");
    console.log("   1. Logging into Odoo web interface");
    console.log("   2. Going to Settings > Database Manager");
    console.log("   3. Or check the URL after login (e.g., /web?db=DATABASE_NAME)");
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ5LW9kb28tY29uZmlncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3RyeS1vZG9vLWNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFFSCxrREFBNEM7QUFDNUMsa0RBQXlCO0FBRXpCLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQTtBQUM3QixNQUFNLFlBQVksR0FBRywwQ0FBMEMsQ0FBQTtBQU8vRCxxQ0FBcUM7QUFDckMsTUFBTSxPQUFPLEdBQWE7SUFDeEIsc0RBQXNEO0lBQ3RELEVBQUUsR0FBRyxFQUFFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUU7SUFDaEQsRUFBRSxHQUFHLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRTtJQUNsRCxFQUFFLEdBQUcsRUFBRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUU7SUFDeEQsRUFBRSxHQUFHLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtJQUMvQyxFQUFFLEdBQUcsRUFBRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFO0lBQ3BELEVBQUUsR0FBRyxFQUFFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUU7SUFDOUMsRUFBRSxHQUFHLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRTtJQUM5QyxFQUFFLEdBQUcsRUFBRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFO0lBQ2pELDRDQUE0QztJQUM1QyxFQUFFLEdBQUcsRUFBRSw4Q0FBOEMsRUFBRSxFQUFFLEVBQUUseUJBQXlCLEVBQUU7SUFDdEYsRUFBRSxHQUFHLEVBQUUsMkJBQTJCLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRTtDQUNyRCxDQUFBO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLFlBQVksQ0FBQyxPQUFlO0lBQ25DLE9BQU8sZUFB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