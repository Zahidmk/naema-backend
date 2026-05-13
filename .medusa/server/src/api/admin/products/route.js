"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.POST = POST;
exports.PUT = PUT;
const utils_1 = require("@medusajs/framework/utils");
exports.AUTHENTICATE = true;
// Admin-side route-level validation for product create/update
// Controlled by env var REQUIRE_PRODUCT_METADATA (string 'true' enables enforcement).
// When enabled, requests creating products must include at least one of:
// - tags: non-empty array
// - collection_id or collection_ids: single or array
// - categories: non-empty array
function hasMetadata(payload) {
    if (!payload || typeof payload !== 'object')
        return false;
    const hasTags = Array.isArray(payload.tags) && payload.tags.length > 0;
    const hasCollectionId = !!payload.collection_id;
    const hasCollectionIds = Array.isArray(payload.collection_ids) && payload.collection_ids.length > 0;
    const hasCategories = Array.isArray(payload.categories) && payload.categories.length > 0;
    return hasTags || hasCollectionId || hasCollectionIds || hasCategories;
}
function normalizeImageFields(payload) {
    if (!payload || typeof payload !== "object")
        return payload;
    const next = { ...payload };
    // Support a few common frontend/admin keys for thumbnail.
    const thumb = next.thumbnail || next.thumbnail_url || next.temp_image || next.image_url;
    if (thumb && !next.thumbnail) {
        next.thumbnail = thumb;
    }
    // Normalize images into [{ url: string }]
    if (Array.isArray(next.images)) {
        next.images = next.images
            .map((img) => {
            if (!img)
                return null;
            if (typeof img === "string")
                return { url: img };
            if (typeof img?.url === "string")
                return { url: img.url };
            return null;
        })
            .filter(Boolean);
    }
    else if (typeof next.images === "string") {
        next.images = [{ url: next.images }];
    }
    // If we have a thumbnail but no images, include it as first image.
    if (next.thumbnail && (!Array.isArray(next.images) || next.images.length === 0)) {
        next.images = [{ url: next.thumbnail }];
    }
    return next;
}
const metadataError = {
    message: 'Missing required metadata: please include tags OR collection_id/collection_ids OR categories in the product payload.\n' +
        'Set REQUIRE_PRODUCT_METADATA=false to disable this check (e.g., during bulk import).',
};
async function POST(req, res) {
    try {
        const body = normalizeImageFields(req.body || {});
        const requireMetadata = process.env.REQUIRE_PRODUCT_METADATA === 'true';
        if (requireMetadata && !hasMetadata(body)) {
            return res.status(400).json(metadataError);
        }
        const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
        // Try common create method names used across Medusa versions/customizations
        let created = null;
        if (typeof productService.create === 'function') {
            created = await productService.create(body);
        }
        else if (typeof productService.createProduct === 'function') {
            created = await productService.createProduct(body);
        }
        else if (typeof productService.createProducts === 'function') {
            created = await productService.createProducts(body);
        }
        else {
            console.error('Product service create method not found on service:', Object.keys(productService || {}));
            return res.status(500).json({ message: 'Product create method not found on product service' });
        }
        return res.json({ product: created });
    }
    catch (e) {
        console.error('Admin product create error:', e);
        return res.status(500).json({ message: e?.message || 'Failed to create product' });
    }
}
async function PUT(req, res) {
    try {
        const body = normalizeImageFields(req.body || {});
        // id may come from query param (e.g., /admin/products?id=prod_...) or body
        const id = (req.query && req.query.id) || body?.id;
        if (!id)
            return res.status(400).json({ message: 'Missing product id for update' });
        // NOTE: Don't enforce metadata on updates.
        // Image-only updates (thumbnail/images) and other partial edits must stay allowed.
        const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
        // Try a few common update method names
        let updated = null;
        if (typeof productService.updateProducts === 'function') {
            updated = await productService.updateProducts(id, body);
        }
        else if (typeof productService.updateProduct === 'function') {
            updated = await productService.updateProduct(id, body);
        }
        else if (typeof productService.update === 'function') {
            updated = await productService.update(id, body);
        }
        else {
            console.error('Product service update method not found on service:', Object.keys(productService || {}));
            return res.status(500).json({ message: 'Product update method not found on product service' });
        }
        return res.json({ product: updated });
    }
    catch (e) {
        console.error('Admin product update error:', e);
        return res.status(500).json({ message: e?.message || 'Failed to update product' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Byb2R1Y3RzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQTREQSxvQkE2QkM7QUFFRCxrQkE4QkM7QUF4SEQscURBQW1EO0FBRXRDLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUVoQyw4REFBOEQ7QUFDOUQsc0ZBQXNGO0FBQ3RGLHlFQUF5RTtBQUN6RSwwQkFBMEI7QUFDMUIscURBQXFEO0FBQ3JELGdDQUFnQztBQUVoQyxTQUFTLFdBQVcsQ0FBQyxPQUFZO0lBQy9CLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFBO0lBQ3pELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUN0RSxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQTtJQUMvQyxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNuRyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFDeEYsT0FBTyxPQUFPLElBQUksZUFBZSxJQUFJLGdCQUFnQixJQUFJLGFBQWEsQ0FBQTtBQUN4RSxDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxPQUFZO0lBQ3hDLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUTtRQUFFLE9BQU8sT0FBTyxD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