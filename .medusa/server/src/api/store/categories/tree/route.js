"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/categories/tree
 *
 * Returns full category tree with:
 * - Parent categories
 * - Children categories with images
 * - Product count per category
 * - Category images from metadata
 *
 * Query params:
 * - parent_id: Filter by parent category
 * - include_empty: Include categories with 0 products (default: false)
 */
async function GET(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const parentId = req.query.parent_id;
    const includeEmpty = req.query.include_empty === "true";
    try {
        // Get all categories with product counts
        const categoriesResult = await pgConnection.raw(`SELECT pc.id, pc.name, pc.handle, pc.description, 
              pc.parent_category_id, pc.is_active, pc.rank,
              pc.metadata,
              COUNT(DISTINCT pcp.product_id) as product_count
       FROM product_category pc
       LEFT JOIN product_category_product pcp ON pcp.product_category_id = pc.id
       WHERE pc.deleted_at IS NULL AND pc.is_active = true
       GROUP BY pc.id
       ORDER BY pc.rank ASC, pc.name ASC`);
        // Build tree structure
        const categories = categoriesResult.rows;
        const categoryMap = {};
        const rootCategories = [];
        // First pass: create all category objects
        for (const cat of categories) {
            const meta = typeof cat.metadata === "string"
                ? JSON.parse(cat.metadata)
                : (cat.metadata || {});
            categoryMap[cat.id] = {
                id: cat.id,
                name: cat.name,
                handle: cat.handle,
                description: cat.description || "",
                image_url: meta.image_url || null,
                product_count: parseInt(cat.product_count),
                parent_id: cat.parent_category_id,
                children: [],
            };
        }
        // Second pass: build tree
        for (const cat of categories) {
            const node = categoryMap[cat.id];
            if (cat.parent_category_id && categoryMap[cat.parent_category_id]) {
                categoryMap[cat.parent_category_id].children.push(node);
            }
            else if (!cat.parent_category_id) {
                rootCategories.push(node);
            }
        }
        // Calculate total product count for parents (sum of children)
        for (const root of rootCategories) {
            let childTotal = 0;
            for (const child of root.children) {
                childTotal += child.product_count;
                // Also sum grandchildren
                let grandchildTotal = 0;
                for (const gc of child.children) {
                    grandchildTotal += gc.product_count;
                }
                if (grandchildTotal > 0 && child.product_count === 0) {
                    child.product_count = grandchildTotal;
                }
            }
            if (childTotal > 0 && root.product_count === 0) {
                root.product_count = childTotal;
            }
        }
        // Filter by parent if requested
        let result = rootCategories;
        if (parentId) {
            const parent = categoryMap[parentId];
            if (parent) {
                result = parent.children;
            }
            else {
                result = [];
            }
        }
        // Filter empty categories if needed
        if (!includeEmpty) {
            result = result.filter((c) => c.product_count > 0 || c.children.length > 0);
            for (const cat of result) {
                if (cat.children) {
                    cat.children = cat.children.filter((c) => c.product_count > 0 || c.children.length > 0);
                }
            }
        }
        res.json({
            categories: result,
            total: result.length,
        });
    }
    catch (error) {
        console.error("[Categories Tree] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2NhdGVnb3JpZXMvdHJlZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWdCQSxrQkFvR0M7QUFuSEQscURBQXFFO0FBRXJFOzs7Ozs7Ozs7Ozs7R0FZRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMvRSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQW1CLENBQUE7SUFDOUMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssTUFBTSxDQUFBO0lBRXZELElBQUksQ0FBQztRQUNILHlDQUF5QztRQUN6QyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDN0M7Ozs7Ozs7O3lDQVFtQyxDQUNwQyxDQUFBO1FBRUQsdUJBQXVCO1FBQ3ZCLE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQTtRQUN4QyxNQUFNLFdBQVcsR0FBd0IsRUFBRSxDQUFBO1FBQzNDLE1BQU0sY0FBYyxHQUFVLEVBQUUsQ0FBQTtRQUVoQywwQ0FBMEM7UUFDMUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksR0FBRyxPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUTtnQkFDM0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQTtZQUV4QixXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FB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