"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const brand_1 = __importDefault(require("./models/brand"));
const product_brand_1 = __importDefault(require("./models/product-brand"));
/**
 * Brand Module Service
 * Handles all business logic for brands including CRUD operations
 */
class BrandService extends (0, utils_1.MedusaService)({
    Brand: brand_1.default,
    ProductBrand: product_brand_1.default,
}) {
    async addProductToBrand(brandId, productId) {
        // Prevent duplicates
        const existing = await this.listProductBrands({ brand_id: brandId, product_id: productId });
        if (existing.length)
            return existing[0];
        return this.createProductBrands({ brand_id: brandId, product_id: productId });
    }
    async listBrandProducts(brandId) {
        const links = await this.listProductBrands({ brand_id: brandId });
        return links.map((l) => l.product_id);
    }
}
exports.default = BrandService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2JyYW5kcy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscURBQXlEO0FBQ3pELDJEQUFrQztBQUNsQywyRUFBaUQ7QUFFakQ7OztHQUdHO0FBQ0gsTUFBTSxZQUFhLFNBQVEsSUFBQSxxQkFBYSxFQUFDO0lBQ3ZDLEtBQUssRUFBTCxlQUFLO0lBQ0wsWUFBWSxFQUFaLHVCQUFZO0NBQ2IsQ0FBQztJQUNBLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxPQUFlLEVBQUUsU0FBaUI7UUFDeEQscUJBQXFCO1FBQ3JCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtRQUMzRixJQUFJLFFBQVEsQ0FBQyxNQUFNO1lBQUUsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQy9FLENBQUM7SUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsT0FBZTtRQUNyQyxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQ2pFLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQzVDLENBQUM7Q0FDRjtBQUVELGtCQUFlLFlBQVksQ0FBQSJ9