"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const media_1 = require("../../../modules/media");
const brands_1 = require("../../../modules/brands");
exports.AUTHENTICATE = false;
async function GET(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const gallery_id = req.query.gallery_id;
        let items = [];
        let count = 0;
        if (gallery_id) {
            const mediaIds = await mediaService.listGalleryMediaIds(gallery_id);
            if (!mediaIds || !mediaIds.length)
                return res.json({ media: [], count: 0 });
            const [rows, c] = await mediaService.listAndCountMedia({ id: { $in: mediaIds } }, { take: 200 });
            items = rows || [];
            count = c || 0;
        }
        else {
            const [rows, c] = await mediaService.listAndCountMedia({}, { take: 200 });
            items = rows || [];
            count = c || 0;
        }
        // Build a brand logo map keyed by brand name for O(1) lookup per media item
        const brandService = req.scope.resolve(brands_1.BRAND_MODULE);
        const [allBrands] = await brandService.listAndCountBrands({}, { take: 200 });
        const brandLogoMap = new Map();
        for (const b of allBrands) {
            brandLogoMap.set(b.name, { logo_url: b.logo_url ?? null, slug: b.slug ?? null });
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
        // Collect all product IDs across all media items to batch-fetch them
        const allProductIds = [];
        for (const m of items) {
            const pids = Array.isArray(m.product_ids) ? m.product_ids : [];
            for (const pid of pids) {
                if (pid && !allProductIds.includes(pid))
                    allProductIds.push(pid);
            }
        }
        // Batch-fetch products from the DB using raw SQL for performance
        // Uses Medusa v2 pricing tables: price + product_variant_price_set
        const productMap = new Map();
        if (allProductIds.length > 0) {
            try {
                const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
                // Knex raw() uses ? placeholders (not $1,$2), and bindings must be wrapped in an object {bindings:[]}
                const placeholders = allProductIds.map(() => '?').join(', ');
                const result = await pgConnection.raw(`SELECT DISTINCT ON (p.id)
                  p.id, p.title, p.handle, p.thumbnail,
                  pr.amount as calculated_price
           FROM product p
           LEFT JOIN product_variant pvar ON pvar.product_id = p.id AND pvar.deleted_at IS NULL
           LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pvar.id
           LEFT JOIN price pr ON pr.price_set_id = pvps.price_set_id
           WHERE p.id IN (${placeholders}) AND p.deleted_at IS NULL
           ORDER BY p.id, pr.amount ASC`, allProductIds);
                for (const row of result.rows) {
                    productMap.set(row.id, {
                        id: row.id,
                        title: row.title,
                        handle: row.handle || null,
                        thumbnail: row.thumbnail || null,
                        price: row.calculated_price ? (row.calculated_price / 100).toFixed(2) : null,
                    });
                }
            }
            catch (err) {
                console.error('Failed to fetch products for media:', err);
            }
        }
        const media = items.map((m) => {
            const brandInfo = m.brand ? brandLogoMap.get(m.brand) : null;
            const pids = Array.isArray(m.product_ids) ? m.product_ids : [];
            const related_products = pids.map((pid) => productMap.get(pid)).filter(Boolean);
            return {
                id: m.id,
                url: makeAbsolute(m.url || null),
                mime_type: m.mime_type || null,
                title: m.title || null,
                title_ar: m.title_ar || null,
                alt_text: m.alt_text || null,
                thumbnail_url: makeAbsolute(m.thumbnail_url || null),
                brand: m.brand || null,
                brand_logo_url: brandInfo ? brandInfo.logo_url : null,
                brand_slug: brandInfo ? brandInfo.slug : null,
                views: m.views ?? 0,
                display_order: m.display_order ?? 0,
                is_featured: !!m.is_featured,
                product_ids: pids,
                related_products,
                metadata: m.metadata || null,
            };
        });
        res.json({ media, count });
    }
    catch (e) {
        console.error('Store media GET error:', e);
        res.status(500).json({ message: e?.message || 'Failed to list media' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21lZGlhL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVNBLGtCQWtIQztBQTFIRCxxREFBcUU7QUFDckUsa0RBQXFEO0FBQ3JELG9EQUFzRDtBQUl6QyxRQUFBLFlBQVksR0FBRyxLQUFLLENBQUE7QUFFMUIsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG9CQUFZLENBQVEsQ0FBQTtRQUMzRCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQWdDLENBQUE7UUFDN0QsSUFBSSxLQUFLLEdBQVUsRUFBRSxDQUFBO1FBQ3JCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtRQUViLElBQUksVUFBVSxFQUFFLENBQUM7WUFDZixNQUFNLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUNuRSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07Z0JBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUMzRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtZQUNoRyxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtZQUNsQixLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtR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