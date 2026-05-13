"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.POST = POST;
const reviews_1 = require("../../../../../modules/reviews");
exports.AUTHENTICATE = true;
async function POST(req, res) {
    const reviewService = req.scope.resolve(reviews_1.REVIEW_MODULE);
    const { id } = req.params;
    const review = await reviewService.rejectReview(id);
    res.json({ review });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Jldmlld3MvW2lkXS9yZWplY3Qvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBTUEsb0JBS0M7QUFWRCw0REFBOEQ7QUFHakQsUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBRXpCLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBZ0IsdUJBQWEsQ0FBQyxDQUFBO0lBQ3JFLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFBO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNuRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtBQUN0QixDQUFDIn0=