"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = linkAppleProducts;
const utils_1 = require("@medusajs/framework/utils");
/**
 * Link products in Apple collection to Apple brand
 */
async function linkAppleProducts({ container }) {
    const logger = container.resolve("logger");
    const brandsModuleService = container.resolve("brands");
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    // Get Apple brand
    const appleBrands = await brandsModuleService.listBrands({ slug: "apple" });
    if (!appleBrands || appleBrands.length === 0) {
        logger.error("Apple brand not found!");
        return;
    }
    const appleBrand = appleBrands[0];
    logger.info(`Found Apple brand: ${appleBrand.id}`);
    // Get all products that have "Apple" collection or have Apple-related titles
    const allProducts = await productModuleService.listProducts({}, { take: 200 });
    const appleProducts = allProducts.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const collectionTitle = (p.collection?.title || "").toLowerCase();
        // Products in Apple collection
        if (collectionTitle === "apple")
            return true;
        // Products with Apple product names
        if (title.includes("iphone") || title.includes("ipad") || title.includes("airpods") || title.includes("macbook") || title.includes("apple watch"))
            return true;
        return false;
    });
    logger.info(`Found ${appleProducts.length} Apple products to link`);
    let linked = 0;
    for (const product of appleProducts) {
        try {
            await brandsModuleService.addProductToBrand(appleBrand.id, product.id);
            logger.info(`✅ Linked: ${product.title}`);
            linked++;
        }
        catch (e) {
            // Already linked or error
            if (!e.message?.includes("already")) {
                logger.warn(`⚠️ Error linking ${product.title}: ${e.message}`);
            }
        }
    }
    logger.info(`\n📊 Linked ${linked} products to Apple brand`);
    // Verify
    const linkedProductIds = await brandsModuleService.listBrandProducts(appleBrand.id);
    logger.info(`Apple brand now has ${linkedProductIds.length} products linked`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluay1hcHBsZS1wcm9kdWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2xpbmstYXBwbGUtcHJvZHVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSxvQ0FxREM7QUExREQscURBQW1EO0FBRW5EOztHQUVHO0FBQ1ksS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3JFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUMsTUFBTSxtQkFBbUIsR0FBUSxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzVELE1BQU0sb0JBQW9CLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFFL0Qsa0JBQWtCO0lBQ2xCLE1BQU0sV0FBVyxHQUFHLE1BQU0sbUJBQW1CLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFFM0UsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtRQUN0QyxPQUFNO0lBQ1IsQ0FBQztJQUVELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVsRCw2RUFBNkU7SUFDN0UsTUFBTSxXQUFXLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFFOUUsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFO1FBQ2xELE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUMzQyxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBRWpFLCtCQUErQjtRQUMvQixJQUFJLGVBQWUsS0FBSyxPQUFPO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFFNUMsb0NBQW9DO1FBQ3BDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFBO1FBRTlKLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQyxDQUFDLENBQUE7SUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsYUFBYSxDQUFDLE1BQU0seUJBQXlCLENBQUMsQ0FBQTtJQUVuRSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFDZCxLQUFLLE1BQU0sT0FBTyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQztZQUNILE1BQU0sbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDdEUsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sRUFBRSxDQUFBO1FBQ1YsQ0FBQztRQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7WUFDaEIsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1lBQ2hFLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxNQUFNLDBCQUEwQixDQUFDLENBQUE7SUFFNUQsU0FBUztJQUNULE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsZ0JBQWdCLENBQUMsTUFBTSxrQkFBa0IsQ0FBQyxDQUFBO0FBQy9FLENBQUMifQ==