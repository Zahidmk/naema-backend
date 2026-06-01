"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/filter-options
 * Returns available filter options (colors, sizes, etc.) for the store or a specific category.
 *
 * Query params:
 *   category_id  - optional, filter options for products in this category
 *   region_id    - optional, for price range context
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { category_id } = req.query;
    try {
        // Build product filter: if category_id is provided, only look at products in that category
        let productFilter = "";
        const params = [];
        if (category_id) {
            productFilter = `
        AND p.id IN (
          SELECT pcp.product_id FROM product_category_product pcp WHERE pcp.product_category_id = ?
        )
      `;
            params.push(category_id);
        }
        // Get all distinct option titles and their values
        const optionsResult = await pgConnection.raw(`SELECT 
        po.id as option_id,
        po.title as option_title,
        ARRAY_AGG(DISTINCT pov.value ORDER BY pov.value) as values
       FROM product_option po
       JOIN product_option_value pov ON pov.option_id = po.id AND pov.deleted_at IS NULL
       JOIN product p ON po.product_id = p.id AND p.deleted_at IS NULL AND p.status = 'published'
       WHERE po.deleted_at IS NULL
         AND po.title != 'Default'
         ${productFilter}
       GROUP BY po.id, po.title
       ORDER BY po.title`, params);
        // Get price range
        const priceParams = [];
        let priceFilter = "";
        if (category_id) {
            priceFilter = `
        AND pv.product_id IN (
          SELECT pcp.product_id FROM product_category_product pcp WHERE pcp.product_category_id = ?
        )
      `;
            priceParams.push(category_id);
        }
        const priceResult = await pgConnection.raw(`SELECT 
        MIN(pp.amount) as min_price,
        MAX(pp.amount) as max_price,
        pp.currency_code
       FROM product_variant_price_set pvps
       JOIN price pp ON pp.price_set_id = pvps.price_set_id AND pp.deleted_at IS NULL
       JOIN product_variant pv ON pv.id = pvps.variant_id AND pv.deleted_at IS NULL
       JOIN product p ON p.id = pv.product_id AND p.deleted_at IS NULL AND p.status = 'published'
       WHERE 1=1 ${priceFilter}
       GROUP BY pp.currency_code`, priceParams);
        // Get available brands from product metadata
        const brandParams = [];
        let brandFilter = "";
        if (category_id) {
            brandFilter = `
        AND p.id IN (
          SELECT pcp.product_id FROM product_category_product pcp WHERE pcp.product_category_id = ?
        )
      `;
            brandParams.push(category_id);
        }
        const brandResult = await pgConnection.raw(`SELECT DISTINCT COALESCE(
          NULLIF(TRIM(p.metadata->>'erp_brand'), ''),
          NULLIF(TRIM(p.metadata->>'brand_name'), ''),
          split_part(TRIM(p.title), ' ', 1)
        ) as brand
       FROM product p
       WHERE p.deleted_at IS NULL 
         AND p.status = 'published'
         ${brandFilter}
       ORDER BY brand`, brandParams);
        // Format options for Flutter
        const filters = [];
        // Add color, size, and other product options
        for (const opt of (optionsResult.rows || [])) {
            const title = opt.option_title.toLowerCase();
            filters.push({
                id: opt.option_id,
                title: opt.option_title,
                type: title === "color" || title === "colour" ? "color" :
                    title === "size" ? "size" : "select",
                values: opt.values || [],
            });
        }
        // Add brand filter
        const brands = (brandResult.rows || []).map((r) => r.brand).filter(Boolean);
        if (brands.length > 0) {
            filters.push({
                id: "brand",
                title: "Brand",
                type: "select",
                values: brands,
            });
        }
        // Add price range
        const priceRanges = (priceResult.rows || []).map((r) => ({
            currency_code: r.currency_code,
            min: parseFloat(r.min_price) || 0,
            max: parseFloat(r.max_price) || 0,
        }));
        // Add sort options
        const sortOptions = [
            { value: "created_at", label: "Newest First" },
            { value: "-created_at", label: "Oldest First" },
            { value: "title", label: "Name A-Z" },
            { value: "-title", label: "Name Z-A" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
        ];
        res.json({
            filters,
            price_range: priceRanges,
            sort_options: sortOptions,
            category_id: category_id || null,
        });
    }
    catch (error) {
        console.error("[Filter Options] Error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2ZpbHRlci1vcHRpb25zL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBV0Esa0JBK0lDO0FBekpELHFEQUFxRTtBQUVyRTs7Ozs7OztHQU9HO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQy9FLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBaUMsQ0FBQTtJQUU3RCxJQUFJLENBQUM7UUFDSCwyRkFBMkY7UUFDM0YsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLE1BQU0sTUFBTSxHQUFVLEVBQUUsQ0FBQTtRQUV4QixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLGFBQWEsR0FBRzs7OztPQUlmLENBQUE7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQzFCLENBQUM7UUFFRCxrREFBa0Q7UUFDbEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUMxQzs7Ozs7Ozs7O1dBU0ssYUFBYTs7eUJBRUMsRUFDbkIsTUFBTSxDQUNQLENBQUE7UUFFRCxrQkFBa0I7UUFDbEIsTUFBTSxXQUFXLEdBQVUsRUFBRSxDQUFBO1FBQzdCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQTtRQUNwQixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLFdBQVcsR0FBRzs7OztPQUliLENBQUE7WUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQy9CLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3hDOzs7Ozs7OzttQkFRYSxXQUFXO2lDQUNHLEVBQzNCLFdBQVcsQ0FDWixDQUFBO1FBRUQsNkNBQTZDO1FBQzdDLE1BQU0sV0FBVyxHQUFVLEVBQUUsQ0FBQTtRQUM3QixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7UUFDcEIsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNoQixXQUFXLEdBQUc7Ozs7T0FJYixDQUFBO1lBQ0QsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUMvQixDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUN4Qzs7Ozs7Ozs7V0FRSyxXQUFXO3NCQUNBLEVBQ2hCLFdBQVcsQ0FDWixDQUFBO1FBRUQsNkJBQTZCO1FBQzdCLE1BQU0sT0FBTyxHQUFVLEVBQUUsQ0FBQTtRQUV6Qiw2Q0FBNkM7UUFDN0MsS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM3QyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQzVDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsRUFBRSxFQUFFLEdBQUcsQ0FBQyxTQUFTO2dCQUNqQixLQUFLLEVBQUUsR0FBRyxDQUFDLFlBQVk7Z0JBQ3ZCLElBQUksRUFBRSxLQUFLLEtBQUssT0FBTyxJQUFJLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNuRCxLQUFLLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0JBQzFDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUU7YUFDekIsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUVELG1CQUFtQjtRQUNuQixNQUFNLE1BQU0sR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ2hGLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNYLEVBQUUsRUFBRSxPQUFPO2dCQUNYLEtBQUssRUFBRSxPQUFPO2dCQUNkLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRSxNQUFNO2FBQ2YsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUVELGtCQUFrQjtRQUNsQixNQUFNLFdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVELGFBQWEsRUFBRSxDQUFDLENBQUMsYUFBYTtZQUM5QixHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2pDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7U0FDbEMsQ0FBQyxDQUFDLENBQUE7UUFFSCxtQkFBbUI7UUFDbkIsTUFBTSxXQUFXLEdBQUc7WUFDbEIsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUU7WUFDOUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUU7WUFDL0MsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUU7WUFDckMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUU7WUFDdEMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRTtZQUNuRCxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFO1NBQ3JELENBQUE7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsT0FBTztZQUNQLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFlBQVksRUFBRSxXQUFXO1lBQ3pCLFdBQVcsRUFBRSxXQUFXLElBQUksSUFBSTtTQUNqQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQy9DLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLElBQUksRUFBRSxjQUFjO1lBQ3BCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztTQUN2QixDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyJ9