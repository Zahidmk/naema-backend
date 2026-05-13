"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /odoo/customers
 * Get customers for Odoo integration
 */
const GET = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { limit = "50", offset = "0", created_after, email, phone, } = req.query;
    try {
        let whereClause = "WHERE 1=1";
        const params = [];
        if (created_after) {
            whereClause += ` AND c.created_at >= ?`;
            params.push(created_after);
        }
        if (email) {
            whereClause += ` AND c.email ILIKE ?`;
            params.push(`%${email}%`);
        }
        if (phone) {
            whereClause += ` AND c.phone ILIKE ?`;
            params.push(`%${phone}%`);
        }
        // Get total count
        const countResult = await pgConnection.raw(`SELECT COUNT(*) as total FROM customer c ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].total) || 0;
        // Get customers
        const customersResult = await pgConnection.raw(`SELECT 
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.has_account,
        c.created_at,
        c.updated_at,
        c.metadata
       FROM customer c
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`, [...params, parseInt(limit), parseInt(offset)]);
        // Get addresses for each customer
        const customers = await Promise.all(customersResult.rows.map(async (customer) => {
            // Get addresses
            const addressResult = await pgConnection.raw(`SELECT 
            a.id,
            a.first_name,
            a.last_name,
            a.address_1,
            a.address_2,
            a.city,
            a.postal_code,
            a.phone,
            a.country_code,
            a.province,
            a.is_default_shipping,
            a.is_default_billing
           FROM customer_address a
           WHERE a.customer_id = ?`, [customer.id]);
            // Get order count
            const orderCountResult = await pgConnection.raw(`SELECT COUNT(*) as count FROM "order" WHERE customer_id = ?`, [customer.id]);
            // Get total spent (MedusaJS 2.x: order_item has quantity, order_line_item has unit_price)
            const totalSpentResult = await pgConnection.raw(`SELECT COALESCE(SUM(
            (SELECT SUM(li.unit_price * oi.quantity) 
             FROM order_item oi 
             JOIN order_line_item li ON oi.item_id = li.id 
             WHERE oi.order_id = o.id)
           ), 0) as total
           FROM "order" o WHERE o.customer_id = ?`, [customer.id]);
            return {
                id: customer.id,
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
                phone: customer.phone,
                has_account: customer.has_account,
                created_at: customer.created_at,
                updated_at: customer.updated_at,
                metadata: customer.metadata,
                addresses: addressResult.rows || [],
                stats: {
                    order_count: parseInt(orderCountResult.rows[0].count) || 0,
                    total_spent: parseFloat(totalSpentResult.rows[0].total) || 0,
                },
            };
        }));
        res.json({
            customers,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: parseInt(offset) + customers.length < total,
            },
        });
    }
    catch (error) {
        console.error("[Odoo Customers] Error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL29kb28vY3VzdG9tZXJzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHFEQUFzRTtBQUV0RTs7O0dBR0c7QUFDSSxNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDbkUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFaEYsTUFBTSxFQUNKLEtBQUssR0FBRyxJQUFJLEVBQ1osTUFBTSxHQUFHLEdBQUcsRUFDWixhQUFhLEVBQ2IsS0FBSyxFQUNMLEtBQUssR0FDTixHQUFHLEdBQUcsQ0FBQyxLQU1QLENBQUM7SUFFRixJQUFJLENBQUM7UUFDSCxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDOUIsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO1FBRXpCLElBQUksYUFBYSxFQUFFLENBQUM7WUFDbEIsV0FBVyxJQUFJLHdCQUF3QixDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixXQUFXLElBQUksc0JBQXNCLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixXQUFXLElBQUksc0JBQXNCLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixNQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3hDLDRDQUE0QyxXQUFXLEVBQUUsRUFDekQs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