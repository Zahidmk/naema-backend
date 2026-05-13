"use strict";
/**
 * Update ALL Banners with proper e-commerce images
 * Run: npx medusa exec src/scripts/update-hero-banners.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateAllBanners;
const media_1 = require("../modules/media");
async function updateAllBanners({ container }) {
    const mediaService = container.resolve(media_1.MEDIA_MODULE);
    console.log("🎯 Updating ALL Banners with proper e-commerce images...");
    // Delete ALL existing banners
    try {
        const [existingBanners] = await mediaService.listAndCountBanners({}, { take: 100 });
        if (existingBanners && existingBanners.length > 0) {
            console.log(`🗑️  Deleting ${existingBanners.length} existing banners...`);
            for (const banner of existingBanners) {
                await mediaService.deleteBanners({ id: banner.id });
                console.log(`   ❌ Deleted: ${banner.id} - ${banner.title || banner.position}`);
            }
        }
    }
    catch (e) {
        console.log("⚠️  Could not delete existing banners");
    }
    // ALL BANNERS - Professional e-commerce images for MarkaSouq
    const allBanners = [
        // ============ HERO BANNERS (Top Slider) ============
        {
            position: "hero",
            title: "Latest Smartphones",
            link: "/en/categories/smart-phones",
            image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1600&h=700&fit=crop&q=80",
            is_active: true,
            display_order: 1,
            metadata: { subtitle: "iPhone, Samsung Galaxy & Premium Android Phones" },
        },
        {
            position: "hero",
            title: "Power Banks Collection",
            link: "/en/categories/power-banks",
            image_url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1600&h=700&fit=crop&q=80",
            is_active: true,
            display_order: 2,
            metadata: { subtitle: "Never Run Out of Power - Up to 50% Off" },
        },
        {
            position: "hero",
            title: "Gaming Accessories",
            link: "/en/categories/gaming",
            image_url: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1600&h=700&fit=crop&q=80",
            is_active: true,
            display_order: 3,
            metadata: { subtitle: "Controllers, Headsets & Gaming Gear" },
        },
        {
            position: "hero",
            title: "Premium Headphones",
            link: "/en/categories/headphones",
            image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&h=700&fit=crop&q=80",
            is_active: true,
            display_order: 4,
            metadata: { subtitle: "Sony, Bose, JBL - Crystal Clear Audio" },
        },
        {
            position: "hero",
            title: "Smart Watches",
            link: "/en/categories/smart-watches",
            image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&h=700&fit=crop&q=80",
            is_active: true,
            display_order: 5,
            metadata: { subtitle: "Apple Watch, Samsung Galaxy Watch & More" },
        },
        // ============ SINGLE BANNER (Wide Banner) ============
        {
            position: "single",
            title: "Mega Electronics Sale",
            link: "/en/categories/electronics",
            image_url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&h=500&fit=crop&q=80",
            is_active: true,
            display_order: 1,
            metadata: { subtitle: "Up to 70% Off on Premium Electronics" },
        },
        // ============ DUAL BANNERS (Two Tiles) ============
        {
            position: "dual",
            title: "Power Up Your Space",
            link: "/en/categories/power-banks",
            image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80",
            is_active: true,
            display_order: 1,
            metadata: { subtitle: "Premium Power Banks & Chargers" },
        },
        {
            position: "dual",
            title: "Audio Excellence",
            link: "/en/categories/headphones",
            image_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=600&fit=crop&q=80",
            is_active: true,
            display_order: 2,
            metadata: { subtitle: "Wireless Earbuds & Headphones" },
        },
        // ============ TRIPLE BANNERS (Three Tiles) ============
        {
            position: "triple",
            title: "Smart Tech",
            link: "/en/categories/smart-watches",
            image_url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop&q=80",
            is_active: true,
            display_order: 1,
            metadata: { subtitle: "Smartwatches & Fitness Trackers" },
        },
        {
            position: "triple",
            title: "Gaming Zone",
            link: "/en/categories/gaming",
            image_url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop&q=80",
            is_active: true,
            display_order: 2,
            metadata: { subtitle: "Gaming Accessories & Controllers" },
        },
        {
            position: "triple",
            title: "Mobile Accessories",
            link: "/en/categories/mobile-accessories",
            image_url: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&h=400&fit=crop&q=80",
            is_active: true,
            display_order: 3,
            metadata: { subtitle: "Cases, Chargers & More" },
        },
    ];
    // Create all banners
    console.log("\n✨ Creating new banners...");
    for (const banner of allBanners) {
        try {
            const [created] = await mediaService.createBanners([banner]);
            console.log(`   ✅ [${banner.position.toUpperCase()}] ${created.id} - ${banner.title}`);
        }
        catch (e) {
            console.error(`   ❌ Failed to create banner "${banner.title}":`, e.message);
        }
    }
    console.log("\n🎉 All banners updated successfully!");
    console.log("📌 Total banners created: " + allBanners.length);
    console.log("   - Hero (Top Slider): 5");
    console.log("   - Single (Wide Banner): 1");
    console.log("   - Dual (Two Tiles): 2");
    console.log("   - Triple (Three Tiles): 3");
    console.log("\n📌 Refresh your admin dashboard at http://localhost:9000/app/banners");
    console.log("📌 Refresh your frontend at http://localhost:3000");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWhlcm8tYmFubmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3VwZGF0ZS1oZXJvLWJhbm5lcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFLSCxtQ0FzSkM7QUF4SkQsNENBQStDO0FBRWhDLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNwRSxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFZLENBQVEsQ0FBQTtJQUUzRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBEQUEwRCxDQUFDLENBQUE7SUFFdkUsOEJBQThCO0lBQzlCLElBQUksQ0FBQztRQUNILE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUVuRixJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLGVBQWUsQ0FBQyxNQUFNLHNCQUFzQixDQUFDLENBQUE7WUFDMUUsS0FBSyxNQUFNLE1BQU0sSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixNQUFNLENBQUMsRUFBRSxNQUFNLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7WUFDaEYsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQTtJ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