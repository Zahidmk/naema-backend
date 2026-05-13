"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
const reviews_1 = require("../../../modules/reviews");
exports.AUTHENTICATE = true;
// GET /admin/reviews?status=pending&product_id=...
async function GET(req, res) {
    const reviewService = req.scope.resolve(reviews_1.REVIEW_MODULE);
    const { status, product_id, limit = "50", offset = "0" } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    if (product_id)
        filter.product_id = product_id;
    const [reviews, count] = await reviewService.listReviewsWithFilter(filter, {
        take: Number(limit),
        skip: Number(offset),
        order: { created_at: "DESC" },
    });
    res.json({ reviews, count, limit: Number(limit), offset: Number(offset) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Jldmlld3Mvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBT0Esa0JBYUM7QUFuQkQsc0RBQXdEO0FBRzNDLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUVoQyxtREFBbUQ7QUFDNUMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFnQix1QkFBYSxDQUFDLENBQUE7SUFDckUsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQVksQ0FBQTtJQUMzRSxNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUE7SUFDdEIsSUFBSSxNQUFNO1FBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDbEMsSUFBSSxVQUFVO1FBQUUsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7SUFFOUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUU7UUFDekUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbkIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDcEIsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTtLQUM5QixDQUFDLENBQUE7SUFDRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQzVFLENBQUMifQ==