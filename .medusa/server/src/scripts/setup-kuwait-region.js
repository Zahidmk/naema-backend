"use strict";
/**
 * Setup Kuwait Region with KWD currency
 *
 * Usage: npx medusa exec ./src/scripts/setup-kuwait-region.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupKuwaitRegion;
const utils_1 = require("@medusajs/framework/utils");
async function setupKuwaitRegion({ container }) {
    const logger = container.resolve("logger");
    const regionService = container.resolve(utils_1.Modules.REGION);
    const storeService = container.resolve(utils_1.Modules.STORE);
    logger.info("🇰🇼 Setting up Kuwait region with KWD currency...");
    try {
        // Check for existing Kuwait region
        const existingRegions = await regionService.listRegions({});
        const kuwaitRegion = existingRegions.find(r => r.currency_code === "kwd" ||
            r.name?.toLowerCase().includes("kuwait"));
        if (kuwaitRegion) {
            logger.info(`Kuwait region already exists: ${kuwaitRegion.name} (${kuwaitRegion.id})`);
            return;
        }
        // Create Kuwait region
        logger.info("Creating Kuwait region...");
        const [region] = await regionService.createRegions([{
                name: "Kuwait",
                currency_code: "kwd",
                countries: ["kw"],
            }]);
        logger.info(`✅ Kuwait region created: ${region.id}`);
        logger.info(`   Name: ${region.name}`);
        logger.info(`   Currency: ${region.currency_code.toUpperCase()}`);
        // Update store default region (optional)
        try {
            const stores = await storeService.listStores({});
            if (stores.length > 0) {
                await storeService.updateStores(stores[0].id, {
                    default_region_id: region.id,
                });
                logger.info(`✅ Set ${region.name} as default store region`);
            }
        }
        catch (storeError) {
            logger.warn(`Could not update default store region: ${storeError.message}`);
        }
        logger.info("=".repeat(50));
        logger.info("🇰🇼 Kuwait region setup complete!");
        logger.info("   Currency: KWD (Kuwaiti Dinar)");
        logger.info("   Country: Kuwait (KW)");
        logger.info("=".repeat(50));
    }
    catch (error) {
        logger.error(`Failed to setup Kuwait region: ${error.message}`);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAta3V3YWl0LXJlZ2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3NldHVwLWt1d2FpdC1yZWdpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7O0FBS0gsb0NBdURDO0FBekRELHFEQUE4RTtBQUUvRCxLQUFLLFVBQVUsaUJBQWlCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDckUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQyxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN2RCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVyRCxNQUFNLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLENBQUE7SUFFakUsSUFBSSxDQUFDO1FBQ0gsbUNBQW1DO1FBQ25DLE1BQU0sZUFBZSxHQUFHLE1BQU0sYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUMzRCxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQzVDLENBQUMsQ0FBQyxhQUFhLEtBQUssS0FBSztZQUN6QixDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FDekMsQ0FBQTtRQUVELElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsWUFBWSxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUN0RixPQUFNO1FBQ1IsQ0FBQztRQUVELHVCQUF1QjtRQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUE7UUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxhQUFhLEVBQUUsS0FBSztnQkFDcEIsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDO2FBQ2xCLENBQUMsQ0FBQyxDQUFBO1FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDcEQsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRWpFLHlDQUF5QztRQUN6QyxJQUFJLENBQUM7WUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDaEQsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN0QixNQUFNLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDNUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLEVBQUU7aUJBQzdCLENBQUMsQ0FBQTtnQkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsTUFBTSxDQUFDLElBQUksMEJBQTBCLENBQUMsQ0FBQTtZQUM3RCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sVUFBZSxFQUFFLENBQUM7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQywwQ0FBMEMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDN0UsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtRQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUE7UUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTdCLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQy9ELE1BQU0sS0FBSyxDQUFBO0lBQ2IsQ0FBQztBQUNILENBQUMifQ==