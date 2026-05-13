"use strict";
/**
 * Cleanup Old Categories Script
 * Removes categories that are not in the approved list
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cleanupOldCategories;
const utils_1 = require("@medusajs/framework/utils");
// List of approved main category handles (keep these)
const APPROVED_MAIN_CATEGORIES = [
    'mobile-tablet',
    'health-beauty',
    'electronics',
    'home-kitchen',
    'fashion',
    'offroad',
    'computers-gaming',
    'toys-games-kids',
    'automotives',
    'hot-deals',
];
// Old categories to remove (handles)
const CATEGORIES_TO_REMOVE = [
    'smart-phones',
    'gaming',
    'headphones',
    'cable',
    'power-banks', // if standalone, should be under mobile-tablet
    'smart-watches', // if standalone, should be under electronics
    'laptops', // if standalone, should be under computers-gaming
];
async function cleanupOldCategories({ container }) {
    const productCategoryService = container.resolve(utils_1.Modules.PRODUCT);
    const logger = container.resolve("logger");
    logger.info("🧹 Starting cleanup of old categories...\n");
    try {
        // Get all categories
        const allCategories = await productCategoryService.listProductCategories({}, { take: 500 });
        logger.info(`Found ${allCategories.length} total categories\n`);
        // Find categories to remove (top-level only that are not in approved list)
        const topLevelCategories = allCategories.filter(cat => !cat.parent_category_id);
        logger.info(`Top-level categories: ${topLevelCategories.map(c => c.handle).join(', ')}\n`);
        const categoriesToDelete = [];
        for (const cat of topLevelCategories) {
            if (CATEGORIES_TO_REMOVE.includes(cat.handle)) {
                logger.info(`  ⚠️  Will remove: ${cat.name} (${cat.handle})`);
                categoriesToDelete.push(cat.id);
            }
        }
        if (categoriesToDelete.length === 0) {
            logger.info("\n✅ No old categories to remove. All clean!");
            return;
        }
        logger.info(`\n🗑️  Removing ${categoriesToDelete.length} old categories...\n`);
        // Delete the old categories (this will also delete their children due to cascade)
        for (const catId of categoriesToDelete) {
            try {
                await productCategoryService.deleteProductCategories([catId]);
                logger.info(`  ✓ Deleted category ID: ${catId}`);
            }
            catch (error) {
                logger.warn(`  ⚠️  Could not delete ${catId}: ${error.message}`);
            }
        }
        logger.info("\n✅ Cleanup complete!");
        // Show remaining top-level categories
        const remaining = await productCategoryService.listProductCategories({ parent_category_id: null }, { take: 50 });
        logger.info(`\nRemaining main categories (${remaining.length}):`);
        remaining.forEach(cat => {
            logger.info(`  - ${cat.name} (${cat.handle})`);
        });
    }
    catch (error) {
        logger.error("Failed to cleanup categories:", error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW51cC1vbGQtY2F0ZWdvcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NsZWFudXAtb2xkLWNhdGVnb3JpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUE4QkgsdUNBK0RDO0FBMUZELHFEQUFvRDtBQUVwRCxzREFBc0Q7QUFDdEQsTUFBTSx3QkFBd0IsR0FBRztJQUMvQixlQUFlO0lBQ2YsZUFBZTtJQUNmLGFBQWE7SUFDYixjQUFjO0lBQ2QsU0FBUztJQUNULFNBQVM7SUFDVCxrQkFBa0I7SUFDbEIsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixXQUFXO0NBQ1osQ0FBQztBQUVGLHFDQUFxQztBQUNyQyxNQUFNLG9CQUFvQixHQUFHO0lBQzNCLGNBQWM7SUFDZCxRQUFRO0lBQ1IsWUFBWTtJQUNaLE9BQU87SUFDUCxhQUFhLEVBQUUsK0NBQStDO0lBQzlELGVBQWUsRUFBRSw2Q0FBNkM7SUFDOUQsU0FBUyxFQUFFLGtEQUFrRDtDQUM5RCxDQUFDO0FBRWEsS0FBSyxVQUFVLG9CQUFvQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3hFLE1BQU0sc0JBQXNCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUzQyxNQUFNLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7SUFFMUQsSUFBSSxDQUFDO1FBQ0gscUJBQXFCO1FBQ3JCLE1BQU0sYUFBYSxHQUFHLE1BQU0sc0JBQXNCLENBQUMscUJBQXFCLENBQ3RFLEVBQUUsRUFDRixFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FDZCxDQUFDO1FBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLGFBQWEsQ0FBQyxNQUFNLHFCQUFxQixDQUFDLENBQUM7UUFFaEUs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