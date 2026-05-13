"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
const media_1 = require("../../../../modules/media");
const brands_1 = require("../../../../modules/brands");
exports.AUTHENTICATE = false;
/**
 * GET /store/media/videos
 * Returns video media items for the MediaGallery component
 * Query params:
 *   - limit: number (default 10)
 *   - offset: number (default 0)
 *   - featured: boolean (filter featured videos only)
 */
async function GET(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const featured = req.query.featured === 'true';
        // Get all media and filter for videos
        const [allItems, totalCount] = await mediaService.listAndCountMedia({}, {
            take: 200,
            order: { display_order: 'ASC' }
        });
        // Filter for video mime types on the application side
        let items = (allItems || []).filter((m) => m.mime_type && m.mime_type.startsWith('video'));
        if (featured) {
            items = items.filter((m) => m.is_featured === true);
        }
        // Apply pagination
        const count = items.length;
        items = items.slice(offset, offset + limit);
        // Build brand logo map keyed by brand name
        const brandService = req.scope.resolve(brands_1.BRAND_MODULE);
        const [allBrands] = await brandService.listAndCountBrands({}, { take: 200 });
        const brandLogoMap = new Map();
        for (const b of allBrands) {
            brandLogoMap.set(b.name, b.logo_url ?? null);
        }
        const getOrigin = () => {
            const fromEnv = process.env.MEDUSA_URL;
            if (fromEnv)
                return fromEnv.replace(/\/$/, '');
            return `${req.headers['x-forwarded-proto'] || req.protocol || 'http'}://${req.headers.host || 'localhost:9000'}`;
        };
        const origin = getOrigin();
        const makeAbsolute = (u) => {
            if (!u)
                return null;
            if (u.startsWith('http://') || u.startsWith('https://'))
                return u;
            const path = u.startsWith('/') ? u : `/${u}`;
            return `${origin}${path}`;
        };
        const videos = items.map((m) => ({
            id: m.id,
            url: makeAbsolute(m.url || null),
            videoUrl: makeAbsolute(m.url || null), // Alias for frontend compatibility
            mime_type: m.mime_type || null,
            title: m.title || null,
            title_ar: m.title_ar || null,
            titleAr: m.title_ar || null, // Alias for frontend compatibility
            alt_text: m.alt_text || null,
            thumbnail: makeAbsolute(m.thumbnail_url || null),
            thumbnail_url: makeAbsolute(m.thumbnail_url || null),
            brand: m.brand || 'Markasouq',
            brand_logo_url: m.brand ? (brandLogoMap.get(m.brand) ?? null) : null,
            views: m.views || 0,
            display_order: m.display_order || 0,
            is_featured: m.is_featured || false,
            metadata: m.metadata || null,
        }));
        res.json({ videos, count });
    }
    catch (e) {
        console.error('Store videos GET error:', e);
        res.status(500).json({ message: e?.message || 'Failed to list videos' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21lZGlhL3ZpZGVvcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFlQSxrQkF5RUM7QUF2RkQscURBQXdEO0FBQ3hELHVEQUF5RDtBQUc1QyxRQUFBLFlBQVksR0FBRyxLQUFLLENBQUE7QUFFakM7Ozs7Ozs7R0FPRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFRLENBQUE7UUFFM0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBZSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDeEQsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFBO1FBRTlDLHNDQUFzQztRQUN0QyxNQUFNLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRTtZQUN0RSxJQUFJLEVBQUUsR0FBRztZQUNULEtBQUssRUFBRSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUU7U0FDaEMsQ0FBQyxDQUFBO1FBRUYsc0RBQXNEO1FBQ3RELElBQUksS0FBSyxHQUFHLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQzdDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQy9DLENBQUE7UUFFRCxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLENBQUE7UUFDMUQsQ0FBQztRQUVELG1CQUFtQjtRQUNuQixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFBO1FBQzFCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUE7UUFFM0MsMkNBQTJDO1FBQzNDLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFlLHFCQUFZLENBQUMsQ0FBQTtRQUNsRSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDNUUsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUE7UUFDckQsS0FBSyxNQUFNLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUMxQixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQTtRQUM5QyxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsR0FBRyxFQUFFO1lBQ3JCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFBO1lBQ3RDLElBQUksT0FBTztnQkFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQzlDLE9BQU8sR0FBSSxHQUFHLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFZLElBQUssR0FBRyxDQUFDLFFBQW1CLElBQUksTUFBTSxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLGdCQUFnQixFQUFFLENBQUE7UUFDMUksQ0FBQyxDQUFBO1FBRUQsTUFBTSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUE7UUFDMUIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFnQixFQUFFLEVBQUU7WUFDeEMsSUFBSSxDQUFDLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUE7WUFDbkIsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO2dCQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQ2pFLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQTtZQUM1QyxPQUFPLEdBQUcsTUFBTSxHQUFHLElBQUksRUFBRSxDQUFBO1FBQzNCLENBQUMsQ0FBQTtRQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ1IsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQztZQUNoQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsbUNBQW1DO1lBQzFFLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLElBQUk7WUFDOUIsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSTtZQUN0QixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJO1lBQzVCLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRSxtQ0FBbUM7WUFDaEUsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSTtZQUM1QixTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDO1lBQ2hELGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUM7WUFDcEQsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksV0FBVztZQUM3QixjQUFjLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNwRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDO1lBQ25CLGFBQWEsRUFBRSxDQUFDLENBQUMsYUFBYSxJQUFJLENBQUM7WUFDbkMsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksS0FBSztZQUNuQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJO1NBQzdCLENBQUMsQ0FBQyxDQUFBO1FBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDM0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sSUFBSSx1QkFBdUIsRUFBRSxDQUFDLENBQUE7SUFDMUUsQ0FBQztBQUNILENBQUMifQ==