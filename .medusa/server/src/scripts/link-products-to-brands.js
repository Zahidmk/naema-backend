"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = linkProductsToBrand;
const utils_1 = require("@medusajs/framework/utils");
const brands_1 = require("../modules/brands");
/**
 * Script to link a subset of products to the first brand.
 * Usage: yarn medusa exec link-products-to-brands.ts
 */
async function linkProductsToBrand({ container }) {
    const brandService = container.resolve(brands_1.BRAND_MODULE);
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    const [brand] = await brandService.listBrands({}, { take: 1 });
    if (!brand) {
        console.log("No brands found; aborting");
        return;
    }
    console.log("Using brand:", brand.name, brand.id);
    const products = await productService.listProducts({}, { take: 5 });
    console.log(`Linking up to ${products.length} products to brand...`);
    for (const p of products) {
        try {
            const link = await brandService.addProductToBrand(brand.id, p.id);
            console.log("Linked", p.title, "→", brand.name, link.id);
        }
        catch (e) {
            console.error("Failed linking", p.id, e?.message || e);
        }
    }
    console.log("Done.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluay1wcm9kdWN0cy10by1icmFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9saW5rLXByb2R1Y3RzLXRvLWJyYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLHNDQXdCQztBQWhDRCxxREFBbUQ7QUFDbkQsOENBQWdEO0FBR2hEOzs7R0FHRztBQUNZLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUN2RSxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQVEsQ0FBQTtJQUMzRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUV6RCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzlELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtRQUN4QyxPQUFNO0lBQ1IsQ0FBQztJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRWpELE1BQU0sUUFBUSxHQUFHLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNuRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixRQUFRLENBQUMsTUFBTSx1QkFBdUIsQ0FBQyxDQUFBO0lBRXBFLEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDMUQsQ0FBQztRQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7WUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDeEQsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3RCLENBQUMifQ==