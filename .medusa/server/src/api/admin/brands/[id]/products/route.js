"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.POST = POST;
exports.GET = GET;
exports.DELETE = DELETE;
const brands_1 = require("../../../../../modules/brands");
exports.AUTHENTICATE = false;
/**
 * POST /admin/brands/:id/products
 * Body: { product_id: string }
 * Links a product to a brand
 */
async function POST(req, res) {
    const brandService = req.scope.resolve(brands_1.BRAND_MODULE);
    const body = req.body;
    const { product_id } = body;
    if (!product_id) {
        return res.status(400).json({ message: "product_id is required" });
    }
    const link = await brandService.addProductToBrand(req.params.id, product_id);
    res.json({ product_brand: link });
}
/**
 * GET /admin/brands/:id/products
 * Returns product ids linked to this brand
 */
async function GET(req, res) {
    const brandService = req.scope.resolve(brands_1.BRAND_MODULE);
    const productIds = await brandService.listBrandProducts(req.params.id);
    res.json({ product_ids: productIds });
}
/**
 * DELETE /admin/brands/:id/products
 * Body: { product_id: string }
 * Unlinks a product from a brand
 */
async function DELETE(req, res) {
    try {
        const brandService = req.scope.resolve(brands_1.BRAND_MODULE);
        const body = req.body;
        const { product_id } = body;
        if (!product_id) {
            return res.status(400).json({ message: "product_id is required" });
        }
        // Find the product_brand record and delete it
        const links = await brandService.listProductBrands({
            brand_id: req.params.id,
            product_id,
        });
        if (!links.length) {
            return res.status(404).json({ message: "Product not linked to this brand" });
        }
        // Prefer soft-delete (respects deleted_at column in schema), fall back to hard-delete
        if (typeof brandService.softDeleteProductBrands === "function") {
            await brandService.softDeleteProductBrands([links[0].id]);
        }
        else {
            await brandService.deleteProductBrands({ id: links[0].id });
        }
        res.status(200).json({ success: true, message: "Product unlinked from brand" });
    }
    catch (e) {
        console.error("Admin brand unlink product error:", e);
        res.status(500).json({ message: e?.message || "Failed to unlink product" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2JyYW5kcy9baWRdL3Byb2R1Y3RzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVdBLG9CQVNDO0FBTUQsa0JBSUM7QUFPRCx3QkEyQkM7QUEvREQsMERBQTREO0FBRy9DLFFBQUEsWUFBWSxHQUFHLEtBQUssQ0FBQTtBQUVqQzs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2hFLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFlLHFCQUFZLENBQUMsQ0FBQTtJQUNsRSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBK0IsQ0FBQTtJQUNoRCxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFBO0lBQzNCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0lBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDNUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ25DLENBQUM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQWUscUJBQVksQ0FBQyxDQUFBO0lBQ2xFLE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDdEUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0FBQ3ZDLENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLE1BQU0sQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2xFLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFlLHFCQUFZLENBQUMsQ0FBQTtRQUNsRSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBK0IsQ0FBQTtRQUNoRCxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFBO1FBQzNCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNoQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLENBQUMsQ0FBQTtRQUNwRSxDQUFDO1FBQ0QsOENBQThDO1FBQzlDLE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFBWSxDQUFDLGlCQUFpQixDQUFDO1lBQ2pELFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDdkIsVUFBVTtTQUNYLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxrQ0FBa0MsRUFBRSxDQUFDLENBQUE7UUFDOUUsQ0FBQztRQUNELHNGQUFzRjtRQUN0RixJQUFJLE9BQVEsWUFBb0IsQ0FBQyx1QkFBdUIsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN4RSxNQUFPLFlBQW9CLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNwRSxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sWUFBWSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzdELENBQUM7UUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLENBQUMsQ0FBQTtJQUNqRixDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3JELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLElBQUksMEJBQTBCLEVBQUUsQ0FBQyxDQUFBO0lBQzdFLENBQUM7QUFDSCxDQUFDIn0=