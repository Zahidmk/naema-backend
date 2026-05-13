"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const blog_1 = require("../../../../modules/blog");
async function GET(req, res) {
    try {
        const blogService = req.scope.resolve(blog_1.BLOG_MODULE);
        // Get all published posts to extract categories
        const posts = await blogService.listBlogPosts({ is_published: true }, { select: ["category"] });
        const categories = Array.from(new Set(posts
            .map(p => p.category)
            .filter(c => c !== null && c !== undefined && c !== "")));
        res.json({ categories });
    }
    catch (e) {
        console.error('Store blog categories error:', e);
        res.status(500).json({ message: e?.message || 'Failed to fetch categories' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2Jsb2cvY2F0ZWdvcmllcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGtCQXFCQztBQXhCRCxtREFBc0Q7QUFHL0MsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQzdELElBQUksQ0FBQztRQUNELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFjLGtCQUFXLENBQUMsQ0FBQTtRQUUvRCxnREFBZ0Q7UUFDaEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUN6QyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFDdEIsRUFBRSxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQVEsRUFBRSxDQUNsQyxDQUFBO1FBRUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FDakMsS0FBSzthQUNBLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7YUFDcEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FDOUQsQ0FBQyxDQUFBO1FBRUYsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ2hELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLElBQUksNEJBQTRCLEVBQUUsQ0FBQyxDQUFBO0lBQ2pGLENBQUM7QUFDTCxDQUFDIn0=