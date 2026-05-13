"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.POST = POST;
const media_1 = require("../../../modules/media");
// Admin endpoints require authentication
exports.AUTHENTICATE = true;
/**
 * GET /admin/media
 * Query: limit, offset
 */
async function GET(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const limit = Number(req.query.limit || 50);
        const offset = Number(req.query.offset || 0);
        const [rows, count] = await mediaService.listAndCountMedia({}, { take: limit, skip: offset });
        // Return DB fields as-is (admin UI expects url, thumbnail_url etc)
        const media = (rows || []).map((m) => ({
            id: m.id,
            url: m.url,
            mime_type: m.mime_type || null,
            title: m.title || null,
            title_ar: m.title_ar || null,
            alt_text: m.alt_text || null,
            thumbnail_url: m.thumbnail_url || null,
            brand: m.brand || null,
            views: m.views ?? 0,
            display_order: m.display_order ?? 0,
            is_featured: !!m.is_featured,
            product_ids: m.product_ids || [],
            metadata: m.metadata || null,
        }));
        res.json({ media, count: count || 0 });
    }
    catch (e) {
        console.error('Admin media GET error:', e);
        res.status(500).json({ message: e?.message || 'Failed to list media' });
    }
}
/**
 * POST /admin/media
 * Body: { url, title?, mime_type?, thumbnail_url? }
 */
async function POST(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const body = (req.body || {});
        const payload = {
            url: body.url,
            title: body.title,
            title_ar: body.title_ar,
            mime_type: body.mime_type,
            alt_text: body.alt_text,
            thumbnail_url: body.thumbnail_url,
            brand: body.brand,
            views: typeof body.views === "number" ? body.views : undefined,
            display_order: typeof body.display_order === "number" ? body.display_order : undefined,
            is_featured: typeof body.is_featured === "boolean" ? body.is_featured : undefined,
            product_ids: Array.isArray(body.product_ids) ? body.product_ids : [],
            metadata: body.metadata,
        };
        const created = await (typeof mediaService.createMedia === 'function'
            ? mediaService.createMedia(payload)
            : mediaService.createMedias(payload));
        const result = Array.isArray(created) ? created[0] : created;
        res.status(201).json({ media: result });
    }
    catch (e) {
        console.error('Admin media POST error:', e);
        res.status(500).json({ message: e?.message || 'Failed to create media' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21lZGlhL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVVBLGtCQThCQztBQU1ELG9CQThCQztBQTNFRCxrREFBcUQ7QUFFckQseUNBQXlDO0FBQzVCLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUVoQzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQVksQ0FBUSxDQUFBO1FBQzNELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUMzQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUE7UUFFNUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBRTdGLG1FQUFtRTtRQUNuRSxNQUFNLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ1IsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHO1lBQ1YsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksSUFBSTtZQUM5QixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJO1lBQ3RCLFFBQVEsRUFBRSxD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