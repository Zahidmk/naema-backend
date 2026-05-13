"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.POST = POST;
const media_1 = require("../../../../../../modules/media");
exports.AUTHENTICATE = true;
// POST: add media to gallery (expects body { media_id, display_order })
async function POST(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const gallery_id = req.params.id;
        const body = req.body;
        const media_id = body.media_id;
        if (!media_id)
            return res.status(400).json({ message: 'media_id is required' });
        const item = await mediaService.addMediaToGallery(gallery_id, media_id, body.display_order || 0);
        res.json({ item });
    }
    catch (e) {
        console.error('Add media to gallery error:', e);
        res.status(500).json({ message: e?.message || 'Failed to add media to gallery' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21lZGlhL2dhbGxlcmllcy9baWRdL21lZGlhL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU1BLG9CQWFDO0FBbEJELDJEQUE4RDtBQUVqRCxRQUFBLFlBQVksR0FBRyxJQUFJLENBQUE7QUFFaEMsd0VBQXdFO0FBQ2pFLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFRLENBQUE7UUFDM0QsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUE7UUFDaEMsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQVcsQ0FBQTtRQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO1FBQzlCLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxDQUFDLENBQUE7UUFDL0UsTUFBTSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ2hHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3BCLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDL0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sSUFBSSxnQ0FBZ0MsRUFBRSxDQUFDLENBQUE7SUFDbkYsQ0FBQztBQUNILENBQUMifQ==