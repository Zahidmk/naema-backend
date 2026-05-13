"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
// Join model between products and brands
const ProductBrand = utils_1.model.define("product_brand", {
    id: utils_1.model.id().primaryKey(),
    product_id: utils_1.model.text(),
    brand_id: utils_1.model.text(),
});
exports.default = ProductBrand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdC1icmFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2JyYW5kcy9tb2RlbHMvcHJvZHVjdC1icmFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUFpRDtBQUVqRCx5Q0FBeUM7QUFDekMsTUFBTSxZQUFZLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7SUFDakQsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsVUFBVSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDeEIsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7Q0FDdkIsQ0FBQyxDQUFBO0FBRUYsa0JBQWUsWUFBWSxDQUFBIn0=