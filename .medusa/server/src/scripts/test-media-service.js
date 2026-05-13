"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = testMediaService;
const media_1 = require("../modules/media");
async function testMediaService({ container }) {
    console.log("Testing Media Service...");
    try {
        const mediaService = container.resolve(media_1.MEDIA_MODULE);
        console.log("✓ Media service resolved successfully");
        // Test listing media (should return empty array initially)
        const [media, count] = await mediaService.listAndCountMedia({}, { skip: 0, take: 10 });
        console.log(`✓ listAndCountMedia works: found ${count} media items`);
        // Test creating a media item
        const testMedia = {
            url: "http://localhost:9000/static/uploads/test.jpg",
            mime_type: "image/jpeg",
            title: "Test Media",
            alt_text: "Test image"
        };
        const created = await mediaService.createMedia(testMedia);
        console.log("✓ createMedia works:", created.id);
        // Test listing after creation
        const [newMedia, newCount] = await mediaService.listAndCountMedia({}, { skip: 0, take: 10 });
        console.log(`✓ After creation: found ${newCount} media items`);
        console.log("✅ All media service tests passed!");
    }
    catch (error) {
        console.error("❌ Media service test failed:", error.message);
        console.error("Stack:", error.stack);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1tZWRpYS1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdGVzdC1tZWRpYS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsbUNBaUNDO0FBcENELDRDQUErQztBQUdoQyxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO0lBRXZDLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQWUsb0JBQVksQ0FBQyxDQUFBO1FBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQTtRQUVwRCwyREFBMkQ7UUFDN0QsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3BGLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEtBQUssY0FBYyxDQUFDLENBQUE7UUFFcEUsNkJBQTZCO1FBQzdCLE1BQU0sU0FBUyxHQUFHO1lBQ2hCLEdBQUcsRUFBRSwrQ0FBK0M7WUFDcEQsU0FBUyxFQUFFLFlBQVk7WUFDdkIsS0FBSyxFQUFFLFlBQVk7WUFDbkIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUUvQyw4QkFBOEI7UUFDOUIsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLFFBQVEsY0FBYyxDQUFDLENBQUE7UUFFOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0lBRWxELENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzVELE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNwQyxNQUFNLEtBQUssQ0FBQTtJQUNiLENBQUM7QUFDSCxDQUFDIn0=