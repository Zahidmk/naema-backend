"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = smokeMediaFlow;
const media_1 = require("../modules/media");
async function smokeMediaFlow({ container }) {
    console.log("Starting smoke media flow...");
    const mediaService = container.resolve(media_1.MEDIA_MODULE);
    // 1) create a media item using a public image so we don't rely on upload
    const testUrl = "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sonos-product-1.webp";
    const mediaPayload = { url: testUrl, mime_type: 'image/webp', title: 'Smoke Test Media', alt_text: 'Smoke test' };
    const created = await mediaService.createMedia ? await mediaService.createMedia(mediaPayload) : await mediaService.createMedias(mediaPayload);
    const mediaId = Array.isArray(created) ? created[0]?.id : created?.id;
    console.log(`Created media id=${mediaId}`);
    // 2) create a gallery
    const galleryPayload = { name: 'smoke-gallery', slug: 'smoke-gallery', description: 'Smoke test gallery', thumbnail_url: testUrl };
    const gallery = await mediaService.createGalleries ? await mediaService.createGalleries(galleryPayload) : await mediaService.createGallery(galleryPayload);
    const galleryId = Array.isArray(gallery) ? gallery[0]?.id : gallery?.id;
    console.log(`Created gallery id=${galleryId}`);
    // 3) add media to gallery
    const added = await mediaService.addMediaToGallery(galleryId, mediaId, 0);
    console.log('Added media to gallery:', !!added);
    // 4) query the store endpoint for the gallery (via local http)
    try {
        const origin = process.env.MEDUSA_URL || 'http://localhost:9000';
        const url = `${origin.replace(/\/$/, '')}/store/media?gallery_id=${encodeURIComponent(galleryId)}`;
        console.log('Fetching store media URL:', url);
        const res = await fetch(url);
        const json = await res.json();
        console.log('Store media response:', JSON.stringify(json, null, 2));
    }
    catch (e) {
        console.error('Failed to GET store/media:', e?.message || e);
    }
    console.log('Smoke media flow complete');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21va2UtbWVkaWEtZmxvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3Ntb2tlLW1lZGlhLWZsb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxpQ0FrQ0M7QUFwQ0QsNENBQStDO0FBRWhDLEtBQUssVUFBVSxjQUFjLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQVksQ0FBUSxDQUFBO0lBRTNELHlFQUF5RTtJQUN6RSxNQUFNLE9BQU8sR0FBRyw4RUFBOEUsQ0FBQTtJQUM5RixNQUFNLFlBQVksR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxDQUFBO0lBQ2pILE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDN0ksTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQTtJQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBRTFDLHNCQUFzQjtJQUN0QixNQUFNLGNBQWMsR0FBRyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFBO0lBQ2xJLE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDMUosTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQTtJQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBRTlDLDBCQUEwQjtJQUMxQixNQUFNLEtBQUssR0FBRyxNQUFNLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3pFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRS9DLCtEQUErRDtJQUMvRCxJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSx1QkFBdUIsQ0FBQTtRQUNoRSxNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQywyQkFBMkIsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQTtRQUNsRyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQzdDLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVCLE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDckUsQ0FBQztJQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQzlELENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUE7QUFDMUMsQ0FBQyJ9