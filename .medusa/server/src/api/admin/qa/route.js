"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PATCH = PATCH;
exports.DELETE = DELETE;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /admin/qa
 * List all product Q&A questions
 * Query params: ?status=pending|approved|answered&product_id=&page=&limit=
 *
 * PATCH /admin/qa
 * Answer or update status of a question
 * Body: { id, answer, status, answered_by }
 *
 * DELETE /admin/qa
 * Delete a question
 * Body: { id }
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const status = req.query.status || null;
    const productId = req.query.product_id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    try {
        // Ensure table exists
        await pgConnection.raw(`
      CREATE TABLE IF NOT EXISTS product_qa (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        customer_id VARCHAR(255),
        customer_name VARCHAR(255),
        question TEXT NOT NULL,
        answer TEXT,
        answered_by VARCHAR(255),
        answered_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `);
        const conditions = ["deleted_at IS NULL"];
        const bindings = [];
        if (status) {
            conditions.push("status = ?");
            bindings.push(status);
        }
        if (productId) {
            conditions.push("product_id = ?");
            bindings.push(productId);
        }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const qaResult = await pgConnection.raw(`SELECT id, product_id, customer_id, customer_name, question, answer,
              answered_by, answered_at, status, created_at, updated_at
       FROM product_qa
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`, [...bindings, limit, offset]);
        const countResult = await pgConnection.raw(`SELECT COUNT(*) as total FROM product_qa ${where}`, bindings);
        // Get pending count for badge
        const pendingResult = await pgConnection.raw(`SELECT COUNT(*) as pending FROM product_qa WHERE status = 'pending' AND deleted_at IS NULL`);
        res.json({
            questions: qaResult.rows,
            total: parseInt(countResult.rows[0].total),
            pending_count: parseInt(pendingResult.rows[0].pending),
            page,
            limit,
            has_more: offset + limit < parseInt(countResult.rows[0].total),
        });
    }
    catch (error) {
        console.error("[Admin Q&A GET] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
async function PATCH(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id, answer, status, answered_by } = req.body;
    if (!id) {
        return res.status(400).json({ type: "invalid_data", message: "id is required" });
    }
    try {
        const updates = ["updated_at = NOW()"];
        const bindings = [];
        if (answer !== undefined) {
            updates.push("answer = ?");
            bindings.push(answer);
            updates.push("answered_at = NOW()");
            updates.push("status = 'answered'");
            if (answered_by) {
                updates.push("answered_by = ?");
                bindings.push(answered_by);
            }
        }
        if (status && status !== "answered") {
            updates.push("status = ?");
            bindings.push(status);
        }
        bindings.push(id);
        await pgConnection.raw(`UPDATE product_qa SET ${updates.join(", ")} WHERE id = ?`, bindings);
        const result = await pgConnection.raw(`SELECT * FROM product_qa WHERE id = ?`, [id]);
        res.json({ success: true, question: result.rows[0] });
    }
    catch (error) {
        console.error("[Admin Q&A PATCH] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
async function DELETE(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ type: "invalid_data", message: "id is required" });
    }
    try {
        await pgConnection.raw(`UPDATE product_qa SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?`, [id]);
        res.json({ success: true, message: "Question deleted" });
    }
    catch (error) {
        console.error("[Admin Q&A DELETE] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3FhL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBaUJBLGtCQTBFQztBQUVELHNCQWtEQztBQUVELHdCQWtCQztBQWxLRCxxREFBcUU7QUFFckU7Ozs7Ozs7Ozs7OztHQVlHO0FBRUksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRS9FLE1BQU0sTUFBTSxHQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBaUIsSUFBSSxJQUFJLENBQUE7SUFDbkQsTUFBTSxTQUFTLEdBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFxQixJQUFJLElBQUksQ0FBQTtJQUMxRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBZSxDQUFDLElBQUksRUFBRSxDQUFBO0lBQ3ZELE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtJQUVqQyxJQUFJLENBQUM7UUFDSCxzQkFBc0I7UUFDdEIsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7S0FldEIsQ0FBQyxDQUFBO1FBRUYsTUFBTSxVQUFVLEdBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBQ25ELE1BQU0sUUFBUSxHQUFjLEVBQUUsQ0FBQTtRQUU5QixJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUM3QixRQUFRLENB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