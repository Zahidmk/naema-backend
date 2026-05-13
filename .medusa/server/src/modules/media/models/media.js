"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
/**
 * Media entity for storing uploaded asset references
 * Supports images, videos, and other media types
 */
const Media = utils_1.model.define("media", {
    id: utils_1.model.id().primaryKey(),
    url: utils_1.model.text(),
    mime_type: utils_1.model.text().nullable(),
    title: utils_1.model.text().nullable(),
    title_ar: utils_1.model.text().nullable(), // Arabic title for RTL support
    alt_text: utils_1.model.text().nullable(),
    thumbnail_url: utils_1.model.text().nullable(),
    brand: utils_1.model.text().nullable(), // Brand name for display
    views: utils_1.model.number().default(0), // View count for analytics
    display_order: utils_1.model.number().default(0), // Order in gallery
    is_featured: utils_1.model.boolean().default(false), // Featured videos
    product_ids: utils_1.model.json().nullable(), // Array of Medusa product IDs linked to this media
    metadata: utils_1.model.json().nullable(),
});
exports.default = Media;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWRpYS9tb2RlbHMvbWVkaWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBa0Q7QUFFbEQ7OztHQUdHO0FBQ0gsTUFBTSxLQUFLLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7SUFDbEMsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsR0FBRyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDakIsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbEMsS0FBSyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDOUIsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSwrQkFBK0I7SUFDbEUsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDakMsYUFBYSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDdEMsS0FBSyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSx5QkFBeUI7SUFDekQsS0FBSyxFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsMkJBQTJCO0lBQzdELGFBQWEsRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLG1CQUFtQjtJQUM3RCxXQUFXLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxrQkFBa0I7SUFDL0QsV0FBVyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxtREFBbUQ7SUFDekYsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsa0JBQWUsS0FBSyxDQUFDIn0=