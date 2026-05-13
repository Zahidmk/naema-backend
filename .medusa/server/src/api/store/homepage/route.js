"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const media_1 = require("../../../modules/media");
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/homepage
 * Returns homepage sections: banners + product grids grouped by collection.
 * Uses raw SQL to fetch products by collection — reliable and fast.
 */
const SECTION_HANDLES = {
    host_deals: ['hot-deals'],
    best_in_powerbanks: ['best-in-power-banks', 'powerbanks', 'powerbank'],
    best_in_laptops: ['best-in-laptops', 'laptops', 'laptop'],
    new_arrival: ['new-arrival', 'new-arrivals'],
    apple: ['apple'],
    // 'recommended' is intentionally omitted — built dynamically from best sellers (completed orders)
};
async function GET(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
        // Use BACKEND_URL env or build from request headers (works on localhost AND production)
        const origin = (process.env.BACKEND_URL ||
            process.env.MEDUSA_URL ||
            `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
        const makeAbsolute = (u) => {
            if (!u)
                return null;
            // Strip any hardcoded localhost URL so it works on production too
            let cleaned = u
                .replace(/^https?:\/\/localhost:\d+/, '')
                .replace(/^https?:\/\/127\.0\.0\.1:\d+/, '');
            if (cleaned.startsWith('http://') || cleaned.startsWith('https://'))
                return cleaned;
            return `${origin}${cleaned.startsWith('/') ? cleaned : '/' + cleaned}`;
        };
        // ── Banners ──────────────────────────────────────────────
        const mapBanners = (rows) => (rows || []).map((b) => ({
            id: b.id,
            title: b.title || null,
            link: b.link || null,
            position: b.position || null,
            image_url: makeAbsolute(b.image_url || null),
            media: { url: makeAbsolute(b.image_url || null) },
        }));
        const [heroRows] = await mediaService.listAndCountBanners({ is_active: true, position: "hero" }, { order: { display_order: "ASC" }, take: 12 });
        const [singleRows] = await mediaService.listAndCountBanners({ is_active: true, position: "single" }, { order: { display_order: "ASC" }, take: 4 });
        const [dualRows] = await mediaService.listAndCountBanners({ is_active: true, position: "dual" }, { order: { display_order: "ASC" }, take: 4 });
        const [tripleRows] = await mediaService.listAndCountBanners({ is_active: true, position: "triple" }, { order: { display_order: "ASC" }, take: 6 });
        const banners = mapBanners(heroRows);
        const singleBanners = mapBanners(singleRows);
        const dualBanners = mapBanners(dualRows);
        const tripleBanners = mapBanners(tripleRows);
        // ── Fetch products by collection handle using raw SQL ─────
        async function fetchByCollection(handles, limit) {
            if (!handles.length)
                return [];
            const placeholders = handles.map(() => '?').join(', ');
            const query = `
        SELECT p.id, p.title, p.handle, p.subtitle, p.description,
               p.thumbnail, p.status, p.collection_id, p.created_at,
               p.metadata
        FROM product p
        INNER JOIN product_collection pc ON p.collection_id = pc.id
        WHERE pc.handle IN (${placeholders})
          AND p.status = 'published'
        ORDER BY p.created_at DESC
        LIMIT ?
      `;
            const result = await pgConnection.raw(query, [...handles, limit]);
            const products = result.rows || [];
            // Fetch images and variants for these products
            if (products.length > 0) {
                const productIds = products.map((p) => p.id);
                const idPlaceholders = productIds.map(() => '?').join(', ');
                const imgResult = await pgConnection.raw(`SELECT id, product_id, url, rank FROM image WHERE product_id IN (${idPlaceholders}) ORDER BY rank ASC`, productIds);
                const imagesByProduct = {};
                for (const img of (imgResult.rows || [])) {
                    if (!imagesByProduct[img.product_id])
                        imagesByProduct[img.product_id] = [];
                    imagesByProduct[img.product_id].push({ ...img, url: makeAbsolute(img.url) });
                }
                const varResult = await pgConnection.raw(`SELECT pv.id, pv.product_id, pv.title, pv.sku, pv.manage_inventory,
                  pvp.amount, pvp.currency_code
           FROM product_variant pv
           LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
           LEFT JOIN price pvp ON pvp.price_set_id = pvps.price_set_id
           WHERE pv.product_id IN (${idPlaceholders})`, productIds);
                const variantsByProduct = {};
                for (const v of (varResult.rows || [])) {
                    if (!variantsByProduct[v.product_id])
                        variantsByProduct[v.product_id] = [];
                    const existing = variantsByProduct[v.product_id].find((ev) => ev.id === v.id);
                    if (existing) {
                        if (v.amount != null) {
                            existing.prices = existing.prices || [];
                            existing.prices.push({ amount: v.amount, currency_code: v.currency_code });
                        }
                    }
                    else {
                        variantsByProduct[v.product_id].push({
                            id: v.id,
                            title: v.title,
                            sku: v.sku,
                            manage_inventory: v.manage_inventory,
                            prices: v.amount != null ? [{ amount: v.amount, currency_code: v.currency_code }] : [],
                        });
                    }
                }
                return products.map((p) => ({
                    ...p,
                    thumbnail: makeAbsolute(p.thumbnail),
                    images: imagesByProduct[p.id] || [],
                    variants: variantsByProduct[p.id] || [],
                }));
            }
            return products;
        }
        // Fetch all sections
        async function fetchSection(sectionId, limit = 12) {
            const handles = SECTION_HANDLES[sectionId] || [];
            return fetchByCollection(handles, limit);
        }
        const [hostDeals, powerbanks, laptops, newArrivals, appleProducts] = await Promise.all([
            fetchSection('host_deals', 8),
            fetchSection('best_in_powerbanks', 8),
            fetchSection('best_in_laptops', 8),
            fetchSection('new_arrival', 12),
            fetchSection('apple', 12),
        ]);
        // ── Recommended = Best Sellers (auto, no manual curation needed) ──────────
        // Count how many times each product appears in completed orders.
        // Falls back to newest published products if there are no completed orders yet.
        let recommendedFinal = [];
        try {
            const bestSellersResult = await pgConnection.raw(`
        SELECT
          p.id, p.title, p.handle, p.subtitle, p.description,
          p.thumbnail, p.status, p.collection_id, p.created_at, p.metadata,
          COUNT(oi.id) AS order_count
        FROM product p
        JOIN product_variant pv ON pv.product_id = p.id
        JOIN order_line_item li ON li.variant_id = pv.id
        JOIN order_item oi ON oi.item_id = li.id
        JOIN "order" o ON o.id = oi.order_id
        WHERE o.status = 'completed'
          AND p.status = 'published'
        GROUP BY p.id, p.title, p.handle, p.subtitle, p.description,
                 p.thumbnail, p.status, p.collection_id, p.created_at, p.metadata
        ORDER BY order_count DESC
        LIMIT 24
      `);
            recommendedFinal = bestSellersResult.rows || [];
        }
        catch (e) {
            // order table may differ — log and fall through to fallback
            console.warn('Best sellers query failed, using fallback:', e?.message);
        }
        // Fallback: newest published products when no completed orders exist yet
        if (!recommendedFinal.length) {
            const fallback = await pgConnection.raw(`SELECT id, title, handle, subtitle, description, thumbnail, status, collection_id, created_at, metadata
         FROM product WHERE status = 'published'
         ORDER BY created_at DESC LIMIT 24`);
            recommendedFinal = fallback.rows || [];
        }
        // Hydrate with images + variants (same as fetchByCollection does)
        if (recommendedFinal.length > 0) {
            const productIds = recommendedFinal.map((p) => p.id);
            const idPlaceholders = productIds.map(() => '?').join(', ');
            const imgResult = await pgConnection.raw(`SELECT id, product_id, url, rank FROM image WHERE product_id IN (${idPlaceholders}) ORDER BY rank ASC`, productIds);
            const imagesByProduct = {};
            for (const img of (imgResult.rows || [])) {
                if (!imagesByProduct[img.product_id])
                    imagesByProduct[img.product_id] = [];
                imagesByProduct[img.product_id].push({ ...img, url: makeAbsolute(img.url) });
            }
            const varResult = await pgConnection.raw(`SELECT pv.id, pv.product_id, pv.title, pv.sku, pv.manage_inventory,
                pvp.amount, pvp.currency_code
         FROM product_variant pv
         LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
         LEFT JOIN price pvp ON pvp.price_set_id = pvps.price_set_id
         WHERE pv.product_id IN (${idPlaceholders})`, productIds);
            const variantsByProduct = {};
            for (const v of (varResult.rows || [])) {
                if (!variantsByProduct[v.product_id])
                    variantsByProduct[v.product_id] = [];
                const existing = variantsByProduct[v.product_id].find((ev) => ev.id === v.id);
                if (existing) {
                    if (v.amount != null) {
                        existing.prices = existing.prices || [];
                        existing.prices.push({ amount: v.amount, currency_code: v.currency_code });
                    }
                }
                else {
                    variantsByProduct[v.product_id].push({
                        id: v.id,
                        title: v.title,
                        sku: v.sku,
                        manage_inventory: v.manage_inventory,
                        prices: v.amount != null ? [{ amount: v.amount, currency_code: v.currency_code }] : [],
                    });
                }
            }
            recommendedFinal = recommendedFinal.map((p) => ({
                ...p,
                thumbnail: makeAbsolute(p.thumbnail),
                images: imagesByProduct[p.id] || [],
                variants: variantsByProduct[p.id] || [],
            }));
        }
        // ── Build response ───────────────────────────────────────
        const toItems = (products) => products.map((p) => ({ id: p.id, type: 'product', product_id: p.id }));
        const sections = [
            { id: 'hero', type: 'banner', items: banners },
            { id: 'single_banner', type: 'banner', position: 'single', items: singleBanners },
            { id: 'dual_banner', type: 'banner', position: 'dual', items: dualBanners },
            { id: 'triple_banner', type: 'banner', position: 'triple', items: tripleBanners },
            { id: 'host_deals', type: 'product_grid', title: 'Host Deals', items: toItems(hostDeals), products: hostDeals },
            { id: 'best_in_powerbanks', type: 'product_grid', title: 'Best in Powerbanks', items: toItems(powerbanks), products: powerbanks },
            { id: 'best_in_laptops', type: 'product_grid', title: 'Best in Laptops', items: toItems(laptops), products: laptops },
            { id: 'new_arrival', type: 'product_grid', title: 'New Arrivals', items: toItems(newArrivals), products: newArrivals },
            { id: 'recommended', type: 'product_grid', title: 'Recommended', items: toItems(recommendedFinal), products: recommendedFinal },
            { id: 'apple', type: 'product_grid', title: 'Apple', items: toItems(appleProducts), products: appleProducts },
        ];
        res.json({
            locale: req.query.locale || 'en',
            generated_at: new Date().toISOString(),
            sections,
            banners: { hero: banners, single: singleBanners, dual: dualBanners, triple: tripleBanners },
        });
    }
    catch (e) {
        console.error('Homepage endpoint error:', e);
        res.status(500).json({ message: e?.message || 'Failed to build homepage' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2hvbWVwYWdlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBbUJBLGtCQXdQQztBQTFRRCxrREFBcUQ7QUFDckQscURBQXFFO0FBRXJFOzs7O0dBSUc7QUFFSCxNQUFNLGVBQWUsR0FBNkI7SUFDaEQsVUFBVSxFQUFFLENBQUMsV0FBVyxDQUFDO0lBQ3pCLGtCQUFrQixFQUFFLENBQUMscUJBQXFCLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQztJQUN0RSxlQUFlLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO0lBQ3pELFdBQVcsRUFBRSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUM7SUFDNUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDO0lBQ2hCLGtHQUFrRztDQUNuRyxDQUFBO0FBRU0sS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG9CQUFZLENBQVEsQ0FBQTtRQUMzRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQVEsQ0FBQTtRQUV0Rix3RkFBd0Y7UUFDeEYsTUFBTSxNQUFNLEdBQUcsQ0FDYixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7WUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVO1lBQ3RCLEdBQUcsR0FBRyxDQUFDLFFBQVEsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQ3ZDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUVwQixNQUFNLFlBQVksR0FBRyxDQUFDLENBQWdCLEVBQUUsRUFBRTtZQUN4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