"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = testMediaIntegration;
const media_1 = require("../modules/media");
async function testMediaIntegration({ container }) {
    console.log('Running media integration test...');
    const mediaService = container.resolve(media_1.MEDIA_MODULE);
    // Create test media
    const testUrl = 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sonos-product-1.webp';
    const mediaPayload = { url: testUrl, mime_type: 'image/webp', title: 'Integration Test Media' };
    const created = await (mediaService.createMedia ? mediaService.createMedia(mediaPayload) : mediaService.createMedias(mediaPayload));
    const mediaId = Array.isArray(created) ? created[0]?.id : created?.id;
    if (!mediaId)
        throw new Error('Failed to create media');
    // Create gallery
    const galleryPayload = { name: 'integration-gallery', slug: `integration-${Date.now()}`, description: 'Integration test gallery', thumbnail_url: testUrl };
    const gallery = await (mediaService.createGalleries ? mediaService.createGalleries(galleryPayload) : mediaService.createGallery(galleryPayload));
    const galleryId = Array.isArray(gallery) ? gallery[0]?.id : gallery?.id;
    if (!galleryId)
        throw new Error('Failed to create gallery');
    // Add media to gallery
    const added = await mediaService.addMediaToGallery(galleryId, mediaId, 0);
    if (!added)
        throw new Error('Failed to add media to gallery');
    // Fetch store endpoint (requires publishable key in env)
    const origin = process.env.MEDUSA_URL || 'http://localhost:9000';
    const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || process.env.MEDUSA_PUBLISHABLE_KEY;
    if (!key)
        throw new Error('Publishable key not set in env for integration test');
    const url = `${origin.replace(/\/$/, '')}/store/media?gallery_id=${encodeURIComponent(galleryId)}`;
    const res = await fetch(url, { headers: { 'x-publishable-api-key': key } });
    if (!res.ok)
        throw new Error(`Store media fetch failed: ${res.status}`);
    const json = await res.json();
    if (!json.media || json.media.length === 0)
        throw new Error('Store media returned no items');
    console.log('Integration test passed: media returned from store endpoint');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1tZWRpYS1pbnRlZ3JhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3Rlc3QtbWVkaWEtaW50ZWdyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSx1Q0FpQ0M7QUFuQ0QsNENBQStDO0FBRWhDLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUN4RSxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUE7SUFDaEQsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFRLENBQUE7SUFFM0Qsb0JBQW9CO0lBQ3BCLE1BQU0sT0FBTyxHQUFHLDhFQUE4RSxDQUFBO0lBQzlGLE1BQU0sWUFBWSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSx3QkFBd0IsRUFBRSxDQUFBO0lBQy9GLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7SUFDbkksTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQTtJQUNyRSxJQUFJLENBQUMsT0FBTztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtJQUV2RCxpQkFBaUI7SUFDakIsTUFBTSxjQUFjLEdBQUcsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLGVBQWUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLDBCQUEwQixFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQTtJQUMxSixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO0lBQ2hKLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUE7SUFDdkUsSUFBSSxDQUFDLFNBQVM7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUE7SUFFM0QsdUJBQXVCO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLE1BQU0sWUFBWSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDekUsSUFBSSxDQUFDLEtBQUs7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7SUFFN0QseURBQXlEO0lBQ3pELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLHVCQUF1QixDQUFBO0lBQ2hFLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQTtJQUNoRyxJQUFJLENBQUMsR0FBRztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQTtJQUVoRixNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQywyQkFBMkIsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQTtJQUNsRyxNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDM0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDdkUsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUEyQixDQUFBO0lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUE7SUFFNUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2REFBNkQsQ0FBQyxDQUFBO0FBQzVFLENBQUMifQ==