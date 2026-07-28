"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedBlogData;
const utils_1 = require("@medusajs/framework/utils");
const blog_1 = require("../modules/blog");
async function seedBlogData({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const blogService = container.resolve(blog_1.BLOG_MODULE);
    logger.info("Seeding blog posts...");
    const samplePosts = [
        {
            title: "iPhone 17 Series: 7 Major Changes From Previous Generations",
            slug: "iphone-17-series-changes",
            excerpt: "Get a sneak peek at the most anticipated features of the upcoming iPhone 17 series.",
            content: "The iPhone 17 series is expected to bring significant changes to the lineup...",
            author: "naema Tech",
            image_url: "https://admin.naemafoodstuff.com/uploads/blog/iphone-17.jpg",
            category: "Top Stories",
            reading_time: "5 min to read",
            likes_count: 1,
            is_featured: true,
            is_published: true,
            published_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
        },
        {
            title: "The Ultimate Guide to Portable Coffee Makers: How to Choose, Use, and...",
            slug: "portable-coffee-makers-guide",
            excerpt: "Learn everything you need to know about choosing the perfect portable coffee maker for your travels.",
            content: "Coffee is more than just a drink; it's a ritual. When you're on the go...",
            author: "Lifestyle Editor",
            image_url: "https://admin.naemafoodstuff.com/uploads/blog/coffee-maker.jpg",
            category: "Buying Guide",
            reading_time: "5 min to read",
            likes_count: 1,
            is_featured: false,
            is_published: true,
            published_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
        },
        {
            title: "Top 5 Wireless Speakers for Your Home Office in 2026",
            slug: "top-5-wireless-speakers",
            excerpt: "Upgrade your workspace with these high-quality wireless speakers.",
            content: "A good speaker can transform your productivity and mood at work...",
            author: "Audio Expert",
            image_url: "https://admin.naemafoodstuff.com/uploads/blog/speakers.jpg",
            category: "Speaker",
            reading_time: "7 min to read",
            likes_count: 5,
            is_featured: false,
            is_published: true,
            published_at: new Date(),
        },
        {
            title: "How to Maximize Your Phone's Battery Life",
            slug: "maximize-phone-battery-life",
            excerpt: "Simple tips and tricks to keep your phone running longer during the day.",
            content: "Battery life is one of the most common complaints among smartphone users...",
            author: "Tech Guru",
            category: "How to",
            reading_time: "4 min to read",
            likes_count: 12,
            is_featured: false,
            is_published: true,
            published_at: new Date(),
        }
    ];
    for (const post of samplePosts) {
        const existing = await blogService.listBlogPosts({ slug: post.slug });
        if (existing.length === 0) {
            await blogService.createBlogPosts([post]);
            logger.info(`Created blog post: ${post.title}`);
        }
        else {
            logger.info(`Blog post already exists: ${post.title}`);
        }
    }
    logger.info("Blog seeding complete.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1ibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc2VlZC1ibG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0EsK0JBMkVDO0FBL0VELHFEQUFxRTtBQUNyRSwwQ0FBNkM7QUFHOUIsS0FBSyxVQUFVLFlBQVksQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUM5RCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2xFLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQWMsa0JBQVcsQ0FBQyxDQUFBO0lBRS9ELE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtJQUVwQyxNQUFNLFdBQVcsR0FBRztRQUNoQjtZQUNJLEtBQUssRUFBRSw2REFBNkQ7WUFDcEUsSUFBSSxFQUFFLDBCQUEwQjtZQUNoQyxPQUFPLEVBQUUscUZBQXFGO1lBQzlGLE9BQU8sRUFBRSxnRkFBZ0Y7WUFDekYsTUFBTSxFQUFFLFlBQVk7WUFDcEIsU0FBUyxFQUFFLDZEQUE2RDtZQUN4RSxRQUFRLEVBQUUsYUFBYTtZQUN2QixZQUFZLEVBQUUsZUFBZTtZQUM3QixXQUFXLEVBQUUsQ0FBQztZQUNkLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLGVBQWU7U0FDbEY7UUFDRDtZQUNJLEtBQUssRUFBRSwwRUFBMEU7WUFDakYsSUFBSSxFQUFFLDhCQUE4QjtZQUNwQyxPQUFPLEVBQUUsc0dBQXNHO1lBQy9HLE9BQU8sRUFBRSwyRUFBMkU7WUFDcEYsTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixTQUFTLEVBQUUsZ0VBQWdFO1lBQzNFLFFBQVEsRUFBRSxjQUFjO1lBQ3hCLFlBQVksRUFBRSxlQUFlO1lBQzdCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsV0FBVyxFQUFFLEtBQUs7WUFDbEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsWUFBWSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsZUFBZTtTQUNsRjtRQUNEO1lBQ0ksS0FBSyxFQUFFLHNEQUFzRDtZQUM3RCxJQUFJLEVBQUUseUJBQXlCO1lBQy9CLE9BQU8sRUFBRSxtRUFBbUU7WUFDNUUsT0FBTyxFQUFFLG9FQUFvRTtZQUM3RSxNQUFNLEVBQUUsY0FBYztZQUN0QixTQUFTLEVBQUUsNERBQTREO1lBQ3ZFLFFBQVEsRUFBRSxTQUFTO1lBQ25CLFlBQVksRUFBRSxlQUFlO1lBQzdCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsV0FBVyxFQUFFLEtBQUs7WUFDbEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsWUFBWSxFQUFFLElBQUksSUFBSSxFQUFFO1NBQzNCO1FBQ0Q7WUFDSSxLQUFLLEVBQUUsMkNBQTJDO1lBQ2xELElBQUksRUFBRSw2QkFBNkI7WUFDbkMsT0FBTyxFQUFFLDBFQUEwRTtZQUNuRixPQUFPLEVBQUUsNkVBQTZFO1lBQ3RGLE1BQU0sRUFBRSxXQUFXO1lBQ25CLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFlBQVksRUFBRSxlQUFlO1lBQzdCLFdBQVcsRUFBRSxFQUFFO1lBQ2YsV0FBVyxFQUFFLEtBQUs7WUFDbEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsWUFBWSxFQUFFLElBQUksSUFBSSxFQUFFO1NBQzNCO0tBQ0osQ0FBQTtJQUVELEtBQUssTUFBTSxJQUFJLElBQUksV0FBVyxFQUFFLENBQUM7UUFDN0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ3JFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1FBQ25ELENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDMUQsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUE7QUFDekMsQ0FBQyJ9