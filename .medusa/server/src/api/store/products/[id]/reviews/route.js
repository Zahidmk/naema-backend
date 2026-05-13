"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const reviews_1 = require("../../../../../modules/reviews");
// Public: list approved reviews for a product
async function GET(req, res) {
    const reviewService = req.scope.resolve(reviews_1.REVIEW_MODULE);
    const product_id = req.params.id;
    const reviews = await reviewService.listApprovedByProduct(product_id);
    res.json({ reviews });
}
// Public: create a review (no auth required)
async function POST(req, res) {
    const reviewService = req.scope.resolve(reviews_1.REVIEW_MODULE);
    const product_id = req.params.id;
    const { rating, title, content, customer_id, customer_name } = req.body;
    if (rating == null) {
        return res.status(400).json({ message: "rating required" });
    }
    const review = await reviewService.addReview(customer_id || null, product_id, Number(rating), title || customer_name || "Anonymous", content);
    res.json({ success: true, review });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Byb2R1Y3RzL1tpZF0vcmV2aWV3cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLGtCQUtDO0FBR0Qsb0JBZUM7QUEzQkQsNERBQThEO0FBRzlELDhDQUE4QztBQUN2QyxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQWdCLHVCQUFhLENBQUMsQ0FBQTtJQUNyRSxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQTtJQUNoQyxNQUFNLE9BQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNyRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtBQUN2QixDQUFDO0FBRUQsNkNBQTZDO0FBQ3RDLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBZ0IsdUJBQWEsQ0FBQyxDQUFBO0lBQ3JFLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFBO0lBQ2hDLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQVcsQ0FBQTtJQUM5RSxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNuQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUMxQyxXQUFXLElBQUksSUFBSSxFQUNuQixVQUFVLEVBQ1YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUNkLEtBQUssSUFBSSxhQUFhLElBQUksV0FBVyxFQUNyQyxPQUFPLENBQ1IsQ0FBQTtJQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7QUFDckMsQ0FBQyJ9