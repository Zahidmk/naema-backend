"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = publishProducts;
const utils_1 = require("@medusajs/framework/utils");
async function publishProducts({ container }) {
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const salesChannelModuleService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const remoteLink = container.resolve("remoteLink");
    console.log("🔍 Finding all products and sales channel...");
    // Get all products
    const products = await productModuleService.listProducts({}, {
        relations: ["variants"]
    });
    console.log(`Found ${products.length} products`);
    // Get default sales channel
    const salesChannels = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel"
    });
    if (!salesChannels.length) {
        console.error("❌ No default sales channel found!");
        return;
    }
    const defaultChannel = salesChannels[0];
    console.log(`✅ Found sales channel: ${defaultChannel.name} (${defaultChannel.id})`);
    // Process each product
    for (const product of products) {
        console.log(`\n📦 ${product.title} (${product.id})`);
        console.log(`   Status: ${product.status}`);
        console.log(`   Variants: ${product.variants?.length || 0}`);
        // Add to sales channel
        try {
            console.log(`   ⚠️  Linking to sales channel...`);
            await remoteLink.create([{
                    [utils_1.Modules.PRODUCT]: {
                        product_id: product.id,
                    },
                    [utils_1.Modules.SALES_CHANNEL]: {
                        sales_channel_id: defaultChannel.id,
                    },
                }]);
            console.log(`   ✅ Linked to sales channel!`);
        }
        catch (error) {
            // Might already be linked
            console.log(`   ℹ️  Link might already exist`);
        }
        // Update to published if draft
        if (product.status !== "published") {
            console.log(`   ⚠️  Publishing product...`);
            await productModuleService.updateProducts(product.id, {
                status: "published"
            });
            console.log(`   ✅ Now published!`);
        }
        else {
            console.log(`   ✅ Already published`);
        }
    }
    console.log("\n✅ All products processed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC1wcm9kdWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3B1Ymxpc2gtcHJvZHVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxrQ0FpRUM7QUFwRUQscURBQW1EO0FBR3BDLEtBQUssVUFBVSxlQUFlLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDbkUsTUFBTSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUMvRCxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzFFLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7SUFFbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFBO0lBRTNELG1CQUFtQjtJQUNuQixNQUFNLFFBQVEsR0FBRyxNQUFNLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUU7UUFDM0QsU0FBUyxFQUFFLENBQUMsVUFBVSxDQUFDO0tBQ3hCLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxRQUFRLENBQUMsTUFBTSxXQUFXLENBQUMsQ0FBQTtJQUVoRCw0QkFBNEI7SUFDNUIsTUFBTSxhQUFhLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxpQkFBaUIsQ0FBQztRQUN0RSxJQUFJLEVBQUUsdUJBQXVCO0tBQzlCLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO1FBQ2xELE9BQU07SUFDUixDQUFDO0lBRUQsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLGNBQWMsQ0FBQyxJQUFJLEtBQUssY0FBYyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFFbkYsdUJBQXVCO0lBQ3ZCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLE9BQU8sQ0FBQyxLQUFLLEtBQUssT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFNUQsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQztZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtZQUVqRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdkIsQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ2pCLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtxQkFDdkI7b0JBQ0QsQ0FBQyxlQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7d0JBQ3ZCLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxFQUFFO3FCQUNwQztpQkFDRixDQUFDLENBQUMsQ0FBQTtZQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQTtRQUM5QyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLDBCQUEwQjtZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7UUFDaEQsQ0FBQztRQUVELCtCQUErQjtRQUMvQixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1lBQzNDLE1BQU0sb0JBQW9CLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BELE1BQU0sRUFBRSxXQUFXO2FBQ3BCLENBQUMsQ0FBQTtZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQTtRQUNwQyxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtRQUN2QyxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtBQUM1QyxDQUFDIn0=