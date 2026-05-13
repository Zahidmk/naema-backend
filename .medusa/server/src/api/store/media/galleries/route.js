"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const media_1 = require("../../../../modules/media");
// Public: list galleries and their media ids
async function GET(req, res) {
    const mediaService = req.scope.resolve(media_1.MEDIA_MODULE);
    const [galleries] = await mediaService.listAndCountGalleries({}, { take: 100 });
    const payload = [];
    for (const g of galleries) {
        const media_ids = await mediaService.listGalleryMediaIds(g.id);
        payload.push({ ...g, media_ids });
    }
    res.json({ galleries: payload });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21lZGlhL2dhbGxlcmllcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGtCQVNDO0FBWkQscURBQXdEO0FBRXhELDZDQUE2QztBQUN0QyxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQVksQ0FBUSxDQUFBO0lBQzNELE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUMvRSxNQUFNLE9BQU8sR0FBVSxFQUFFLENBQUE7SUFDekIsS0FBSyxNQUFNLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUMxQixNQUFNLFNBQVMsR0FBRyxNQUFNLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDOUQsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDbkMsQ0FBQztJQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtBQUNsQyxDQUFDIn0=