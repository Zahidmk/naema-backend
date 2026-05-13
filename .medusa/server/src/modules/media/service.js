"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const media_1 = __importDefault(require("./models/media"));
const gallery_1 = __importDefault(require("./models/gallery"));
const gallery_media_1 = __importDefault(require("./models/gallery_media"));
const banner_1 = __importDefault(require("./models/banner"));
class MediaService extends (0, utils_1.MedusaService)({ Media: media_1.default, Gallery: gallery_1.default, GalleryMedia: gallery_media_1.default, Banner: banner_1.default }) {
    async addMediaToGallery(gallery_id, media_id, display_order = 0) {
        // Prevent duplicates
        const existing = await this.listGalleryMedias({ gallery_id, media_id });
        if (existing.length)
            return existing[0];
        return this.createGalleryMedias({ gallery_id, media_id, display_order });
    }
    async listGalleryMediaIds(gallery_id) {
        const items = await this.listGalleryMedias({ gallery_id });
        return items.map((i) => i.media_id);
    }
}
exports.default = MediaService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL21lZGlhL3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBeUQ7QUFDekQsMkRBQWtDO0FBQ2xDLCtEQUFzQztBQUN0QywyRUFBaUQ7QUFDakQsNkRBQW9DO0FBRXBDLE1BQU0sWUFBYSxTQUFRLElBQUEscUJBQWEsRUFBQyxFQUFFLEtBQUssRUFBTCxlQUFLLEVBQUUsT0FBTyxFQUFQLGlCQUFPLEVBQUUsWUFBWSxFQUFaLHVCQUFZLEVBQUUsTUFBTSxFQUFOLGdCQUFNLEVBQUUsQ0FBQztJQUNoRixLQUFLLENBQUMsaUJBQWlCLENBQUMsVUFBa0IsRUFBRSxRQUFnQixFQUFFLGFBQWEsR0FBRyxDQUFDO1FBQzdFLHFCQUFxQjtRQUNyQixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZFLElBQUksUUFBUSxDQUFDLE1BQU07WUFBRSxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQTtJQUMxRSxDQUFDO0lBRUQsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFVBQWtCO1FBQzFDLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtRQUMxRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQyxDQUFDO0NBQ0Y7QUFFRCxrQkFBZSxZQUFZLENBQUEifQ==