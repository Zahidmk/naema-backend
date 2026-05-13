"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const review_1 = __importDefault(require("./models/review"));
class ReviewService extends (0, utils_1.MedusaService)({ Review: review_1.default }) {
    async addReview(customer_id, product_id, rating, title, content) {
        const clamped = Math.max(1, Math.min(5, Number(rating)));
        return this.createReviews({ customer_id, product_id, rating: clamped, title, content, status: "approved" });
    }
    async listApprovedByProduct(product_id) {
        return this.listReviews({ product_id, status: "approved" });
    }
    async listReviewsWithFilter(filter = {}, config = {}) {
        return this.listAndCountReviews(filter, config);
    }
    async approveReview(id) {
        return this.updateReviews({ id, status: "approved" });
    }
    async rejectReview(id) {
        return this.updateReviews({ id, status: "rejected" });
    }
}
exports.default = ReviewService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3Jldmlld3Mvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUF5RDtBQUN6RCw2REFBb0M7QUFFcEMsTUFBTSxhQUFjLFNBQVEsSUFBQSxxQkFBYSxFQUFDLEVBQUUsTUFBTSxFQUFOLGdCQUFNLEVBQUUsQ0FBQztJQUNuRCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQW1CLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsS0FBYyxFQUFFLE9BQWdCO1FBQ3ZHLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDN0csQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxVQUFrQjtRQUM1QyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxTQUFjLEVBQUUsRUFBRSxTQUFjLEVBQUU7UUFDNUQsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQVU7UUFDNUIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQVU7UUFDM0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7Q0FDRjtBQUVELGtCQUFlLGFBQWEsQ0FBQSJ9