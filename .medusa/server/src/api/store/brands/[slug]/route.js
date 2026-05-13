"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const brands_1 = require("../../../../modules/brands");
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /store/brands/:slug
 * Get a single active brand by slug for storefront
 */
async function GET(req, res) {
    const brandModuleService = req.scope.resolve(brands_1.BRAND_MODULE);
    const [items] = await brandModuleService.listAndCountBrands({
        slug: req.params.slug,
        is_active: true,
    }, { take: 1 });
    if (!items || items.length === 0) {
        return res.status(404).json({
            message: "Brand not found",
        });
    }
    const brand = items[0];
    const productIds = await brandModuleService.listBrandProducts(brand.id);
    let products = [];
    if (productIds.length) {
        const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
        products = await productService.listProducts({ id: productIds });
    }
    res.json({ brand, products });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2JyYW5kcy9bc2x1Z10vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSxrQkF3QkM7QUFqQ0QsdURBQXlEO0FBRXpELHFEQUFtRDtBQUduRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUN2QixHQUFrQixFQUNsQixHQUFtQjtJQUVuQixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFlLHFCQUFZLENBQUMsQ0FBQTtJQUV4RSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztRQUMxRCxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ3JCLFNBQVMsRUFBRSxJQUFJO0tBQ2hCLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUVmLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNqQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLE9BQU8sRUFBRSxpQkFBaUI7U0FDM0IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0QixNQUFNLFVBQVUsR0FBRyxNQUFNLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN2RSxJQUFJLFFBQVEsR0FBVSxFQUFFLENBQUE7SUFDeEIsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQXdCLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNoRixRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDbEUsQ0FBQztJQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUMvQixDQUFDIn0=