"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const blog_1 = require("../../../../modules/blog");
async function GET(req, res) {
    try {
        const blogService = req.scope.resolve(blog_1.BLOG_MODULE);
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        // Build filters
        const filters = { is_published: true };
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.is_featured !== undefined) {
            filters.is_featured = req.query.is_featured === 'true';
        }
        const [posts, count] = await blogService.listAndCountBlogPosts(filters, {
            skip: offset,
            take: limit,
            order: { published_at: "DESC" },
        });
        res.json({ posts, count, limit, offset });
    }
    catch (e) {
        console.error('Store blog post list error:', e);
        res.status(500).json({ message: e?.message || 'Failed to list blog posts' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2Jsb2cvcG9zdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkE2QkM7QUFoQ0QsbURBQXNEO0FBRy9DLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUM3RCxJQUFJLENBQUM7UUFDRCxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBYyxrQkFBVyxDQUFDLENBQUE7UUFDL0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBZSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFeEQsZ0JBQWdCO1FBQ2hCLE1BQU0sT0FBTyxHQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFBO1FBQzNDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQixPQUFPLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFBO1FBQ3pDLENBQUM7UUFDRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFBO1FBQzFELENBQUM7UUFFRCxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sV0FBVyxDQUFDLHFCQUFxQixDQUMxRCxPQUFPLEVBQ1A7WUFDSSxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxLQUFLO1lBQ1gsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRTtTQUNsQyxDQUNKLENBQUE7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDL0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sSUFBSSwyQkFBMkIsRUFBRSxDQUFDLENBQUE7SUFDaEYsQ0FBQztBQUNMLENBQUMifQ==