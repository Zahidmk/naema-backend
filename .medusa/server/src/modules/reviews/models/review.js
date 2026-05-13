"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
/**
 * Customer Review for a product
 */
const Review = utils_1.model.define("review", {
    id: utils_1.model.id().primaryKey(),
    product_id: utils_1.model.text(),
    customer_id: utils_1.model.text().nullable(),
    rating: utils_1.model.number(), // 1-5
    title: utils_1.model.text().nullable(),
    content: utils_1.model.text().nullable(),
    status: utils_1.model.text().default("pending"), // pending | approved | rejected
});
exports.default = Review;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV2aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvcmV2aWV3cy9tb2RlbHMvcmV2aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQWlEO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxNQUFNLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7SUFDcEMsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsVUFBVSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDeEIsV0FBVyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDcEMsTUFBTSxFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNO0lBQzlCLEtBQUssRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzlCLE9BQU8sRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2hDLE1BQU0sRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLGdDQUFnQztDQUMxRSxDQUFDLENBQUE7QUFFRixrQkFBZSxNQUFNLENBQUEifQ==