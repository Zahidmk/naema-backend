"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.AUTHENTICATE = false;
/**
 * GET /store/brands
 * Returns active brands synced from Odoo.
 * Logo URLs point to files in the frontend's /public/brands/ folder.
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve("__pg_connection__");
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const countResult = await pgConnection.raw(`SELECT COUNT(*) as total FROM brand WHERE is_active = true AND deleted_at IS NULL`);
    const total = parseInt(countResult.rows[0].total);
    const result = await pgConnection.raw(`SELECT id, name, slug, description, logo_url, banner_url,
            is_active, is_special, display_order, created_at
     FROM brand
     WHERE is_active = true AND deleted_at IS NULL
     ORDER BY display_order ASC NULLS LAST, name ASC
     LIMIT ? OFFSET ?`, [limit, offset]);
    const brands = result.rows.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: b.description || "",
        logo_url: b.logo_url || "",
        banner_url: b.banner_url || "",
        is_active: b.is_active,
        is_special: b.is_special,
        display_order: b.display_order || 99,
        created_at: b.created_at,
    }));
    res.json({ brands, count: total, limit, offset });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2JyYW5kcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFVQSxrQkFtQ0M7QUExQ1ksUUFBQSxZQUFZLEdBQUcsS0FBSyxDQUFBO0FBRWpDOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxZQUFZLEdBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUVqRSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDdkQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUV4RCxNQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3hDLG1GQUFtRixDQUNwRixDQUFBO0lBQ0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNuQzs7Ozs7c0JBS2tCLEVBQ2xCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUNoQixDQUFBO0lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQ1IsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1FBQ1osSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQztRQUNoRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxFQUFFO1FBQ2hDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUU7UUFDMUIsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLElBQUksRUFBRTtRQUM5QixTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVM7UUFDdEIsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVO1FBQ3hCLGFBQWEsRUFBRSxDQUFDLENBQUMsYUFBYSxJQUFJLEVBQUU7UUFDcEMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVO0tBQ3pCLENBQUMsQ0FBQyxDQUFBO0lBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0FBQ25ELENBQUMifQ==