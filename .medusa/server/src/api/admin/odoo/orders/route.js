"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const axios_1 = __importDefault(require("axios"));
const ODOO_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
const ODOO_DB = process.env.ODOO_DB_NAME || "oskarllc-new-27289548";
const ODOO_USER = process.env.ODOO_USERNAME || "SYG";
const ODOO_PASS = process.env.ODOO_PASSWORD || "S123456";
/**
 * GET /admin/odoo/orders - Fetch orders from Odoo
 */
async function GET(req, res) {
    try {
        // Authenticate with Odoo
        const authRes = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [ODOO_DB, ODOO_USER, ODOO_PASS, {}]
            },
            id: 1
        });
        const uid = authRes.data.result;
        if (!uid) {
            return res.status(401).json({ error: "Failed to authenticate with Odoo" });
        }
        // Fetch orders
        const ordersRes = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_DB, uid, ODOO_PASS,
                    "sale.order", "search_read",
                    [[]],
                    {
                        fields: ["id", "name", "partner_id", "date_order", "state",
                            "amount_total", "amount_tax", "order_line", "currency_id"],
                        order: "date_order desc",
                        limit: 50
                    }
                ]
            },
            id: 2
        });
        const orders = ordersRes.data.result || [];
        // Get order lines for each order
        const ordersWithLines = await Promise.all(orders.map(async (order) => {
            if (order.order_line && order.order_line.length > 0) {
                const linesRes = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
                    jsonrpc: "2.0",
                    method: "call",
                    params: {
                        service: "object",
                        method: "execute_kw",
                        args: [
                            ODOO_DB, uid, ODOO_PASS,
                            "sale.order.line", "search_read",
                            [[["order_id", "=", order.id]]],
                            { fields: ["product_id", "name", "product_uom_qty", "price_unit", "price_subtotal"] }
                        ]
                    },
                    id: 3
                });
                order.items = linesRes.data.result || [];
            }
            else {
                order.items = [];
            }
            return order;
        }));
        return res.json({
            success: true,
            count: orders.length,
            orders: ordersWithLines
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "Failed to fetch orders from Odoo",
            message: error.message
        });
    }
}
/**
 * POST /admin/odoo/orders - Create order in Odoo from MedusaJS order
 */
async function POST(req, res) {
    try {
        const { order_id } = req.body;
        if (!order_id) {
            return res.status(400).json({ error: "order_id is required" });
        }
        // Get order from MedusaJS
        const orderService = req.scope.resolve("order");
        const order = await orderService.retrieveOrder(order_id, {
            relations: ["items", "shipping_address"]
        });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        // Authenticate with Odoo
        const authRes = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [ODOO_DB, ODOO_USER, ODOO_PASS, {}]
            },
            id: 1
        });
        const uid = authRes.data.result;
        if (!uid) {
            return res.status(401).json({ error: "Failed to authenticate with Odoo" });
        }
        // Find or create customer in Odoo
        let partnerId;
        const customerEmail = order.email || "customer@marqasouq.com";
        const existingPartner = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_DB, uid, ODOO_PASS,
                    "res.partner", "search",
                    [[["email", "=", customerEmail]]]
                ]
            },
            id: 2
        });
        if (existingPartner.data.result && existingPartner.data.result.length > 0) {
            partnerId = existingPartner.data.result[0];
        }
        else {
            // Create new partner
            const createPartner = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        ODOO_DB, uid, ODOO_PASS,
                        "res.partner", "create",
                        [{
                                name: order.shipping_address?.first_name + " " + order.shipping_address?.last_name,
                                email: customerEmail,
                                phone: order.shipping_address?.phone,
                                street: order.shipping_address?.address_1,
                                city: order.shipping_address?.city,
                                zip: order.shipping_address?.postal_code,
                                country_id: 1 // Default country
                            }]
                    ]
                },
                id: 3
            });
            partnerId = createPartner.data.result;
        }
        // Create order in Odoo
        const orderLines = order.items?.map((item) => {
            return [0, 0, {
                    name: item.title || item.variant?.product?.title || "Product",
                    product_uom_qty: item.quantity,
                    price_unit: item.unit_price / 100 // Convert from cents
                }];
        }) || [];
        const createOrder = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_DB, uid, ODOO_PASS,
                    "sale.order", "create",
                    [{
                            partner_id: partnerId,
                            order_line: orderLines,
                            client_order_ref: order.id,
                            note: `Synced from MedusaJS - Order ${order.display_id}`
                        }]
                ]
            },
            id: 4
        });
        const odooOrderId = createOrder.data.result;
        return res.json({
            success: true,
            message: "Order synced to Odoo",
            medusa_order_id: order.id,
            odoo_order_id: odooOrderId
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "Failed to sync order to Odoo",
            message: error.message
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29kb28vb3JkZXJzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBV0Esa0JBZ0ZDO0FBS0Qsb0JBK0hDO0FBOU5ELGtEQUF5QjtBQUV6QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSw0Q0FBNEMsQ0FBQTtBQUNyRixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSx1QkFBdUIsQ0FBQTtBQUNuRSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUE7QUFDcEQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUyxDQUFBO0FBRXhEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILHlCQUF5QjtRQUN6QixNQUFNLE9BQU8sR0FBRyxNQUFNLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLFVBQVUsRUFBRTtZQUN0RCxPQUFPLEVBQUUsS0FBSztZQUNkLE1BQU0sRUFBRSxNQUFNO1lBQ2QsTUFBTSxFQUFFO2dCQUNOLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixNQUFNLEVBQUUsY0FBYztnQkFDdEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDO2FBQzFDO1lBQ0QsRUFBRSxFQUFFLENBQUM7U0FDTixDQUFDLENBQUE7UUFFRixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUMvQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDVCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFD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