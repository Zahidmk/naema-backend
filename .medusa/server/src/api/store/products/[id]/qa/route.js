"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/products/:id/qa
 * Get Q&A for a product
 *
 * POST /store/products/:id/qa
 * Ask a question about a product
 * Body: { customer_id, question }
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const productId = req.params.id;
    try {
        // Check if product_qa table exists
        const tableExists = await pgConnection.raw(`SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = 'product_qa'
       ) as exists`);
        if (!tableExists.rows[0].exists) {
            // Create the table if it doesn't exist
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
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Get approved Q&As
        const qaResult = await pgConnection.raw(`SELECT id, question, answer, customer_name, answered_by, 
              answered_at, created_at
       FROM product_qa
       WHERE product_id = ? AND status = 'approved' AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`, [productId, limit, offset]);
        const countResult = await pgConnection.raw(`SELECT COUNT(*) as total FROM product_qa 
       WHERE product_id = ? AND status = 'approved' AND deleted_at IS NULL`, [productId]);
        res.json({
            questions: qaResult.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit,
            has_more: offset + limit < parseInt(countResult.rows[0].total),
        });
    }
    catch (error) {
        console.error("[Product Q&A GET] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
async function POST(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const productId = req.params.id;
    const { customer_id, customer_name, question } = req.body;
    if (!question) {
        return res.status(400).json({
            type: "invalid_data",
            message: "question is required",
        });
    }
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
        const id = `qa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        // Get customer name if customer_id provided
        let name = customer_name || "Anonymous";
        if (customer_id && !customer_name) {
            const customerResult = await pgConnection.raw(`SELECT first_name, last_name FROM customer WHERE id = ?`, [customer_id]);
            if (customerResult.rows.length > 0) {
                const c = customerResult.rows[0];
                name = `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Customer";
            }
        }
        await pgConnection.raw(`INSERT INTO product_qa (id, product_id, customer_id, customer_name, question, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'approved', NOW(), NOW())`, [id, productId, customer_id || null, name, question]);
        res.status(201).json({
            success: true,
            message: "Question submitted successfully. It will be visible once approved.",
            question_id: id,
        });
    }
    catch (error) {
        console.error("[Product Q&A POST] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Byb2R1Y3RzL1tpZF0vcWEvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFXQSxrQkFpRUM7QUFFRCxvQkFpRUM7QUE5SUQscURBQXFFO0FBRXJFOzs7Ozs7O0dBT0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDL0UsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUE7SUFFL0IsSUFBSSxDQUFDO1FBQ0gsbUNBQW1DO1FBQ25DLE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDeEM7OzttQkFHYSxDQUNkLENBQUE7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQyx1Q0FBdUM7WUFDdkMsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7T0FldEIsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNwRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDdkQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBRWpDLG9CQUFvQjtRQUNwQixNQUFNLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3JDOzs7Ozt3QkFLa0Is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