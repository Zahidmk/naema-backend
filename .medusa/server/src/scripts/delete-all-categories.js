"use strict";
/**
 * Delete All Categories and Recreate Fresh
 * This script cleans up all categories and recreates them properly
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deleteAllCategories;
const utils_1 = require("@medusajs/framework/utils");
async function deleteAllCategories({ container }) {
    const productCategoryService = container.resolve(utils_1.Modules.PRODUCT);
    const logger = container.resolve("logger");
    logger.info("🗑️ Deleting ALL categories to start fresh...\n");
    try {
        // Get all categories
        const allCategories = await productCategoryService.listProductCategories({}, { take: 1000 });
        logger.info(`Found ${allCategories.length} categories to delete\n`);
        // Delete all categories
        if (allCategories.length > 0) {
            const ids = allCategories.map(c => c.id);
            // Delete in batches to avoid timeout
            const batchSize = 50;
            for (let i = 0; i < ids.length; i += batchSize) {
                const batch = ids.slice(i, i + batchSize);
                try {
                    await productCategoryService.deleteProductCategories(batch);
                    logger.info(`  ✓ Deleted batch ${Math.floor(i / batchSize) + 1} (${batch.length} categories)`);
                }
                catch (e) {
                    logger.warn(`  ⚠️ Batch delete failed, trying one by one...`);
                    for (const id of batch) {
                        try {
                            await productCategoryService.deleteProductCategories([id]);
                        }
                        catch (e2) {
                            // Ignore - might already be deleted
                        }
                    }
                }
            }
        }
        // Verify deletion
        const remaining = await productCategoryService.listProductCategories({}, { take: 10 });
        logger.info(`\n✅ Cleanup complete! Remaining categories: ${remaining.length}`);
    }
    catch (error) {
        logger.error("Failed to delete categories:", error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLWFsbC1jYXRlZ29yaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZGVsZXRlLWFsbC1jYXRlZ29yaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBS0gsc0NBK0NDO0FBakRELHFEQUFvRDtBQUVyQyxLQUFLLFVBQVUsbUJBQW1CLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDdkUsTUFBTSxzQkFBc0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsRSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUUvRCxJQUFJLENBQUM7UUFDSCxxQkFBcUI7UUFDckIsTUFBTSxhQUFhLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxxQkFBcUIsQ0FDdEUsRUFBRSxFQUNGLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUNmLENBQUM7UUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsYUFBYSxDQUFDLE1BQU0seUJBQXlCLENBQUMsQ0FBQztRQUVwRSx3QkFBd0I7UUFDeEIsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFekMscUNBQXFDO1lBQ3JDLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQy9DLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDO29CQUNILE1BQU0sc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxjQUFjLENBQUMsQ0FBQztnQkFDL0YsQ0FBQztnQkFBQyxPQUFPLENBQVUsRUFBRSxDQUFDO29CQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7b0JBQzlELEtBQUssTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUM7d0JBQ3ZCLElBQUksQ0FBQzs0QkFDSCxNQUFNLHNCQUFzQixDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDN0QsQ0FBQzt3QkFBQyxPQUFPLEVBQVcsRUFBRSxDQUFDOzRCQUNyQixvQ0FBb0M7d0JBQ3RDLENBQUM7b0JBQ0gsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxrQkFBa0I7UUFDbEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RixNQUFNLENBQUMsSUFBSSxDQUFDLCtDQUErQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUVqRixDQUFDO0lBQUMsT0FBTyxLQUFjLEVBQUUsQ0FBQztRQUN4QixNQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEtBQWMsQ0FBQyxDQUFDO1FBQzdELE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMifQ==