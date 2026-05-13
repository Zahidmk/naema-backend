"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
/**
 * Gallery - groups of media items (e.g., promotions, category banners)
 */
const Gallery = utils_1.model.define("gallery", {
    id: utils_1.model.id().primaryKey(),
    name: utils_1.model.text(),
    slug: utils_1.model.text().unique(),
    description: utils_1.model.text().nullable(),
    is_active: utils_1.model.boolean().default(true),
    display_order: utils_1.model.number().default(0),
    metadata: utils_1.model.json().nullable(),
});
exports.default = Gallery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FsbGVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL21lZGlhL21vZGVscy9nYWxsZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQWtEO0FBRWxEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7SUFDdEMsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsSUFBSSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDbEIsSUFBSSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7SUFDM0IsV0FBVyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDcEMsU0FBUyxFQUFFLGFBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3hDLGFBQWEsRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4QyxRQUFRLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNsQyxDQUFDLENBQUM7QUFFSCxrQkFBZSxPQUFPLENBQUMifQ==