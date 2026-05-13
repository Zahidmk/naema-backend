"use strict";
/**
 * List All Categories Script
 * Shows all categories with their hierarchy
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = listCategories;
const utils_1 = require("@medusajs/framework/utils");
async function listCategories({ container }) {
    const productCategoryService = container.resolve(utils_1.Modules.PRODUCT);
    const logger = container.resolve("logger");
    logger.info("📋 Listing all categories...\n");
    try {
        // Get all categories
        const allCategories = await productCategoryService.listProductCategories({}, { take: 500 });
        logger.info(`Total categories: ${allCategories.length}\n`);
        // Find top-level categories (no parent)
        const topLevel = allCategories.filter(cat => !cat.parent_category_id);
        logger.info(`\n🔝 Top-level categories (${topLevel.length}):\n`);
        topLevel.forEach(cat => {
            logger.info(`  - ${cat.name} | handle: "${cat.handle}" | id: ${cat.id}`);
        });
        // Show ones that might be duplicates or old
        const oldHandles = ['smart-phones', 'gaming', 'headphones', 'cable', 'power-banks', 'smart-watches', 'laptops'];
        const oldCats = allCategories.filter(cat => oldHandles.includes(cat.handle) && !cat.parent_category_id);
        if (oldCats.length > 0) {
            logger.info(`\n⚠️ Old/Unwanted top-level categories found:\n`);
            oldCats.forEach(cat => {
                logger.info(`  - ${cat.name} | handle: "${cat.handle}" | id: ${cat.id}`);
            });
        }
    }
    catch (error) {
        logger.error("Failed to list categories:", error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1jYXRlZ29yaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbGlzdC1jYXRlZ29yaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBS0gsaUNBc0NDO0FBeENELHFEQUFvRDtBQUVyQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ2xFLE1BQU0sc0JBQXNCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUzQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFFOUMsSUFBSSxDQUFDO1FBQ0gscUJBQXFCO1FBQ3JCLE1BQU0sYUFBYSxHQUFHLE1BQU0sc0JBQXNCLENBQUMscUJBQXFCLENBQ3RFLEVBQUUsRUFDRixFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FDZCxDQUFDO1FBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsYUFBYSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFFM0Qsd0NBQXdDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRXRFLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLFFBQVEsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxDQUFDO1FBQ2pFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLGVBQWUsR0FBRyxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUVILDRDQUE0QztRQUM1QyxNQUFNLFVBQVUsR0FBRyxDQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hILE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRXhHLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLGlEQUFpRCxDQUFDLENBQUM7WUFDL0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLGVBQWUsR0FBRyxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRSxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFFSCxDQUFDO0lBQUMsT0FBTyxLQUFjLEVBQUUsQ0FBQztRQUN4QixNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLEtBQWMsQ0FBQyxDQUFDO1FBQzNELE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMifQ==