"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateBrandLogos;
const brands_1 = require("../modules/brands");
// Update brands using WorldVectorLogo CDN - high quality PNG logos
const BRAND_LOGO_UPDATES = {
    "apple": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png",
    "samsung": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png",
    "sony": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/200px-Sony_logo.svg.png",
    "xiaomi": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/200px-Xiaomi_logo_%282021-%29.svg.png",
    "jbl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/JBL_logo.svg/200px-JBL_logo.svg.png",
    "bose": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bose_logo.svg/200px-Bose_logo.svg.png",
    "anker": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Anker_logo.svg/200px-Anker_logo.svg.png",
    "logitech": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Logitech_logo.svg/200px-Logitech_logo.svg.png",
    "ssss": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png",
};
async function updateBrandLogos({ container }) {
    console.log("🔄 Updating Brand Logos to Local Images...");
    console.log("=".repeat(50));
    try {
        const brandService = container.resolve(brands_1.BRAND_MODULE);
        // Get all brands
        const brands = await brandService.listBrands();
        console.log(`\n📦 Found ${brands.length} brands to update`);
        for (const brand of brands) {
            const slug = brand.slug?.toLowerCase() || brand.name?.toLowerCase().replace(/\s+/g, '-');
            const newLogoUrl = BRAND_LOGO_UPDATES[slug];
            if (newLogoUrl) {
                await brandService.updateBrands({
                    id: brand.id,
                    logo_url: newLogoUrl
                });
                console.log(`  ✓ Updated ${brand.name}: ${newLogoUrl}`);
            }
            else {
                // Assign a default logo if not in our map
                await brandService.updateBrands({
                    id: brand.id,
                    logo_url: "/brands/apple.svg"
                });
                console.log(`  ✓ Updated ${brand.name} with default logo`);
            }
        }
        console.log("\n" + "=".repeat(50));
        console.log("✅ Brand Logos Updated Successfully!");
        console.log("\n🌐 Refresh your frontend at localhost:3000 to see the changes!");
    }
    catch (error) {
        console.error("❌ Error updating brand logos:", error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWJyYW5kLWxvZ29zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdXBkYXRlLWJyYW5kLWxvZ29zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBZ0JBLG1DQXdDQztBQXZERCw4Q0FBZ0Q7QUFFaEQsbUVBQW1FO0FBQ25FLE1BQU0sa0JBQWtCLEdBQTJCO0lBQ2pELE9BQU8sRUFBRSwrR0FBK0c7SUFDeEgsU0FBUyxFQUFFLHVHQUF1RztJQUNsSCxNQUFNLEVBQUUsaUdBQWlHO0lBQ3pHLFFBQVEsRUFBRSw2SEFBNkg7SUFDdkksS0FBSyxFQUFFLCtGQUErRjtJQUN0RyxNQUFNLEVBQUUsaUdBQWlHO0lBQ3pHLE9BQU8sRUFBRSxtR0FBbUc7SUFDNUcsVUFBVSxFQUFFLHlHQUF5RztJQUNySCxNQUFNLEVBQUUsK0dBQStHO0NBQ3hILENBQUE7QUFFYyxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO0lBQ3pELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTVCLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQVksQ0FBUSxDQUFBO1FBRTNELGlCQUFpQjtRQUNqQixNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUU5QyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLENBQUMsQ0FBQTtRQUUzRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQzNCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ3hGLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLElBQXVDLENBQUMsQ0FBQTtZQUU5RSxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNmLE1BQU0sWUFBWSxDQUFDLFlBQVksQ0FBQztvQkFDOUIsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNaLFFBQVEsRUFBRSxVQUFVO2lCQUNyQixDQUFDLENBQUE7Z0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEtBQUssQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFLENBQUMsQ0FBQTtZQUN6RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sMENBQTBDO2dCQUMxQyxNQUFNLFlBQVksQ0FBQyxZQUFZLENBQUM7b0JBQzlCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDWixRQUFRLEVBQUUsbUJBQW1CO2lCQUM5QixDQUFDLENBQUE7Z0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEtBQUssQ0FBQyxJQUFJLG9CQUFvQixDQUFDLENBQUE7WUFDNUQsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO1FBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0VBQWtFLENBQUMsQ0FBQTtJQUVqRixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDckQsTUFBTSxLQUFLLENBQUE7SUFDYixDQUFDO0FBQ0gsQ0FBQyJ9