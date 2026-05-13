"use strict";
/**
 * Odoo Products Admin API
 * Endpoints for fetching and syncing products from Odoo
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const service_1 = __importDefault(require("../../../../modules/odoo-sync/service"));
const odooService = new service_1.default();
/**
 * GET /admin/odoo/products
 * Fetch products from Odoo
 */
async function GET(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        if (!odooService.isConfigured()) {
            res.status(400).json({
                success: false,
                error: "Odoo is not configured. Please set environment variables.",
            });
            return;
        }
        const products = await odooService.fetchProducts(limit, offset);
        const productCount = await odooService.getProductCount();
        // Convert to Medusa format
        const medusaProducts = products.map((p) => odooService.convertToMedusaProduct(p));
        res.json({
            success: true,
            data: {
                products: medusaProducts,
                raw_products: products,
                count: products.length,
                total: productCount,
                limit,
                offset,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29kb28vcHJvZHVjdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFXSCxrQkF5Q0M7QUFqREQsb0ZBQW1FO0FBRW5FLE1BQU0sV0FBVyxHQUFHLElBQUksaUJBQWUsRUFBRSxDQUFBO0FBRXpDOzs7R0FHRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQ3ZCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQTtRQUN4RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXhELElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztZQUNoQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDbkIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLDJEQUEyRDthQUNuRSxDQUFDLENBQUE7WUFDRixPQUFNO1FBQ1IsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDL0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUE7UUFFeEQsMkJBQTJCO1FBQzNCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUN4QyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQ3RDLENBQUE7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUU7Z0JBQ0osUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLFlBQVksRUFBRSxRQUFRO2dCQUN0QixLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU07Z0JBQ3RCLEtBQUssRUFBRSxZQUFZO2dCQUNuQixLQUFLO2dCQUNMLE1BQU07YUFDUDtTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxLQUFLO1lBQ2QsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPO1NBQ3JCLENBQUMsQ0FBQTtJQUNKLENBQUM7QUFDSCxDQUFDIn0=