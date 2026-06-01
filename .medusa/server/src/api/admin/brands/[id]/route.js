"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
// Admin endpoints should require authentication
exports.AUTHENTICATE = true;
/**
 * GET /admin/brands/:id
 * Get a single brand by ID
 */
async function GET(req, res) {
    try {
        const pgConnection = req.scope.resolve("__pg_connection__");
        const result = await pgConnection.raw(`SELECT id, name, slug, description, logo_url, banner_url,
              is_active, is_special, display_order, created_at
       FROM brand WHERE id = ? AND deleted_at IS NULL`, [req.params.id]);
        if (!result.rows.length)
            return res.status(404).json({ message: 'Brand not found' });
        res.json({ brand: result.rows[0] });
    }
    catch (e) {
        console.error('Admin brand GET error:', e);
        res.status(500).json({ message: e?.message || 'Failed to retrieve brand' });
    }
}
/**
 * PUT /admin/brands/:id
 * Update a brand — uses raw SQL for reliability
 */
async function PUT(req, res) {
    try {
        const pgConnection = req.scope.resolve("__pg_connection__");
        // Safety: if body arrives as a JSON string (double-stringified by caller), parse it
        let rawBody = req.body || {};
        if (typeof rawBody === "string") {
            try {
                rawBody = JSON.parse(rawBody);
            }
            catch { /* leave as-is */ }
        }
        const body = rawBody;
        console.log('[Brand PUT] id:', req.params.id, 'body:', JSON.stringify(body));
        // Check brand exists
        const existing = await pgConnection.raw(`SELECT id FROM brand WHERE id = ? AND deleted_at IS NULL`, [req.params.id]);
        if (!existing.rows.length)
            return res.status(404).json({ message: 'Brand not found' });
        // Build dynamic SET clause — only update fields that were provided
        const allowedFields = ['name', 'description', 'logo_url', 'banner_url', 'is_active', 'is_special', 'display_order'];
        const setClauses = [];
        const values = [];
        // Normalize: accept `logo` as `logo_url`
        if (body.logo && !body.logo_url)
            body.logo_url = body.logo;
        if (body.banner && !body.banner_url)
            body.banner_url = body.banner;
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                values.push(body[field]);
            }
        }
        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        // Always update updated_at
        setClauses.push(`updated_at = NOW()`);
        values.push(req.params.id); // for WHERE clause
        const sql = `UPDATE brand SET ${setClauses.join(', ')} WHERE id = ? AND deleted_at IS NULL RETURNING *`;
        console.log('[Brand PUT] SQL:', sql, 'values:', values);
        const result = await pgConnection.raw(sql, values);
        const brand = result.rows[0];
        console.log('[Brand PUT] updated:', brand?.name, 'is_special:', brand?.is_special, 'is_active:', brand?.is_active);
        res.json({ brand });
    }
    catch (e) {
        console.error('Admin brand PUT error:', e);
        res.status(500).json({ message: e?.message || 'Failed to update brand' });
    }
}
/**
 * DELETE /admin/brands/:id
 * Soft-delete a brand
 */
async function DELETE(req, res) {
    try {
        const pgConnection = req.scope.resolve("__pg_connection__");
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'id is required' });
        const existing = await pgConnection.raw(`SELECT id FROM brand WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (!existing.rows.length)
            return res.status(404).json({ message: 'Brand not found' });
        // Soft delete
        await pgConnection.raw(`UPDATE brand SET deleted_at = NOW() WHERE id = ?`, [id]);
        // Also remove product-brand links
        await pgConnection.raw(`DELETE FROM product_brand WHERE brand_id = ?`, [id]).catch(() => { });
        res.status(204).send();
    }
    catch (e) {
        console.error('Admin brand DELETE error:', e);
        res.status(500).json({ message: e?.message || 'Failed to delete brand' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2JyYW5kcy9baWRdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVVBLGtCQWtCQztBQU1ELGtCQTBEQztBQU1ELHdCQTRCQztBQTNIRCxnREFBZ0Q7QUFDbkMsUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBRWhDOzs7R0FHRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQ3ZCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFTLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDakUsTUFBTSxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNuQzs7c0RBRWdELEVBQ2hELENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FDaEIsQ0FBQTtRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtRQUNwRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3JDLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDMUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sSUFBSSwwQkFBMEIsRUFBRSxDQUFDLENBQUE7SUFDN0UsQ0FBQztBQUNI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