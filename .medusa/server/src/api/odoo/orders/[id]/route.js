"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /odoo/orders/:id
 * Get a specific order for Odoo integration
 */
const GET = async (req, res) => {
    const { id } = req.params;
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    try {
        // Get order
        const orderResult = await pgConnection.raw(`SELECT 
        o.id,
        o.display_id,
        o.status,
        o.email,
        o.currency_code,
        o.created_at,
        o.updated_at,
        o.canceled_at,
        o.metadata,
        c.id as customer_id,
        c.email as customer_email,
        c.first_name,
        c.last_name,
        c.phone
       FROM "order" o
       LEFT JOIN customer c ON o.customer_id = c.id
       WHERE o.id = ? OR o.display_id::text = ?`, [id, id]);
        if (!orderResult.rows || orderResult.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Order not found",
            });
        }
        const order = orderResult.rows[0];
        // Get line items with full product details (MedusaJS 2.x: order_item links to order_line_item)
        const itemsResult = await pgConnection.raw(`SELECT 
        li.id,
        li.title,
        oi.quantity,
        li.unit_price,
        li.variant_id,
        li.product_id,
        li.variant_sku as sku,
        li.variant_title,
        p.title as product_title,
        p.handle as product_handle
       FROM order_item oi
       JOIN order_line_item li ON oi.item_id = li.id
       LEFT JOIN product p ON li.product_id = p.id
       WHERE oi.order_id = ?`, [order.id]);
        // Get shipping address
        const shippingAddressResult = await pgConnection.raw(`SELECT 
        a.first_name,
        a.last_name,
        a.address_1,
        a.address_2,
        a.city,
        a.postal_code,
        a.phone,
        a.country_code,
        a.province
       FROM order_address a
       JOIN "order" o ON o.shipping_address_id = a.id
       WHERE o.id = ?`, [order.id]);
        // Get billing address
        const billingAddressResult = await pgConnection.raw(`SELECT 
        a.first_name,
        a.last_name,
        a.address_1,
        a.address_2,
        a.city,
        a.postal_code,
        a.phone,
        a.country_code,
        a.province
       FROM order_address a
       JOIN "order" o ON o.billing_address_id = a.id
       WHERE o.id = ?`, [order.id]);
        // Get payment info
        const paymentResult = await pgConnection.raw(`SELECT 
        pc.id,
        pc.amount,
        pc.currency_code,
        pc.provider_id,
        pc.created_at,
        p.amount as payment_amount,
        p.captured_at
       FROM payment_collection pc
       LEFT JOIN payment p ON p.payment_collection_id = pc.id
       WHERE pc.id IN (
         SELECT payment_collection_id FROM order_payment_collection WHERE order_id = ?
       )`, [order.id]);
        // Get fulfillment info (MedusaJS 2.x: linked via order_fulfillment)
        const fulfillmentResult = await pgConnection.raw(`SELECT 
        f.id,
        f.shipped_at,
        f.delivered_at,
        f.canceled_at,
        f.created_at,
        f.data,
        f.metadata
       FROM fulfillment f
       JOIN order_fulfillment of2 ON of2.fulfillment_id = f.id
       WHERE of2.order_id = ?`, [order.id]);
        // Calculate totals
        const items = itemsResult.rows || [];
        const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
        res.json({
            order: {
                id: order.id,
                display_id: order.display_id,
                status: order.status,
                email: order.email,
                currency_code: order.currency_code,
                created_at: order.created_at,
                updated_at: order.updated_at,
                canceled_at: order.canceled_at,
                metadata: order.metadata,
                // Customer
                customer: order.customer_id
                    ? {
                        id: order.customer_id,
                        email: order.customer_email,
                        first_name: order.first_name,
                        last_name: order.last_name,
                        phone: order.phone,
                    }
                    : null,
                // Addresses
                shipping_address: shippingAddressResult.rows[0] || null,
                billing_address: billingAddressResult.rows[0] || null,
                // Items
                items: items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total: item.unit_price * item.quantity,
                    variant_id: item.variant_id,
                    product_id: item.product_id,
                    sku: item.sku,
                    barcode: item.barcode,
                    weight: item.weight,
                    variant_title: item.variant_title,
                    product_title: item.product_title,
                    product_handle: item.product_handle,
                })),
                // Totals
                totals: {
                    subtotal,
                    // Add shipping, tax, discount if available
                },
                // Payment
                payments: paymentResult.rows || [],
                // Fulfillment
                fulfillments: fulfillmentResult.rows || [],
            },
        });
    }
    catch (error) {
        console.error("[Odoo Order Detail] Error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.GET = GET;
/**
 * PATCH /odoo/orders/:id
 * Update order status from Odoo
 */
const PATCH = async (req, res) => {
    const { id } = req.params;
    const { status, odoo_order_id, odoo_status, metadata } = req.body;
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    try {
        // Check if order exists
        const orderResult = await pgConnection.raw(`SELECT id, metadata FROM "order" WHERE id = ? OR display_id::text = ?`, [id, id]);
        if (!orderResult.rows || orderResult.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Order not found",
            });
        }
        const order = orderResult.rows[0];
        const existingMetadata = order.metadata || {};
        // Prepare updates
        const updates = [];
        const values = [];
        if (status) {
            updates.push(`status = ?`);
            values.push(status);
        }
        // Merge metadata with Odoo info
        const newMetadata = {
            ...existingMetadata,
            ...(metadata || {}),
            odoo: {
                ...(existingMetadata.odoo || {}),
                order_id: odoo_order_id || existingMetadata.odoo?.order_id,
                status: odoo_status || existingMetadata.odoo?.status,
                synced_at: new Date().toISOString(),
            },
        };
        updates.push(`metadata = ?`);
        values.push(JSON.stringify(newMetadata));
        updates.push(`updated_at = NOW()`);
        values.push(order.id);
        await pgConnection.raw(`UPDATE "order" SET ${updates.join(", ")} WHERE id = ?`, values);
        res.json({
            success: true,
            order_id: order.id,
            metadata: newMetadata,
        });
    }
    catch (error) {
        console.error("[Odoo Order Update] Error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.PATCH = PATCH;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL29kb28vb3JkZXJzL1tpZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXNFO0FBRXRFOzs7R0FHRztBQUNJLE1BQU0sR0FBRyxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNuRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUMxQixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVoRixJQUFJLENBQUM7UUFDSCxZQUFZO1FBQ1osTUFBTSxXQUFXLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUN4Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0RBaUIwQyxFQUMxQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FDVCxDQUFDO1FBRUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDMUIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLE9BQU8sRUFBRSxpQkFBaUI7YUFDM0IsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEMsK0ZBQStGO1FBQy9GLE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDeEM7Ozs7Ozs7Ozs7Ozs7OzZCQWN1QixFQUN2QixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FDWCxDQUFDO1FBRUYsdUJBQXVCO1FBQ3ZCLE1BQU0scUJB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