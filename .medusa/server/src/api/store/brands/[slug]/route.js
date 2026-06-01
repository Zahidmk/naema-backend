"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const brands_1 = require("../../../../modules/brands");
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/brands/:slug
 * Get a single active brand by slug with products + KWD prices
 * Always uses KWD — Kuwait-only store
 */
async function GET(req, res) {
    const brandModuleService = req.scope.resolve(brands_1.BRAND_MODULE);
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const [items] = await brandModuleService.listAndCountBrands({
        slug: req.params.slug,
        is_active: true,
    }, { take: 1 });
    if (!items || items.length === 0) {
        return res.status(404).json({ message: "Brand not found" });
    }
    const brand = items[0];
    const productIds = await brandModuleService.listBrandProducts(brand.id);
    if (!productIds.length) {
        return res.json({ brand, products: [] });
    }
    // Fetch products WITH KWD prices in one SQL query
    const placeholders = productIds.map(() => "?").join(",");
    const result = await pgConnection.raw(`SELECT DISTINCT ON (p.id)
       p.id, p.title, p.handle, p.thumbnail, p.subtitle,
       p.description, p.metadata, p.created_at,
       pv.id        AS variant_id,
       pv.sku,
       pv.inventory_quantity,
       pp.amount    AS price_amount,
       pp.currency_code
     FROM product p
     LEFT JOIN product_variant pv
       ON pv.product_id = p.id AND pv.deleted_at IS NULL
     LEFT JOIN product_variant_price_set pvps
       ON pvps.variant_id = pv.id
     LEFT JOIN price pp
       ON pp.price_set_id = pvps.price_set_id AND pp.currency_code = 'kwd'
     WHERE p.id IN (${placeholders})
       AND p.deleted_at IS NULL
       AND p.status = 'published'
     ORDER BY p.id, pp.amount ASC NULLS LAST`, productIds);
    // Shape products to match what the brand page's transformProduct() expects
    const products = result.rows.map((row) => {
        const meta = typeof row.metadata === "string"
            ? JSON.parse(row.metadata)
            : (row.metadata || {});
        return {
            id: row.id,
            title: row.title,
            handle: row.handle,
            thumbnail: row.thumbnail,
            subtitle: row.subtitle,
            description: row.description,
            metadata: meta,
            created_at: row.created_at,
            // Provide variants array so transformProduct() can read prices
            variants: [{
                    id: row.variant_id,
                    sku: row.sku,
                    inventory_quantity: row.inventory_quantity ?? 1,
                    prices: row.price_amount != null
                        ? [{ amount: parseFloat(row.price_amount), currency_code: "kwd" }]
                        : [],
                    calculated_price: row.price_amount != null
                        ? { calculated_amount: parseFloat(row.price_amount), currency_code: "kwd" }
                        : null,
                }],
        };
    });
    res.json({ brand, products });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2JyYW5kcy9bc2x1Z10vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSxrQkErRUM7QUF4RkQsdURBQXlEO0FBRXpELHFEQUFxRTtBQUVyRTs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBZSxxQkFBWSxDQUFDLENBQUE7SUFDeEUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFL0UsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsa0JBQWtCLENBQUM7UUFDMUQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNyQixTQUFTLEVBQUUsSUFBSTtLQUNoQixFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFZixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDakMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0QixNQUFNLFVBQVUsR0FBRyxNQUFNLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUV2RSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMxQyxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sTUFBTSxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDbkM7Ozs7Ozs7Ozs7Ozs7OztzQkFla0IsWUFBWTs7OzZDQUdXLEVBQ3pDLFVBQVUsQ0FDWCxDQUFBO0lBRUQsMkVBQTJFO0lBQzNFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7UUFDNUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVE7WUFDM0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBRXhCLE9BQU87WUFDTCxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDVixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7WUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztZQUN4QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7WUFDdEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO1lBQzVCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVO1lBQzFCLCtEQUErRDtZQUMvRCxRQUFRLEVBQUUsQ0FBQztvQkFDVCxFQUFFLEVBQUUsR0FBRyxDQUFDLFVBQVU7b0JBQ2xCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztvQkFDWixrQkFBa0IsRUFBRSxHQUFHLENBQUMsa0JBQWtCLElBQUksQ0FBQztvQkFDL0MsTUFBTSxFQUFFLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSTt3QkFDOUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUM7d0JBQ2xFLENBQUMsQ0FBQyxFQUFFO29CQUNOLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSTt3QkFDeEMsQ0FBQyxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFO3dCQUMzRSxDQUFDLENBQUMsSUFBSTtpQkFDVCxDQUFDO1NBQ0gsQ0FBQTtJQUNILENBQUMsQ0FBQyxDQUFBO0lBRUYsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQy9CLENBQUMifQ==