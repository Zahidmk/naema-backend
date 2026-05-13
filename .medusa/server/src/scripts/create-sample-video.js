"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createSampleVideo;
const media_1 = require("../modules/media");
async function createSampleVideo({ container }) {
    console.log('Running sample video creation...');
    const mediaService = container.resolve(media_1.MEDIA_MODULE);
    // Public sample MP4
    const testUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    const mediaPayload = { url: testUrl, mime_type: 'video/mp4', title: 'Integration Test Video' };
    const created = await (mediaService.createMedia ? mediaService.createMedia(mediaPayload) : mediaService.createMedias(mediaPayload));
    const mediaId = Array.isArray(created) ? created[0]?.id : created?.id;
    if (!mediaId)
        throw new Error('Failed to create media');
    console.log('Created media id:', mediaId);
    // Create gallery
    const galleryPayload = { name: 'video-integration-gallery', slug: `video-integration-${Date.now()}`, description: 'Video integration gallery', thumbnail_url: testUrl };
    const gallery = await (mediaService.createGalleries ? mediaService.createGalleries(galleryPayload) : mediaService.createGallery(galleryPayload));
    const galleryId = Array.isArray(gallery) ? gallery[0]?.id : gallery?.id;
    if (!galleryId)
        throw new Error('Failed to create gallery');
    console.log('Created gallery id:', galleryId);
    // Add media to gallery
    const added = await mediaService.addMediaToGallery(galleryId, mediaId, 0);
    if (!added)
        throw new Error('Failed to add media to gallery');
    console.log('Added media to gallery');
    // Fetch store endpoint (requires publishable key in env)
    const origin = process.env.MEDUSA_URL || 'http://localhost:9000';
    const key = process.env.MEDUSA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
    if (!key)
        throw new Error('Publishable key not set in env for integration test');
    const url = `${origin.replace(/\/$/, '')}/store/media?gallery_id=${encodeURIComponent(galleryId)}`;
    console.log('Fetching store endpoint:', url);
    const res = await fetch(url, { headers: { 'x-publishable-api-key': key } });
    if (!res.ok)
        throw new Error(`Store media fetch failed: ${res.status}`);
    const json = await res.json();
    console.log('Store media response:', json);
    if (!json.media || json.media.length === 0)
        throw new Error('Store media returned no items');
    console.log('Sample video creation and verification succeeded');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNhbXBsZS12aWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NyZWF0ZS1zYW1wbGUtdmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxvQ0F1Q0M7QUF6Q0QsNENBQStDO0FBRWhDLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7SUFDL0MsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFRLENBQUE7SUFFM0Qsb0JBQW9CO0lBQ3BCLE1BQU0sT0FBTyxHQUFHLDBFQUEwRSxDQUFBO0lBQzFGLE1BQU0sWUFBWSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSx3QkFBd0IsRUFBRSxDQUFBO0lBRTlGLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7SUFDbkksTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQTtJQUNyRSxJQUFJLENBQUMsT0FBTztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtJQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBRXpDLGlCQUFpQjtJQUNqQixNQUFNLGNBQWMsR0FBRyxFQUFFLElBQUksRUFBRSwyQkFB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