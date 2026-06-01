"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.POST = POST;
exports.AUTHENTICATE = true;
async function GET(req, res) {
    try {
        const pgConnection = req.scope.resolve("__pg_connection__");
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const countResult = await pgConnection.raw(`SELECT COUNT(*) as total FROM brand WHERE deleted_at IS NULL`);
        const count = parseInt(countResult.rows[0].total);
        const result = await pgConnection.raw(`SELECT id, name, slug, description, logo_url, banner_url,
              is_active, is_special, display_order, created_at
       FROM brand
       WHERE deleted_at IS NULL
       ORDER BY display_order ASC NULLS LAST, name ASC
       LIMIT ? OFFSET ?`, [limit, offset]);
        res.json({ brands: result.rows, count, limit, offset });
    }
    catch (e) {
        console.error('Admin brand list error:', e);
        res.status(500).json({ message: e?.message || 'Failed to list brands' });
    }
}
async function POST(req, res) {
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
        if (!body?.name)
            return res.status(400).json({ message: 'name is required' });
        // Generate slug from name when missing
        const makeSlug = (v) => v
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const slug = body.slug && body.slug !== '' ? body.slug : makeSlug(body.name);
        const logoUrl = body.logo ?? body.logo_url ?? null;
        const bannerUrl = body.banner ?? body.banner_url ?? null;
        // Generate a unique id
        const idPrefix = "brand_";
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomPart = "";
        for (let i = 0; i < 20; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const newId = `${idPrefix}${randomPart}`;
        const result = await pgConnection.raw(`INSERT INTO brand (id, name, slug, description, logo_url, banner_url, is_active, is_special, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       RETURNING *`, [
            newId,
            body.name,
            slug,
            body.description ?? null,
            logoUrl,
            bannerUrl,
            body.is_active ?? true,
            body.is_special ?? false,
            body.display_order ?? 0,
        ]);
        res.json({ brand: result.rows[0] });
    }
    catch (e) {
        console.error('Admin brand create error:', e);
        res.status(500).json({ message: e?.message || 'Failed to create brand' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2JyYW5kcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxrQkEwQkM7QUFFRCxvQkF1REM7QUFyRlksUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBRXpCLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUN2RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXhELE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDeEMsOERBQThELENBQy9ELENBQUE7UUFDRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUVqRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ25DOzs7Ozt3QkFLa0IsRUFDbEIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQ2hCLENBQUE7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ3pELENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLENB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