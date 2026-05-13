"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createSampleHeroBanner;
const media_1 = require("../modules/media");
async function createSampleHeroBanner({ container }) {
    const mediaService = container.resolve(media_1.MEDIA_MODULE);
    console.log("🔍 Checking for existing hero banners…");
    const [existing] = await mediaService.listAndCountBanners({ position: "hero" }, { take: 1 });
    if (existing && existing.length) {
        console.log(`ℹ️ A hero banner already exists (id=${existing[0].id}). Skipping create.`);
        return;
    }
    console.log("🖼️ Creating sample media record…");
    // Use a public image from Medusa's S3 bucket allowed by Next config
    const media = await mediaService.createMedias({
        url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sonos-product-1.webp",
        mime_type: "image/webp",
        title: "Sample Hero",
        alt_text: "Sample Hero",
    });
    const mediaId = Array.isArray(media) ? media[0]?.id : media?.id;
    if (!mediaId) {
        console.error("❌ Failed to create media record");
        return;
    }
    console.log("🏷️ Creating hero banner…");
    const banner = await mediaService.createBanners({
        title: "Sample Hero Banner",
        position: "hero",
        is_active: true,
        media_id: mediaId,
        display_order: 0,
    });
    const bannerId = Array.isArray(banner) ? banner[0]?.id : banner?.id;
    console.log(`✅ Created hero banner id=${bannerId}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNhbXBsZS1oZXJvLWJhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NyZWF0ZS1zYW1wbGUtaGVyby1iYW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSx5Q0FpQ0M7QUFuQ0QsNENBQStDO0FBRWhDLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUMxRSxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFZLENBQVEsQ0FBQTtJQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLENBQUE7SUFDckQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDNUYsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUE7UUFDdkYsT0FBTTtJQUNSLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUE7SUFDaEQsb0VBQW9FO0lBQ3BFLE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFBWSxDQUFDLFlBQVksQ0FBQztRQUM1QyxHQUFHLEVBQUUsOEVBQThFO1FBQ25GLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLFFBQVEsRUFBRSxhQUFhO0tBQ3hCLENBQUMsQ0FBQTtJQUNGLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUE7SUFDL0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO1FBQ2hELE9BQU07SUFDUixDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO0lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sWUFBWSxDQUFDLGFBQWEsQ0FBQztRQUM5QyxLQUFLLEVBQUUsb0JBQW9CO1FBQzNCLFFBQVEsRUFBRSxNQUFNO1FBQ2hCLFNBQVMsRUFBRSxJQUFJO1FBQ2YsUUFBUSxFQUFFLE9BQU87UUFDakIsYUFBYSxFQUFFLENBQUM7S0FDakIsQ0FBQyxDQUFBO0lBQ0YsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTtJQUNuRSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3JELENBQUMifQ==