"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedBestInPowerbanks;
const utils_1 = require("@medusajs/framework/utils");
/**
 * Script to add products to the "Best in Power Banks" collection
 * Run with: npx medusa exec src/scripts/seed-best-in-powerbanks.ts
 */
async function seedBestInPowerbanks({ container }) {
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    // Best in Power Banks collection ID
    const POWERBANKS_COLLECTION_ID = "pcol_01KD30MPNBJA9Y94TPFDR9TXBM";
    // Product IDs to add to the Power Banks collection
    // Using some of the valid products
    const productIds = [
        "prod_01KAARY0K50J8DGR8W7BYPASJ8", // Medusa Sweatpants
        "prod_01KAARY0K5MWH3PEK5MQYCWC54", // Medusa Shorts
        "prod_01KAATY408F97TC9FAZ5BG34KA", // Shakir
    ];
    console.log("Adding products to Best in Power Banks collection...");
    for (const productId of productIds) {
        try {
            await productService.updateProducts(productId, {
                collection_id: POWERBANKS_COLLECTION_ID,
            });
            console.log(`✓ Added ${productId} to Power Banks collection`);
        }
        catch (error) {
            console.error(`✗ Failed to add ${productId}:`, error.message);
        }
    }
    console.log("\nDone! Products added to Best in Power Banks collection.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1iZXN0LWluLXBvd2VyYmFua3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9zZWVkLWJlc3QtaW4tcG93ZXJiYW5rcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLHVDQTRCQztBQWxDRCxxREFBbUQ7QUFFbkQ7OztHQUdHO0FBQ1ksS0FBSyxVQUFVLG9CQUFvQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3hFLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBRXpELG9DQUFvQztJQUNwQyxNQUFNLHdCQUF3QixHQUFHLGlDQUFpQyxDQUFBO0lBRWxFLG1EQUFtRDtJQUNuRCxtQ0FBbUM7SUFDbkMsTUFBTSxVQUFVLEdBQUc7UUFDakIsaUNBQWlDLEVBQUUsb0JBQW9CO1FBQ3ZELGlDQUFpQyxFQUFFLGdCQUFnQjtRQUNuRCxpQ0FBaUMsRUFBRSxTQUFTO0tBQzdDLENBQUE7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxDQUFDLENBQUE7SUFFbkUsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUM7WUFDSCxNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUM3QyxhQUFhLEVBQUUsd0JBQXdCO2FBQ3hDLENBQUMsQ0FBQTtZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxTQUFTLDRCQUE0QixDQUFDLENBQUE7UUFDL0QsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsU0FBUyxHQUFHLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQy9ELENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFBO0FBQzFFLENBQUMifQ==