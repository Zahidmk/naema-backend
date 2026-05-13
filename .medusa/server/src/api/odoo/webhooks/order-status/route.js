"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const email_1 = require("../../../../lib/email");
/**
 * POST /odoo/webhooks/order-status
 * Webhook for Odoo to update order status in Medusa
 *
 * Call this when:
 * - Order is confirmed in Odoo
 * - Order is shipped/delivered
 * - Order is cancelled
 * - Invoice is created
 * - Payment is received
 */
const POST = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { event_type, order, } = req.body;
    // Validate required fields
    if (!event_type || !order) {
        return res.status(400).json({
            type: "invalid_data",
            message: "event_type and order are required",
        });
    }
    if (!order.medusa_order_id && !order.odoo_order_id && !order.odoo_order_name) {
        return res.status(400).json({
            type: "invalid_data",
            message: "Either medusa_order_id, odoo_order_id, or odoo_order_name is required",
        });
    }
    console.log(`[Odoo Webhook] Received ${event_type} for order: ${order.medusa_order_id || order.odoo_order_name || order.odoo_order_id}`);
    try {
        // Find the Medusa order
        let medusaOrderId = order.medusa_order_id;
        if (!medusaOrderId && (order.odoo_order_id || order.odoo_order_name)) {
            // Try to find by Odoo reference stored in metadata
            // First check if there's a display_id that matches
            const orderSearch = await pgConnection.raw(`SELECT id, display_id FROM "order" 
         WHERE metadata->>'odoo_order_id' = ?
            OR metadata->>'odoo_order_name' = ?
         LIMIT 1`, [order.odoo_order_id?.toString(), order.odoo_order_name]);
            if (orderSearch.rows && orderSearch.rows.length > 0) {
                medusaOrderId = orderSearch.rows[0].id;
            }
        }
        if (!medusaOrderId) {
            return res.status(404).json({
                type: "not_found",
                message: "Order not found in Medusa",
                odoo_order_id: order.odoo_order_id,
                odoo_order_name: order.odoo_order_name,
            });
        }
        // Verify order exists
        const orderResult = await pgConnection.raw(`SELECT id, display_id, status, metadata FROM "order" WHERE id = ?`, [medusaOrderId]);
        if (!orderResult.rows || orderResult.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Order not found",
                medusa_order_id: medusaOrderId,
            });
        }
        const existingOrder = orderResult.rows[0];
        const currentMetadata = existingOrder.metadata || {};
        // Prepare metadata update
        const metadataUpdate = {
            ...currentMetadata,
            odoo_last_update: new Date().toISOString(),
            odoo_last_event: event_type,
        };
        if (order.odoo_order_id) {
            metadataUpdate.odoo_order_id = order.odoo_order_id;
        }
        if (order.odoo_order_name) {
            metadataUpdate.odoo_order_name = order.odoo_order_name;
        }
        // Handle different event types
        switch (event_type) {
            case "order.confirmed":
                metadataUpdate.odoo_confirmed = true;
                metadataUpdate.odoo_confirmed_at = new Date().toISOString();
                break;
            case "order.shipped":
                metadataUpdate.odoo_shipped = true;
                metadataUpdate.odoo_shipped_at = order.shipped_date || new Date().toISOString();
                if (order.tracking_number) {
                    metadataUpdate.tracking_number = order.tracking_number;
                }
                if (order.tracking_url) {
                    metadataUpdate.tracking_url = order.tracking_url;
                }
                if (order.carrier_name) {
                    metadataUpdate.carrier_name = order.carrier_name;
                }
                break;
            case "order.delivered":
                metadataUpdate.odoo_delivered = true;
                metadataUpdate.odoo_delivered_at = order.delivered_date || new Date().toISOString();
                break;
            case "order.cancelled":
                metadataUpdate.odoo_cancelled = true;
                metadataUpdate.odoo_cancelled_at = new Date().toISOString();
                if (order.cancelled_reason) {
                    metadataUpdate.cancelled_reason = order.cancelled_reason;
                }
                break;
            case "order.invoiced":
                metadataUpdate.odoo_invoiced = true;
                metadataUpdate.odoo_invoiced_at = order.invoice_date || new Date().toISOString();
                if (order.invoice_number) {
                    metadataUpdate.invoice_number = order.invoice_number;
                }
                break;
            case "order.paid":
                metadataUpdate.odoo_paid = true;
                metadataUpdate.odoo_paid_at = order.payment_date || new Date().toISOString();
                if (order.payment_method) {
                    metadataUpdate.payment_method_odoo = order.payment_method;
                }
                break;
        }
        // Update order metadata
        await pgConnection.raw(`UPDATE "order" SET metadata = ?, updated_at = NOW() WHERE id = ?`, [JSON.stringify(metadataUpdate), medusaOrderId]);
        // ── Send customer email notification ────────────────────────────────────
        // Fetch order email + items from DB for the email
        const emailEventMap = {
            "order.confirmed": "order.confirmed",
            "order.shipped": "order.shipped",
            "order.delivered": "order.delivered",
            "order.cancelled": "order.cancelled",
            "order.invoiced": null,
            "order.paid": null,
        };
        const emailType = emailEventMap[event_type];
        if (emailType) {
            try {
                // Get order details for email
                const orderEmailData = await pgConnection.raw(`SELECT o.id, o.display_id, o.email, o.currency_code, o.total, o.subtotal,
                  sa.first_name, sa.address_1, sa.city, sa.country_code
           FROM "order" o
           LEFT JOIN "address" sa ON sa.id = o.shipping_address_id
           WHERE o.id = ?`, [medusaOrderId]);
                const orderItemsData = await pgConnection.raw(`SELECT title, quantity, unit_price FROM "order_line_item"
           WHERE order_id = ?`, [medusaOrderId]);
                const oRow = orderEmailData.rows?.[0];
                if (oRow?.email) {
                    const shippingAddress = [oRow.address_1, oRow.city, oRow.country_code?.toUpperCase()]
                        .filter(Boolean)
                        .join(", ");
                    await (0, email_1.sendOrderStatusEmail)(emailType, oRow.email, {
                        customerName: oRow.first_name || "Valued Customer",
                        orderId: medusaOrderId,
                        displayId: oRow.display_id,
                        items: (orderItemsData.rows || []).map((item) => ({
                            title: item.title || "Product",
                            quantity: item.quantity,
                            unit_price: item.unit_price || 0,
                        })),
                        total: Number(oRow.total || 0),
                        subtotal: Number(oRow.subtotal || 0),
                        currencyCode: oRow.currency_code || "kwd",
                        shippingAddress: shippingAddress || undefined,
                        trackingNumber: order.tracking_number,
                        trackingUrl: order.tracking_url,
                        carrierName: order.carrier_name,
                        cancelledReason: order.cancelled_reason,
                    });
                    console.log(`[Odoo Webhook] ✅ Email sent: ${emailType} → ${oRow.email}`);
                }
            }
            catch (emailErr) {
                // Don't fail the webhook if email fails
                console.error(`[Odoo Webhook] ⚠️ Email send failed: ${emailErr.message}`);
            }
        }
        // ── Emit event for push notification subscriber ──────────────────────────
        const pushEvents = ["order.confirmed", "order.shipped", "order.delivered", "order.cancelled"];
        if (pushEvents.includes(event_type)) {
            try {
                // Get customer_id for the order
                const customerRow = await pgConnection.raw(`SELECT customer_id, display_id FROM "order" WHERE id = ?`, [medusaOrderId]);
                const customerId = customerRow.rows?.[0]?.customer_id;
                const displayId = customerRow.rows?.[0]?.display_id;
                if (customerId) {
                    const eventBus = req.scope.resolve(utils_1.Modules.EVENT_BUS);
                    await eventBus.emit({
                        name: "order.status.updated",
                        data: {
                            order_id: medusaOrderId,
                            customer_id: customerId,
                            display_id: displayId,
                            event_type,
                            tracking_number: order.tracking_number,
                            tracking_url: order.tracking_url,
                            carrier_name: order.carrier_name,
                        },
                    });
                    console.log(`[Odoo Webhook] ✅ Push event emitted: order.status.updated (${event_type})`);
                }
            }
            catch (pushErr) {
                console.warn(`[Odoo Webhook] ⚠️ Push event emit failed: ${pushErr.message}`);
            }
        }
        // ────────────────────────────────────────────────────────────────────────
        res.json({
            success: true,
            event_type,
            order: {
                medusa_order_id: medusaOrderId,
                display_id: existingOrder.display_id,
                odoo_order_id: order.odoo_order_id,
                odoo_order_name: order.odoo_order_name,
            },
            metadata_updated: Object.keys(metadataUpdate).filter(k => !Object.keys(currentMetadata).includes(k)),
        });
    }
    catch (error) {
        console.error("[Odoo Webhook] Order status webhook error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.POST = POST;
/**
 * GET /odoo/webhooks/order-status
 * Health check for webhook endpoint
 */
const GET = async (req, res) => {
    res.json({
        status: "ok",
        endpoint: "order-status",
        description: "Odoo order status webhook endpoint",
        supported_events: [
            "order.confirmed",
            "order.shipped",
            "order.delivered",
            "order.cancelled",
            "order.invoiced",
            "order.paid",
        ],
        example_payload: {
            event_type: "order.shipped",
            order: {
                medusa_order_id: "order_01HXY123ABC456",
                odoo_order_id: 123,
                odoo_order_name: "S00123",
                tracking_number: "TRK123456789",
                tracking_url: "https://tracking.carrier.com/TRK123456789",
                carrier_name: "FedEx",
                shipped_date: "2024-01-15T10:30:00Z",
            },
        },
    });
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL29kb28vd2ViaG9va3Mvb3JkZXItc3RhdHVzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHFEQUErRTtBQUMvRSxpREFBNkU7QUFFN0U7Ozs7Ozs7Ozs7R0FVRztBQUNJLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNwRSxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVoRixNQUFNLEVBQ0osVUFBVSxFQUNWLEtBQUssR0FDTixHQUFHLEdBQUcsQ0FBQyxJQXdCUCxDQUFDO0lBRUYsMkJBQTJCO0lBQzNCLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksRUFBRSxjQUFjO1lBQ3BCLE9BQU8sRUFBRSxtQ0FBbUM7U0FDN0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3RSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksRUFBRSxjQUFjO1lBQ3BCLE9BQU8sRUFBRSx1RUFBdUU7U0FDakYsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLFVBQVUsZUFBZSxLQUFLLENBQUMsZUFBZSxJQUFJLEtBQUssQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFD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