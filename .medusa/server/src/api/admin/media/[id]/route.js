"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
const media_1 = require("../../../../modules/media");
exports.AUTHENTICATE = true;
async function GET(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const id = req.params.id;
        const item = await (mediaService.retrieveMedia ? mediaService.retrieveMedia(id) : mediaService.get(id));
        if (!item)
            return res.status(404).json({ message: 'Media not found' });
        res.json({ media: item });
    }
    catch (e) {
        console.error('Admin media GET error:', e);
        res.status(500).json({ message: e?.message || 'Failed to retrieve media' });
    }
}
async function PUT(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const id = req.params.id;
        const body = req.body || {};
        // Use updateMedias/updateMedia pattern if available
        if (typeof mediaService.updateMedias === 'function') {
            const updated = await mediaService.updateMedias({ id }, body);
            return res.json({ media: updated });
        }
        if (typeof mediaService.updateMedia === 'function') {
            const updated = await mediaService.updateMedia(id, body);
            return res.json({ media: updated });
        }
        // Fallback: try generic update method
        if (typeof mediaService.update === 'function') {
            await mediaService.update(id, body);
            const item = await mediaService.retrieveMedia(id).catch(() => null);
            return res.json({ media: item });
        }
        res.status(501).json({ message: 'Update not supported on media service' });
    }
    catch (e) {
        console.error('Admin media PUT error:', e);
        res.status(500).json({ message: e?.message || 'Failed to update media' });
    }
}
async function DELETE(req, res) {
    try {
        const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'id is required' });
        const existing = await (typeof mediaService.retrieveMedia === 'function'
            ? mediaService.retrieveMedia(id)
            : mediaService.retrieveMedias ? (await mediaService.retrieveMedias({ id })).shift() : null);
        if (!existing)
            return res.status(404).json({ message: 'Media not found' });
        // Prefer soft delete if available
        // Try common deletion method names used by Medusa-style services
        const deleteAttempts = [
            'softDeleteMedias', 'softDeleteMedia',
            'deleteMedias', 'deleteMedia',
            'removeMedias', 'removeMedia',
            'delete', 'destroy',
        ];
        let performed = false;
        for (const name of deleteAttempts) {
            if (typeof mediaService[name] === 'function') {
                try {
                    // call with array or id depending on common signature
                    if (name.toLowerCase().includes('medias') || name.toLowerCase().endsWith('s')) {
                        await mediaService[name]({ id });
                    }
                    else {
                        await mediaService[name](id);
                    }
                    performed = true;
                    break;
                }
                catch (err) {
                    console.warn(`Delete attempt via ${name} failed:`, err);
                }
            }
        }
        // As a last resort, attempt a soft-delete by setting deleted_at via update method
        if (!performed) {
            if (typeof mediaService.updateMedias === 'function') {
                await mediaService.updateMedias({ id }, { deleted_at: new Date().toISOString() });
                performed = true;
            }
            else if (typeof mediaService.updateMedia === 'function') {
                await mediaService.updateMedia(id, { deleted_at: new Date().toISOString() });
                performed = true;
            }
        }
        if (!performed) {
            return res.status(501).json({ message: 'Delete not supported on media service' });
        }
        res.status(204).send();
    }
    catch (e) {
        console.error('Admin media DELETE error:', e);
        res.status(500).json({ message: e?.message || 'Failed to delete media' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21lZGlhL1tpZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsa0JBV0M7QUFFRCxrQkEwQkM7QUFFRCx3QkEyREM7QUF2R0QscURBQXdEO0FBQzNDLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUV6QixLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQVksQ0FBUSxDQUFBO1FBQzNELE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFBO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDdkcsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtRQUN0RSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7SUFDM0IsQ0FBQztJQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUMxQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLDBCQUEwQixF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