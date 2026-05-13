"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.DELETE = DELETE;
const media_1 = require("../../../../../../../modules/media");
exports.AUTHENTICATE = true;
async function DELETE(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const gallery_id = req.params.id;
        const media_id = req.params.mediaId;
        if (!gallery_id || !media_id)
            return res.status(400).json({ message: 'gallery and media id required' });
        if (typeof mediaService.deleteGalleryMedias === 'function') {
            await mediaService.deleteGalleryMedias({ gallery_id, media_id });
            return res.status(204).send();
        }
        // fallback: try generic delete
        if (typeof mediaService.delete === 'function') {
            await mediaService.delete(media_id);
            return res.status(204).send();
        }
        res.status(501).json({ message: 'Delete media from gallery not supported' });
    }
    catch (e) {
        console.error('Remove media from gallery error:', e);
        res.status(500).json({ message: e?.message || 'Failed to remove media from gallery' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21lZGlhL2dhbGxlcmllcy9baWRdL21lZGlhL1ttZWRpYUlkXS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSx3QkF1QkM7QUEzQkQsOERBQWlFO0FBRXBELFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUV6QixLQUFLLFVBQVUsTUFBTSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDbEUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQVksQ0FBUSxDQUFBO1FBQzNELE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFBO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFBO1FBQ25DLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxDQUFDLENBQUE7UUFFdkcsSUFBSSxPQUFPLFlBQVksQ0FBQyxtQkFBbUIsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUMzRCxNQUFNLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO1lBQ2hFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUMvQixDQUFDO1FBRUQsK0JBQStCO1FBQy9CLElBQUksT0FBTyxZQUFZLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQzlDLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNuQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDL0IsQ0FBQztRQUVELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHlDQUF5QyxFQUFFLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3BELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLElBQUkscUNBQXFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3hGLENBQUM7QUFDSCxDQUFDIn0=