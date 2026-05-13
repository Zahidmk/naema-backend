"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixBrandLogos;
const brands_1 = require("../modules/brands");
async function fixBrandLogos({ container }) {
    const brandService = container.resolve(brands_1.BRAND_MODULE);
    // Working logo URLs - using logo.clearbit.com which provides clean brand logos
    const logoMap = {
        "apple": "https://logo.clearbit.com/apple.com",
        "samsung": "https://logo.clearbit.com/samsung.com",
        "sony": "https://logo.clearbit.com/sony.com",
        "jbl": "https://logo.clearbit.com/jbl.com",
        "bose": "https://logo.clearbit.com/bose.com",
        "anker": "https://logo.clearbit.com/anker.com",
        "logitech": "https://logo.clearbit.com/logitech.com",
        "xiaomi": "https://logo.clearbit.com/mi.com",
    };
    // Get all brands
    const brands = await brandService.listBrands({}, { take: 100 });
    console.log(`Found ${brands.length} brands:\n`);
    for (const brand of brands) {
        const brandId = brand.id;
        const slug = brand.slug?.toLowerCase() || brand.name?.toLowerCase().replace(/\s+/g, '-');
        const newLogo = logoMap[slug];
        console.log(`- ${brand.name} (id: ${brandId}, slug: ${slug})`);
        console.log(`  Current: ${brand.logo_url}`);
        if (newLogo && brandId) {
            try {
                await brandService.updateBrands({ id: brandId }, { logo_url: newLogo });
                console.log(`  ✓ Updated to: ${newLogo}`);
            }
            catch (e) {
                console.error(`  ✗ Failed: ${e?.message || e}`);
            }
        }
        else if (!newLogo) {
            console.log(`  ⚠ No logo mapping for: ${slug}`);
        }
        console.log("");
    }
    console.log("Done!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LWJyYW5kLWxvZ29zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZml4LWJyYW5kLWxvZ29zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsZ0NBMENDO0FBNUNELDhDQUFnRDtBQUVqQyxLQUFLLFVBQVUsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFzQjtJQUMzRSxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQUMsQ0FBQTtJQUVwRCwrRUFBK0U7SUFDL0UsTUFBTSxPQUFPLEdBQTJCO1FBQ3RDLE9BQU8sRUFBRSxxQ0FBcUM7UUFDOUMsU0FBUyxFQUFFLHVDQUF1QztRQUNsRCxNQUFNLEVBQUUsb0NBQW9DO1FBQzVDLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsTUFBTSxFQUFFLG9DQUFvQztRQUM1QyxPQUFPLEVBQUUscUNBQXFDO1FBQzlDLFVBQVUsRUFBRSx3Q0FBd0M7UUFDcEQsUUFBUSxFQUFFLGtDQUFrQztLQUM3QyxDQUFBO0lBRUQsaUJBQWlCO0lBQ2pCLE1BQU0sTUFBTSxHQUFHLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUUvRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsTUFBTSxDQUFDLE1BQU0sWUFBWSxDQUFDLENBQUE7SUFFL0MsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFBO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3hGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUU3QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksU0FBUyxPQUFPLFdBQVcsSUFBSSxHQUFHLENBQUMsQ0FBQTtRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFFM0MsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDO2dCQUNILE1BQU0sWUFBWSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUN2RSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixPQUFPLEVBQUUsQ0FBQyxDQUFBO1lBQzNDLENBQUM7WUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO2dCQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ2pELENBQUM7UUFDSCxDQUFDO2FBQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLElBQUksRUFBRSxDQUFDLENBQUE7UUFDakQsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDdEIsQ0FBQyJ9