"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /odoo/orders
 * Get orders for Odoo integration with filters
 */
const GET = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { status, date_from, date_to, limit = "50", offset = "0", synced, } = req.query;
    try {
        let whereClause = "WHERE 1=1";
        const params = [];
        // Filter by status
        if (status) {
            const statuses = status.split(",");
            whereClause += ` AND o.status IN (${statuses.map(() => `?`).join(",")})`;
            params.push(...statuses);
        }
        // Filter by date range
        if (date_from) {
            whereClause += ` AND o.created_at >= ?`;
            params.push(date_from);
        }
        if (date_to) {
            whereClause += ` AND o.created_at <= ?`;
            params.push(date_to);
        }
        // Get total count
        const countResult = await pgConnection.raw(`SELECT COUNT(*) as total FROM "order" o ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].total) || 0;
        // Get orders
        const ordersResult = await pgConnection.raw(`SELECT 
        o.id,
        o.display_id,
        o.status,
        o.email,
        o.currency_code,
        o.created_at,
        o.updated_at,
        o.metadata,
        c.id as customer_id,
        c.email as customer_email,
        c.first_name,
        c.last_name,
        c.phone
       FROM "order" o
       LEFT JOIN customer c ON o.customer_id = c.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`, [...params, parseInt(limit), parseInt(offset)]);
        // Get order items for each order
        const orders = await Promise.all(ordersResult.rows.map(async (order) => {
            // Get line items (MedusaJS 2.x: order_item links order to order_line_item)
            const itemsResult = await pgConnection.raw(`SELECT 
            li.id,
            li.title,
            oi.quantity,
            li.unit_price,
            li.variant_id,
            li.product_id,
            li.variant_sku as sku,
            li.variant_title
           FROM order_item oi
           JOIN order_line_item li ON oi.item_id = li.id
           WHERE oi.order_id = ?`, [order.id]);
            // Get shipping address
            const addressResult = await pgConnection.raw(`SELECT 
            a.first_name,
            a.last_name,
            a.address_1,
            a.address_2,
            a.city,
            a.postal_code,
            a.phone,
            a.country_code
           FROM order_address a
           JOIN "order" o ON o.shipping_address_id = a.id
           WHERE o.id = ?`, [order.id]);
            return {
                id: order.id,
                display_id: order.display_id,
                status: order.status,
                email: order.email,
                currency_code: order.currency_code,
                created_at: order.created_at,
                updated_at: order.updated_at,
                metadata: order.metadata,
                customer: order.customer_id
                    ? {
                        id: order.customer_id,
                        email: order.customer_email,
                        first_name: order.first_name,
                        last_name: order.last_name,
                        phone: order.phone,
                    }
                    : null,
                shipping_address: addressResult.rows[0] || null,
                items: itemsResult.rows.map((item) => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    variant_id: item.variant_id,
                    product_id: item.product_id,
                    sku: item.sku,
                    variant_title: item.variant_title,
                })),
            };
        }));
        res.json({
            orders,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: parseInt(offset) + orders.length < total,
            },
        });
    }
    catch (error) {
        console.error("[Odoo Orders] Error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL29kb28vb3JkZXJzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHFEQUFzRTtBQUV0RTs7O0dBR0c7QUFDSSxNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDbkUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFaEYsTUFBTSxFQUNKLE1BQU0sRUFDTixTQUFTLEVBQ1QsT0FBTyxFQUNQLEtBQUssR0FBRyxJQUFJLEVBQ1osTUFBTSxHQUFHLEdBQUcsRUFDWixNQUFNLEdBQ1AsR0FBRyxHQUFHLENBQUMsS0FPUCxDQUFDO0lBRUYsSUFBSSxDQUFDO1FBQ0gsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQzlCLE1BQU0sTUFBTSxHQUFVLEVBQUUsQ0FBQztRQUV6QixtQkFBbUI7UUFDbkIsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNYLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsV0FBVyxJQUFJLHFCQUFxQixRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsdUJBQXVCO1FBQ3ZCLElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCxXQUFXLElBQUksd0JBQXdCLENBQUM7WUFDeEMsTUFBTSxD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