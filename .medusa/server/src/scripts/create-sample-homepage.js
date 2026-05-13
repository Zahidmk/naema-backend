"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createSampleHomepage;
const media_1 = require("../modules/media");
const utils_1 = require("@medusajs/framework/utils");
async function createSampleHomepage({ container }) {
    const mediaService = container.resolve(media_1.MEDIA_MODULE);
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    console.log('🔍 Ensuring hero banners exist...');
    const [existingHero] = await mediaService.listAndCountBanners({ position: 'hero' }, { take: 1 });
    if (!existingHero || existingHero.length === 0) {
        console.log('🖼 Creating sample media and hero banner...');
        const media = await mediaService.createMedias({
            url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sonos-product-1.webp',
            mime_type: 'image/webp',
            title: 'Sample Hero',
            alt_text: 'Sample Hero',
        });
        const mediaId = Array.isArray(media) ? media[0]?.id : media?.id;
        if (mediaId) {
            const banner = await mediaService.createBanners({
                title: 'Sample Hero Banner',
                position: 'hero',
                is_active: true,
                media_id: mediaId,
                display_order: 0,
            });
            console.log('✅ Created sample hero banner', Array.isArray(banner) ? banner[0]?.id : banner?.id);
        }
        else {
            console.warn('⚠️ Could not create media for hero banner');
        }
    }
    else {
        console.log('ℹ️ Hero banner already exists — skipping');
    }
    // Tag some products for demo sections
    console.log('🔖 Tagging a few products for demo sections (powerbank, laptop, hot-deal)');
    try {
        const products = await productService.listProducts({}, { take: 20 });
        if (products && products.length) {
            let i = 0;
            for (const p of products) {
                const tagsToAdd = [];
                if (i < 4)
                    tagsToAdd.push('powerbank');
                if (i >= 4 && i < 8)
                    tagsToAdd.push('laptop');
                if (i >= 8 && i < 12)
                    tagsToAdd.push('hot-deal');
                if (tagsToAdd.length) {
                    try {
                        await productService.updateProducts(p.id, { tags: tagsToAdd });
                        console.log(`  - Tagged product ${p.id} with ${tagsToAdd.join(',')}`);
                    }
                    catch (e) {
                        // continue
                    }
                }
                i += 1;
            }
        }
        else {
            console.log('ℹ️ No products found to tag in demo');
        }
    }
    catch (e) {
        const err = e;
        console.warn('⚠️ Failed to tag demo products:', err?.message || e);
    }
    // If HOMEPAGE_COLLECTIONS env var is present, try to assign products to those collections
    // Expected shape: { "host_deals": "<collection_id>", "best_in_powerbanks": "<collection_id>", "best_in_laptops": "<collection_id>" }
    try {
        if (process.env.HOMEPAGE_COLLECTIONS) {
            let mappings = {};
            try {
                mappings = JSON.parse(process.env.HOMEPAGE_COLLECTIONS);
            }
            catch (err) {
                mappings = {};
            }
            if (Object.keys(mappings).length) {
                console.log('🔁 Assigning demo products to collections according to HOMEPAGE_COLLECTIONS mapping');
                // Helper to resolve handle->id using container's collectionService when available
                async function resolveCollectionId(candidate) {
                    if (!candidate)
                        return null;
                    // assume id if looks like pcol_
                    if (candidate.startsWith('pcol_') || candidate.match(/^[0-9a-fA-F-]{8,}$/))
                        return candidate;
                    try {
                        const collectionService = container.resolve?.('collectionService') || container.resolve?.('collection');
                        if (collectionService) {
                            const tryMethods = ['retrieveByHandle', 'getCollectionByHandle', 'getByHandle', 'list'];
                            for (const m of tryMethods) {
                                try {
                                    const fn = collectionService[m];
                                    if (typeof fn === 'function') {
                                        if (m === 'list') {
                                            const r = await fn.call(collectionService, { handle: candidate });
                                            if (Array.isArray(r) && r.length)
                                                return r[0].id;
                                        }
                                        else {
                                            const r = await fn.call(collectionService, candidate);
                                            if (r && r.id)
                                                return r.id;
                                        }
                                    }
                                }
                                catch (e) {
                                    // continue
                                }
                            }
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                    return null;
                }
                // Resolve mapping candidates to ids
                const resolvedMappings = {};
                for (const k of Object.keys(mappings)) {
                    const cand = Array.isArray(mappings[k]) ? mappings[k][0] : mappings[k];
                    const id = await resolveCollectionId(cand);
                    if (id)
                        resolvedMappings[k] = id;
                }
                // Re-query a handful of products to reassign collection_id
                const prods = await productService.listProducts({}, { take: 20 });
                if (prods && prods.length) {
                    let i = 0;
                    for (const p of prods) {
                        const updates = {};
                        // host_deals (i 8..11)
                        if (i >= 8 && i < 12 && resolvedMappings['host_deals']) {
                            updates.collection_id = resolvedMappings['host_deals'];
                        }
                        // best_in_powerbanks (i 0..3)
                        if (i < 4 && resolvedMappings['best_in_powerbanks']) {
                            updates.collection_id = resolvedMappings['best_in_powerbanks'];
                        }
                        // best_in_laptops (i 4..7)
                        if (i >= 4 && i < 8 && resolvedMappings['best_in_laptops']) {
                            updates.collection_id = resolvedMappings['best_in_laptops'];
                        }
                        if (Object.keys(updates).length) {
                            try {
                                await productService.updateProducts(p.id, updates);
                                console.log(`  - Assigned product ${p.id} to collection ${updates.collection_id}`);
                            }
                            catch (e) {
                                // continue
                            }
                        }
                        i += 1;
                    }
                }
            }
        }
    }
    catch (err) {
        // non-fatal
        const e = err;
        console.warn('⚠️ Failed to assign demo products to collections:', e?.message || err);
    }
    console.log('✅ Sample homepage seed complete');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNhbXBsZS1ob21lcGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NyZWF0ZS1zYW1wbGUtaG9tZXBhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSx1Q0FtSkM7QUF0SkQsNENBQStDO0FBQy9DLHFEQUFtRDtBQUVwQyxLQUFLLFVBQVUsb0JBQW9CLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDeEUsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFRLENBQUE7SUFDM0QsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFRLENBQUE7SUFFaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0lBQ2hELE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ2hHLElBQUksQ0FBQyxZQUFZLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUE7UUFDMUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxZQUFZLENBQUMsWUFBWSxDQUFDO1lBQzVDLEdBQUcsRUFBRSw4RUFBOEU7WUFDbkYsU0FBUyxFQUFFLFlBQVk7WUFDdkIsS0FBSyxFQUFFLGFBQWE7WUFDcEIsUUFBUSxFQUFFLGFBQWE7U0FDeEIsQ0FBQyxDQUFBO1FBQ0YsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUs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