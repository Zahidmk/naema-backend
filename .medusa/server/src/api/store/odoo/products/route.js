"use strict";
/**
 * Odoo Products Store API
 * Public endpoint for fetching products from Odoo for storefront
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const service_1 = __importDefault(require("../../../../modules/odoo-sync/service"));
const odooService = new service_1.default();
/**
 * GET /store/odoo/products
 * Fetch products from Odoo for public display
 */
async function GET(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const category = req.query.category;
        if (!odooService.isConfigured()) {
            res.status(503).json({
                success: false,
                error: "Product sync service is not available",
            });
            return;
        }
        const products = await odooService.fetchProducts(limit, offset);
        // Convert to storefront-friendly format
        const storefrontProducts = products.map((p) => {
            const medusaFormat = odooService.convertToMedusaProduct(p);
            return {
                id: `odoo-${p.id}`,
                title: p.name,
                handle: medusaFormat.handle,
                description: p.description_sale || p.description || null,
                price: p.list_price,
                currency: "AED",
                sku: p.default_code || `ODOO-${p.id}`,
                barcode: p.barcode || null,
                weight: p.weight,
                stock: Math.floor(p.qty_available || 0),
                in_stock: (p.qty_available || 0) > 0,
                category: p.categ_id ? {
                    id: p.categ_id[0],
                    name: p.categ_id[1],
                } : null,
                thumbnail: p.image_1920 ? `data:image/png;base64,${p.image_1920}` : null,
                metadata: {
                    odoo_id: p.id,
                    cost_price: p.standard_price,
                    type: p.type,
                },
            };
        });
        // Filter by category if specified
        let filteredProducts = storefrontProducts;
        if (category) {
            filteredProducts = storefrontProducts.filter((p) => p.category?.name?.toLowerCase().includes(category.toLowerCase()));
        }
        res.json({
            success: true,
            products: filteredProducts,
            count: filteredProducts.length,
            limit,
            offset,
        });
    }
    catch (error) {
        console.error("Error fetching Odoo products:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch products",
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL29kb28vcHJvZHVjdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUE0Qkgsa0JBc0VDO0FBL0ZELG9GQUFvRjtBQUVwRixNQUFNLFdBQVcsR0FBRyxJQUFJLGlCQUFlLEVBQUUsQ0FBQTtBQW1CekM7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBZSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDeEQsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFrQixDQUFBO1FBRTdDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztZQUNoQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDbkIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLHVDQUF1QzthQUMvQyxDQUFDLENBQUE7WUFDRixPQUFNO1FBQ1IsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFL0Qsd0NBQXdDO1FBQ3hDLE1BQU0sa0JBQWtCLEdBQXdCLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFjLEVBQUUsRUFBRTtZQUM5RSxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFMUQsT0FBTztnQkFDTCxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNsQixLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUk7Z0JBQ2IsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNO2dCQUMzQixXQUFXLEVBQUcsQ0FBQyxDQUFDLGdCQUEyQixJQUFLLENBQUMsQ0FBQyxXQUFzQixJQUFJLElBQUk7Z0JBQ2hGLEtBQUssRUFBRSxDQUFDLENBQUMsVUFBVTtnQkFDbkIsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsR0FBRyxFQUFHLENBQUMsQ0FBQyxZQUF1QixJQUFJLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDakQsT0FBTyxFQUFHLENBQUMsQ0FBQyxPQUFrQixJQUFJLElBQUk7Z0JBQ3RDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtnQkFDaEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDcEMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNyQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDcEIsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDUixTQUFTLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDeEUsUUFBUSxFQUFFO29CQUNSLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDYixVQUFVLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQzVCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtpQkFDYjthQUNGLENBQUE7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUVGLGtDQUFrQztRQUNsQyxJQUFJLGdCQUFnQixHQUFHLGtCQUFrQixDQUFBO1FBQ3pDLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQzFDLENBQUMsQ0FBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUMzRixDQUFBO1FBQ0gsQ0FBQztRQUVELEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxPQUFPLEVBQUUsSUFBSTtZQUNiLFFBQVEsRUFBRSxnQkFBZ0I7WUFDMUIsS0FBSyxFQUFFLGdCQUFnQixDQUFDLE1BQU07WUFDOUIsS0FBSztZQUNMLE1BQU07U0FDUCxDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3JELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxLQUFLO1lBQ2QsS0FBSyxFQUFFLDBCQUEwQjtTQUNsQyxDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyJ9