"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
const media_1 = require("../../../../modules/media");
// Public store endpoint (no admin auth required)
exports.AUTHENTICATE = false;
/**
 * GET /store/media/banners
 * Optional query: type=hero|dual|triple
 * Returns active banners mapped for storefront: { id, link, media: { url } }
 */
async function GET(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const type = String(req.query.type || "").toLowerCase();
        // Map storefront "type" to our Banner.position values
        // Align with Admin positions seen in UI: hero | dual | triple
        const positionFilter = type === "hero" ? "hero" :
            type === "single" ? "single" :
                type === "dual" ? "dual" :
                    type === "triple" ? "triple" :
                        type === "hot_deal" ? "hot_deal" : undefined;
        const where = { is_active: true };
        if (positionFilter)
            where.position = positionFilter;
        // Optional: honor schedule
        const nowIso = new Date().toISOString();
        where["$and"] = [
            {
                $or: [
                    { start_at: null },
                    { start_at: { $lte: nowIso } },
                ],
            },
            {
                $or: [
                    { end_at: null },
                    { end_at: { $gte: nowIso } },
                ],
            },
        ];
        const [rows] = await mediaService.listAndCountBanners(where, {
            order: { display_order: "ASC" },
            take: 12,
        });
        // Helper to make absolute URLs for backend-hosted static assets
        const getOrigin = () => {
            const fromEnv = process.env.MEDUSA_URL;
            if (fromEnv)
                return fromEnv.replace(/\/$/, '');
            const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
            const host = req.headers.host || 'localhost:9000';
            return `${proto}://${host}`;
        };
        const origin = getOrigin();
        const makeAbsolute = (u) => {
            if (!u)
                return null;
            if (u.startsWith('http://') || u.startsWith('https://'))
                return u;
            // ensure leading slash
            const path = u.startsWith('/') ? u : `/${u}`;
            return `${origin}${path}`;
        };
        // Shape for frontend components: media.url (absolute)
        const banners = (rows || []).map((b) => ({
            id: b.id,
            link: b.link || null,
            position: b.position || null,
            // Keep legacy field for HeroSlider (absolute)
            image_url: makeAbsolute(b.image_url || null),
            // Also provide normalized media.url for Dual/Triple components (absolute)
            media: { url: makeAbsolute(b.image_url || null) },
            title: b.title || null,
        }));
        res.json({ banners });
    }
    catch (e) {
        console.error("Store banners error:", e);
        res.status(500).json({ message: e?.message || "Failed to fetch banners" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21lZGlhL2Jhbm5lcnMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBV0Esa0JBMkVDO0FBckZELHFEQUF3RDtBQUV4RCxpREFBaUQ7QUFDcEMsUUFBQSxZQUFZLEdBQUcsS0FBSyxDQUFBO0FBRWpDOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQVksQ0FBUSxDQUFBO1FBQzNELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUV2RCxzREFBc0Q7UUFDdEQsOERBQThEO1FBQzlELE1BQU0sY0FBYyxHQUNsQixJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3hCLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUM1QixJQUFJLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtRQUV0RCxNQUFNLEtBQUssR0FBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtRQUN0QyxJQUFJLGNBQWM7WUFBRSxLQUFLLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQTtRQUVuRCwyQkFBMkI7UUFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxJ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