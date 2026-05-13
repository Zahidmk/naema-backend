"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
/**
 * Brand entity representing product brands/manufacturers
 * Supports SEO, ordering, and active/inactive status
 */
const Brand = utils_1.model.define("brand", {
    id: utils_1.model.id().primaryKey(),
    name: utils_1.model.text(),
    slug: utils_1.model.text().unique(),
    description: utils_1.model.text().nullable(),
    logo_url: utils_1.model.text().nullable(),
    banner_url: utils_1.model.text().nullable(),
    is_active: utils_1.model.boolean().default(true),
    is_special: utils_1.model.boolean().default(false),
    meta_title: utils_1.model.text().nullable(),
    meta_description: utils_1.model.text().nullable(),
    display_order: utils_1.model.number().default(0),
});
exports.default = Brand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9icmFuZHMvbW9kZWxzL2JyYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQWlEO0FBRWpEOzs7R0FHRztBQUNILE1BQU0sS0FBSyxHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO0lBQ2xDLEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzNCLElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ2xCLElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFO0lBQzNCLFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3BDLFFBQVEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2pDLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ25DLFNBQVMsRUFBRSxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUN4QyxVQUFVLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDMUMsVUFBVSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbkMsZ0JBQWdCLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN6QyxhQUFhLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FDekMsQ0FBQyxDQUFBO0FBRUYsa0JBQWUsS0FBSyxDQUFBIn0=