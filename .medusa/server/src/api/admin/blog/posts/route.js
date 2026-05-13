"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.POST = POST;
const blog_1 = require("../../../../modules/blog");
exports.AUTHENTICATE = true;
async function GET(req, res) {
    try {
        const blogService = req.scope.resolve(blog_1.BLOG_MODULE);
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const [posts, count] = await blogService.listAndCountBlogPosts({}, {
            skip: offset,
            take: limit,
            order: { published_at: "DESC", created_at: "DESC" },
        });
        res.json({ posts, count, limit, offset });
    }
    catch (e) {
        console.error('Admin blog post list error:', e);
        res.status(500).json({ message: e?.message || 'Failed to list blog posts' });
    }
}
async function POST(req, res) {
    try {
        const blogService = req.scope.resolve(blog_1.BLOG_MODULE);
        const body = (req.body || {});
        if (!body?.title)
            return res.status(400).json({ message: 'title is required' });
        const makeSlug = (v) => v
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const slug = body.slug && body.slug !== '' ? body.slug : makeSlug(body.title);
        const [created] = await blogService.createBlogPosts([{
                title: body.title,
                slug,
                content: body.content ?? null,
                excerpt: body.excerpt ?? null,
                author: body.author ?? null,
                image_url: body.image_url ?? null,
                is_published: body.is_published ?? false,
                published_at: body.is_published ? (body.published_at || new Date()) : null,
                category: body.category ?? null,
                reading_time: body.reading_time ?? null,
                likes_count: body.likes_count ?? 0,
                is_featured: body.is_featured ?? false,
                meta_title: body.meta_title ?? null,
                meta_description: body.meta_description ?? null,
                keywords: body.keywords ?? null,
            }]);
        res.json({ post: created });
    }
    catch (e) {
        console.error('Admin blog post create error:', e);
        res.status(500).json({ message: e?.message || 'Failed to create blog post' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2Jsb2cvcG9zdHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBTUEsa0JBb0JDO0FBRUQsb0JBd0NDO0FBbkVELG1EQUFzRDtBQUd6QyxRQUFBLFlBQVksR0FBRyxJQUFJLENBQUE7QUFFekIsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQzdELElBQUksQ0FBQztRQUNELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFjLGtCQUFXLENBQUMsQ0FBQTtRQUMvRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDdkQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUV4RCxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sV0FBVyxDQUFDLHFCQUFxQixDQUMxRCxFQUFFLEVBQ0Y7WUFDSSxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxLQUFLO1lBQ1gsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFO1NBQ3RELENBQ0osQ0FBQTtRQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUMvQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FB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