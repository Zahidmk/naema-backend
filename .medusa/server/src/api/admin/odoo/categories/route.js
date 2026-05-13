"use strict";
/**
 * Odoo Categories Admin API
 * Endpoints for fetching categories from Odoo
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const service_1 = __importDefault(require("../../../../modules/odoo-sync/service"));
const odooService = new service_1.default();
/**
 * GET /admin/odoo/categories
 * Fetch categories from Odoo
 */
async function GET(req, res) {
    try {
        if (!odooService.isConfigured()) {
            res.status(400).json({
                success: false,
                error: "Odoo is not configured. Please set environment variables.",
            });
            return;
        }
        const categories = await odooService.fetchCategories();
        res.json({
            success: true,
            data: {
                categories,
                count: categories.length,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29kb28vY2F0ZWdvcmllcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQVdILGtCQTRCQztBQXBDRCxvRkFBbUU7QUFFbkUsTUFBTSxXQUFXLEdBQUcsSUFBSSxpQkFBZSxFQUFFLENBQUE7QUFFekM7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsSUFBSSxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO1lBQ2hDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNuQixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsMkRBQTJEO2FBQ25FLENBQUMsQ0FBQTtZQUNGLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUE7UUFFdEQsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNQLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFO2dCQUNKLFVBQVU7Z0JBQ1YsS0FBSyxFQUFFLFVBQVUsQ0FBQyxNQUFNO2FBQ3pCO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU87U0FDckIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMifQ==