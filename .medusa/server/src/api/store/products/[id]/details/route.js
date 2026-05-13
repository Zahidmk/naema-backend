"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/products/:id/details
 *
 * Returns comprehensive product details for Flutter app:
 * - overview (description + metadata)
 * - specifications (from metadata)
 * - images (all product images)
 * - variants with prices
 * - categories
 * - related products (same category)
 * - reviews summary
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const productId = req.params.id;
    const currency = req.query.currency || "aed";
    try {
        // 1. Product basic info
        const productResult = await pgConnection.raw(`SELECT p.id, p.title, p.handle, p.subtitle, p.description, 
              p.status, p.thumbnail, p.metadata, p.weight, p.length, 
              p.height, p.width, p.material, p.origin_country,
              p.type_id, p.collection_id, p.created_at, p.updated_at
       FROM product p
       WHERE p.id = ? AND p.deleted_at IS NULL`, [productId]);
        if (!productResult.rows || productResult.rows.length === 0) {
            return res.status(404).json({ type: "not_found", message: "Product not found" });
        }
        const product = productResult.rows[0];
        const metadata = typeof product.metadata === "string"
            ? JSON.parse(product.metadata)
            : (product.metadata || {});
        // 2. All product images
        const imagesResult = await pgConnection.raw(`SELECT id, url, rank FROM image 
       WHERE product_id = ? AND deleted_at IS NULL 
       ORDER BY rank ASC, created_at ASC`, [productId]);
        // 3. All variants with prices
        const variantsResult = await pgConnection.raw(`SELECT pv.id, pv.title, pv.sku, pv.barcode, pv.ean,
              pv.allow_backorder, pv.manage_inventory,
              pv.weight, pv.length, pv.height, pv.width,
              pv.material, pv.origin_country, pv.variant_rank,
              pv.metadata as variant_metadata,
              pp.amount as price, pp.currency_code
       FROM product_variant pv
       LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
       LEFT JOIN price pp ON pp.price_set_id = pvps.price_set_id 
         AND pp.currency_code = ?
       WHERE pv.product_id = ? AND pv.deleted_at IS NULL
       ORDER BY pv.variant_rank ASC`, [currency, productId]);
        // 4. Product options & option values
        const optionsResult = await pgConnection.raw(`SELECT po.id as option_id, po.title as option_name,
              pov.id as value_id, pov.value as option_value
       FROM product_option po
       JOIN product_option_value pov ON pov.option_id = po.id
       WHERE po.product_id = ? AND po.deleted_at IS NULL AND pov.deleted_at IS NULL
       ORDER BY po.title, pov.value`, [productId]);
        // Group options
        const optionsMap = {};
        for (const opt of optionsResult.rows) {
            if (!optionsMap[opt.option_id]) {
                optionsMap[opt.option_id] = {
                    id: opt.option_id,
                    name: opt.option_name,
                    values: [],
                };
            }
            optionsMap[opt.option_id].values.push({
                id: opt.value_id,
                value: opt.option_value,
            });
        }
        // 5. Categories
        const categoriesResult = await pgConnection.raw(`SELECT pc.id, pc.name, pc.handle, pc.metadata as cat_metadata
       FROM product_category pc
       JOIN product_category_product pcp ON pcp.product_category_id = pc.id
       WHERE pcp.product_id = ? AND pc.deleted_at IS NULL`, [productId]);
        // 6. Stock info (simplified - use metadata instead of complex JOINs)
        // Stock data is synced from Odoo into product metadata
        // No need for complex inventory_level queries
        // 7. Reviews summary
        let reviewsSummary = { average_rating: 0, total_reviews: 0, ratings_breakdown: {} };
        try {
            const reviewsResult = await pgConnection.raw(`SELECT 
           COALESCE(AVG(rating), 0) as average_rating,
           COUNT(*) as total_reviews,
           COUNT(*) FILTER (WHERE rating = 5) as five_star,
           COUNT(*) FILTER (WHERE rating = 4) as four_star,
           COUNT(*) FILTER (WHERE rating = 3) as three_star,
           COUNT(*) FILTER (WHERE rating = 2) as two_star,
           COUNT(*) FILTER (WHERE rating = 1) as one_star
         FROM product_review
         WHERE product_id = ? AND status = 'approved'`, [productId]);
            if (reviewsResult.rows.length > 0) {
                const r = reviewsResult.rows[0];
                reviewsSummary = {
                    average_rating: parseFloat(parseFloat(r.average_rating).toFixed(1)),
                    total_reviews: parseInt(r.total_reviews),
                    ratings_breakdown: {
                        "5": parseInt(r.five_star),
                        "4": parseInt(r.four_star),
                        "3": parseInt(r.three_star),
                        "2": parseInt(r.two_star),
                        "1": parseInt(r.one_star),
                    },
                };
            }
        }
        catch (err) {
            // Review table may not exist, ignore
        }
        // 8. Related products (same category, different product)
        const categoryIds = categoriesResult.rows.map((c) => c.id);
        let relatedProducts = [];
        if (categoryIds.length > 0) {
            const relatedResult = await pgConnection.raw(`SELECT DISTINCT p.id, p.title, p.handle, p.thumbnail, p.subtitle,
                pp.amount as price, pp.currency_code
         FROM product p
         JOIN product_category_product pcp ON pcp.product_id = p.id
         LEFT JOIN product_variant pv ON pv.product_id = p.id AND pv.deleted_at IS NULL
         LEFT JOIN product_variant_price_set pvps ON pvps.variant_id = pv.id
         LEFT JOIN price pp ON pp.price_set_id = pvps.price_set_id AND pp.currency_code = ?
         WHERE pcp.product_category_id IN (${categoryIds.map(() => "?").join(",")})
           AND p.id != ?
           AND p.status = 'published'
           AND p.deleted_at IS NULL
         LIMIT 10`, [currency, ...categoryIds, productId]);
            relatedProducts = relatedResult.rows.map((p) => ({
                id: p.id,
                title: p.title,
                handle: p.handle,
                thumbnail: p.thumbnail,
                subtitle: p.subtitle,
                price: p.price ? parseFloat(p.price) : null,
                currency_code: p.currency_code,
            }));
        }
        // Build specifications from metadata and product fields
        const specifications = {};
        if (product.weight)
            specifications["Weight"] = `${product.weight}g`;
        if (product.length)
            specifications["Length"] = `${product.length}cm`;
        if (product.height)
            specifications["Height"] = `${product.height}cm`;
        if (product.width)
            specifications["Width"] = `${product.width}cm`;
        if (product.material)
            specifications["Material"] = product.material;
        if (product.origin_country)
            specifications["Origin"] = product.origin_country;
        if (metadata.odoo_barcode)
            specifications["Barcode"] = metadata.odoo_barcode;
        if (metadata.odoo_sku)
            specifications["SKU"] = metadata.odoo_sku;
        if (metadata.odoo_category) {
            const catParts = metadata.odoo_category.split(" / ");
            specifications["Category"] = catParts[catParts.length - 1];
        }
        // Build overview
        const overview = {
            description: product.description || "",
            subtitle: product.subtitle || "",
            html_description: metadata.ecommerce_description_html || null,
            brand: extractBrand(product.title),
        };
        // Build images array
        const images = imagesResult.rows.map((img) => ({
            id: img.id,
            url: img.url,
            rank: img.rank,
        }));
        // Include thumbnail as first image if not already in images
        if (product.thumbnail && !images.find((i) => i.url === product.thumbnail)) {
            images.unshift({ id: "thumbnail", url: product.thumbnail, rank: -1 });
        }
        // Build variants
        const variants = variantsResult.rows.map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            barcode: v.barcode,
            price: v.price ? parseFloat(v.price) : null,
            currency_code: v.currency_code || currency,
            inventory_quantity: null, // Will be populated from stock
            allow_backorder: v.allow_backorder,
            weight: v.weight,
            metadata: v.variant_metadata,
        }));
        // Stock availability
        const in_stock = metadata.stock_qty > 0 || metadata.stock_free_qty > 0;
        const stock_quantity = metadata.stock_qty || 0;
        res.json({
            product: {
                id: product.id,
                title: product.title,
                handle: product.handle,
                thumbnail: product.thumbnail,
                status: product.status,
                created_at: product.created_at,
                updated_at: product.updated_at,
                // Overview section (for "Overview" tab)
                overview,
                // All images (for image gallery/slider)
                images,
                // Specifications section (for "Specifications" tab)
                specifications,
                // Options (Color, Size, Storage, etc.)
                options: Object.values(optionsMap),
                // Variants with prices
                variants,
                // Categories
                categories: categoriesResult.rows.map((c) => ({
                    id: c.id,
                    name: c.name,
                    handle: c.handle,
                    image_url: c.cat_metadata?.image_url || null,
                })),
                // Stock info
                in_stock,
                stock_quantity,
                // Reviews summary (for "Reviews" tab)
                reviews: reviewsSummary,
                // Related products
                related_products: relatedProducts,
                // Q&A placeholder (for "Q&A" tab)
                qa: {
                    total_questions: 0,
                    questions: [],
                    can_ask: true,
                },
                // Metadata (Odoo sync info)
                odoo_id: metadata.odoo_id || null,
                brand: extractBrand(product.title),
            },
        });
    }
    catch (error) {
        console.error("[Product Details] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
/**
 * Extract brand name from product title
 * Common brands: Porodo, Powerology, Baseus, Anker, Samsung, Apple, etc.
 */
function extractBrand(title) {
    if (!title)
        return null;
    const brands = [
        "Porodo", "Powerology", "Baseus", "Anker", "Samsung", "Apple",
        "Xiaomi", "Huawei", "Lenovo", "Green Lion", "LePresso", "Remax",
        "Hoco", "Joyroom", "Ugreen", "Liberty Guard", "Devia", "Oraimo",
        "Marshall", "JBL", "Sony", "Bose", "Harman", "Kemei", "MSI",
        "ASUS", "HP", "Dell", "Acer", "NexTool", "Ravpower", "Mcdodo",
    ];
    for (const brand of brands) {
        if (title.toLowerCase().startsWith(brand.toLowerCase())) {
            return brand;
        }
    }
    // Try first word as brand
    return title.split(" ")[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Byb2R1Y3RzL1tpZF0vZGV0YWlscy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVBLGtCQTBRQztBQXhSRCxxREFBcUU7QUFFckU7Ozs7Ozs7Ozs7O0dBV0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDL0UsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUE7SUFDL0IsTUFBTSxRQUFRLEdBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFtQixJQUFJLEtBQUssQ0FBQTtJQUV4RCxJQUFJLENBQUM7UUFDSCx3QkFBd0I7UUFDeEIsTUFBTSxhQUFhLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUMxQzs7Ozs7K0NBS3lDLEVBQ3pDLENBQUMsU0FBUyxDQUFDLENBQ1osQ0FBQTtRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzNELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUE7UUFDbEYsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckMsTUFBTSxRQUFRLEdBQUcsT0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVE7WUFDbkQsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FB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