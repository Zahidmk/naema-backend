"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderCreatedHandler;
const axios_1 = __importDefault(require("axios"));
/**
 * Order Created Subscriber
 *
 * When an order is created in MedusaJS, this subscriber
 * will create a corresponding sale order in Odoo.
 *
 * IMPORTANT: This matches products by SKU (default_code in Odoo)
 * so that stock is automatically reduced when order is confirmed.
 */
const ODOO_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
const ODOO_DB = process.env.ODOO_DB_NAME || "oskarllc-stage-27028831";
const ODOO_USER = process.env.ODOO_USERNAME || "SYG";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";
async function authenticateOdoo() {
    try {
        const response = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]
            },
            id: 1
        });
        return response.data.result || null;
    }
    catch (error) {
        console.error("Odoo authentication failed:", error);
        return null;
    }
}
/**
 * Find Odoo product by SKU (default_code)
 */
async function findOdooProductBySku(uid, sku) {
    try {
        // First try to match by default_code (SKU)
        let response = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [ODOO_DB, uid, ODOO_API_KEY, "product.product", "search", [[["default_code", "=", sku]]]]
            },
            id: 10
        });
        if (response.data.result && response.data.result.length > 0) {
            return response.data.result[0];
        }
        // Try with ODOO- prefix stripped
        if (sku.startsWith("ODOO-")) {
            const odooId = parseInt(sku.replace("ODOO-", ""));
            if (!isNaN(odooId)) {
                return odooId;
            }
        }
        return null;
    }
    catch (error) {
        console.error(`Failed to find Odoo product for SKU ${sku}:`, error);
        return null;
    }
}
async function createOdooOrder(uid, orderData, logger) {
    try {
        // First, find or create the customer in Odoo
        const customerEmail = orderData.email || orderData.customer?.email;
        const customerName = `${orderData.shipping_address?.first_name || ""} ${orderData.shipping_address?.last_name || ""}`.trim() || "Guest Customer";
        // Search for existing partner
        let partnerId;
        const partnerSearch = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [ODOO_DB, uid, ODOO_API_KEY, "res.partner", "search", [[["email", "=", customerEmail]]]]
            },
            id: 2
        });
        if (partnerSearch.data.result && partnerSearch.data.result.length > 0) {
            partnerId = partnerSearch.data.result[0];
            logger.info(`  Found existing Odoo partner: ${partnerId}`);
        }
        else {
            // Create new partner
            const partnerCreate = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [ODOO_DB, uid, ODOO_API_KEY, "res.partner", "create", [{
                                name: customerName,
                                email: customerEmail,
                                phone: orderData.shipping_address?.phone || "",
                                street: orderData.shipping_address?.address_1 || "",
                                city: orderData.shipping_address?.city || "",
                                zip: orderData.shipping_address?.postal_code || "",
                                customer_rank: 1
                            }]]
                },
                id: 3
            });
            partnerId = partnerCreate.data.result;
            logger.info(`  Created new Odoo partner: ${partnerId}`);
        }
        // Build order lines with product_id for stock reduction
        const orderLines = [];
        for (const item of (orderData.items || [])) {
            const sku = item.variant?.sku || item.sku || "";
            const productName = item.title || item.variant?.title || "Product";
            // Try to find matching Odoo product by SKU
            const odooProductId = sku ? await findOdooProductBySku(uid, sku) : null;
            const lineData = {
                name: productName,
                product_uom_qty: item.quantity || 1,
                price_unit: (item.unit_price || 0) / 1000, // Convert from fils (KWD has 3 decimals)
            };
            if (odooProductId) {
                lineData.product_id = odooProductId;
                logger.info(`  ✅ Matched SKU "${sku}" to Odoo product ID: ${odooProductId}`);
            }
            else {
                logger.warn(`  ⚠️ Could not find Odoo product for SKU: ${sku}`);
            }
            orderLines.push([0, 0, lineData]);
        }
        // Create sale order
        const orderCreate = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [ODOO_DB, uid, ODOO_API_KEY, "sale.order", "create", [{
                            partner_id: partnerId,
                            client_order_ref: orderData.id,
                            note: `Order from Marqa Souq - ${orderData.id}`,
                            order_line: orderLines
                        }]]
            },
            id: 4
        });
        const odooOrderId = orderCreate.data.result;
        if (!odooOrderId) {
            return { orderId: null, confirmed: false };
        }
        logger.info(`  📝 Created Odoo sale order: ${odooOrderId}`);
        // Confirm the sale order to reduce stock
        let confirmed = false;
        try {
            const confirmResponse = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [ODOO_DB, uid, ODOO_API_KEY, "sale.order", "action_confirm", [[odooOrderId]]]
                },
                id: 5
            });
            if (confirmResponse.data.result !== false) {
                confirmed = true;
                logger.info(`  ✅ Confirmed order in Odoo - stock will be reduced`);
            }
        }
        catch (confirmError) {
            logger.warn(`  ⚠️ Could not auto-confirm order: ${confirmError.message}`);
        }
        return { orderId: odooOrderId, confirmed };
    }
    catch (error) {
        console.error("Failed to create Odoo order:", error);
        return { orderId: null, confirmed: false };
    }
}
async function orderCreatedHandler({ event, container, }) {
    const logger = container.resolve("logger");
    const orderId = event.data.id;
    logger.info(`📦 Order created: ${orderId} - Syncing to Odoo...`);
    try {
        // Get order details
        const orderService = container.resolve("order");
        const order = await orderService.retrieveOrder(orderId, {
            relations: ["items", "items.variant", "shipping_address"]
        });
        // Authenticate with Odoo
        const uid = await authenticateOdoo();
        if (!uid) {
            logger.warn("Could not authenticate with Odoo, order not synced");
            return;
        }
        // Create order in Odoo (with product matching and confirmation)
        const { orderId: odooOrderId, confirmed } = await createOdooOrder(uid, order, logger);
        if (odooOrderId) {
            logger.info(`✅ Order ${orderId} synced to Odoo as order ID: ${odooOrderId}`);
            if (confirmed) {
                logger.info(`✅ Stock reduced in Odoo for order ${odooOrderId}`);
            }
            // Update order metadata with Odoo ID
            // Note: This would require additional logic to update metadata
        }
        else {
            logger.warn(`Failed to sync order ${orderId} to Odoo`);
        }
    }
    catch (error) {
        logger.error(`Error syncing order to Odoo: ${error.message}`);
    }
}
exports.config = {
    event: "order.placed",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItdG8tb2Rvby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9vcmRlci10by1vZG9vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQXFNQSxzQ0F3Q0M7QUE1T0Qsa0RBQXlCO0FBRXpCOzs7Ozs7OztHQVFHO0FBRUgsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksNENBQTRDLENBQUE7QUFDckYsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUkseUJBQXlCLENBQUE7QUFDckUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFBO0FBQ3BELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQTtBQUVuRCxLQUFLLFVBQVUsZ0JBQWdCO0lBQzdCLElBQUksQ0FBQztRQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsVUFBVSxFQUFFO1lBQ3ZELE9BQU8sRUFBRSxLQUFLO1lBQ2QsTUFBTSxFQUFFLE1BQU07WUFDZCxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLE1BQU0sRUFBRSxjQUFjO2dCQUN0QixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUM7YUFDN0M7WUFDRCxFQUFFLEVBQUUsQ0FBQztTQUNOLENBQUMsQ0FBQTtRQUNGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFBO0lBQ3JDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNuRCxPQUFPLElBQUksQ0FBQTtJ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