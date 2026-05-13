"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncOdooOrders;
const axios_1 = __importDefault(require("axios"));
/**
 * Odoo Order Sync Script
 *
 * Syncs orders between Odoo and MedusaJS
 * Run with: yarn sync:orders
 */
const ODOO_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
const ODOO_DB = process.env.ODOO_DB_NAME || "oskarllc-new-27289548";
const ODOO_USER = process.env.ODOO_USERNAME || "SYG";
const ODOO_PASS = process.env.ODOO_PASSWORD || "S123456";
async function odooJsonRpc(uid, model, method, args, kwargs = {}) {
    const response = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
        jsonrpc: "2.0",
        method: "call",
        params: {
            service: "object",
            method: "execute_kw",
            args: [ODOO_DB, uid, ODOO_PASS, model, method, args, kwargs]
        },
        id: Date.now()
    });
    return response.data.result;
}
async function syncOdooOrders({ container }) {
    console.log("\n📦 Starting Odoo Order Sync...");
    console.log("=".repeat(50));
    // Authenticate with Odoo
    console.log("\n1️⃣ Authenticating with Odoo...");
    let uid;
    try {
        const authResponse = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [ODOO_DB, ODOO_USER, ODOO_PASS, {}]
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
    // Fetch orders from Odoo
    console.log("\n2️⃣ Fetching orders from Odoo...");
    const orders = await odooJsonRpc(uid, "sale.order", "search_read", [[]], {
        fields: ["id", "name", "partner_id", "date_order", "state", "amount_total",
            "amount_tax", "amount_untaxed", "order_line", "currency_id"],
        order: "date_order desc",
        limit: 100
    });
    console.log(`📦 Found ${orders.length} orders in Odoo`);
    if (orders.length === 0) {
        console.log("\n⚠️ No orders found in Odoo.");
        console.log("   Orders will sync automatically when created in Odoo.");
        // Show summary of available data
        console.log("\n📊 Current Odoo Data:");
        const productCount = await odooJsonRpc(uid, "product.product", "search_count", [[["sale_ok", "=", true]]]);
        console.log(`   - Products: ${productCount}`);
        const customerCount = await odooJsonRpc(uid, "res.partner", "search_count", [[["customer_rank", ">", 0]]]);
        console.log(`   - Customers: ${customerCount}`);
        const orderCount = await odooJsonRpc(uid, "sale.order", "search_count", [[]]);
        console.log(`   - Orders: ${orderCount}`);
        return;
    }
    // Process orders
    console.log("\n3️⃣ Processing orders...");
    for (const order of orders.slice(0, 10)) {
        console.log(`\n   Order: ${order.name}`);
        console.log(`   - Customer: ${order.partner_id[1]}`);
        console.log(`   - Date: ${order.date_order}`);
        console.log(`   - State: ${order.state}`);
        console.log(`   - Total: ${order.amount_total} ${order.currency_id[1]}`);
        // Get order lines
        if (order.order_line.length > 0) {
            const lines = await odooJsonRpc(uid, "sale.order.line", "search_read", [[["order_id", "=", order.id]]], { fields: ["product_id", "name", "product_uom_qty", "price_unit", "price_subtotal"] });
            console.log(`   - Items: ${lines.length}`);
            lines.forEach(line => {
                const productName = line.product_id ? line.product_id[1] : line.name;
                console.log(`     • ${productName.substring(0, 40)} x${line.product_uom_qty} @ ${line.price_unit}`);
            });
        }
    }
    console.log("\n" + "=".repeat(50));
    console.log("✅ Order sync completed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1vZG9vLW9yZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3N5bmMtb2Rvby1vcmRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFvREEsaUNBNEZDO0FBL0lELGtEQUF5QjtBQUV6Qjs7Ozs7R0FLRztBQUVILE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLDRDQUE0QyxDQUFBO0FBQ3JGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFBO0FBQ25FLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQTtBQUNwRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUE7QUF5QnhELEtBQUssVUFBVSxXQUFXLENBQUMsR0FBVyxFQUFFLEtBQWEsRUFBRSxNQUFjLEVBQUUsSUFBVyxFQUFFLFNBQWMsRUFBRTtJQUNsRyxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLFVBQVUsRUFBRTtRQUN2RCxPQUFPLEVBQUUsS0FBSztRQUNkLE1BQU0sRUFBRSxNQUFNO1FBQ2QsTUFBTSxFQUFFO1lBQ04sT0FBTyxFQUFFLFFBQVE7WUFDakIsTUFBTSxFQUFFLFlBQVk7WUFDcEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO1NBQzdEO1FBQ0QsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7S0FDZixDQUFDLENBQUE7SUFDRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO0FBQzdCLENBQUM7QUFFYyxLQUFLLFVBQVUsY0FBYyxDQUFDLEVBQUUs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