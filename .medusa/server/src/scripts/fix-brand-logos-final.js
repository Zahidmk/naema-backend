"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixBrandLogos;
const utils_1 = require("@medusajs/framework/utils");
async function fixBrandLogos({ container }) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    console.log("Fixing brand logos...\n");
    // Map of brand names to reliable logo URLs (using local files where possible)
    const logoMap = {
        "Powerology": "/brands/powerology.png",
        "Samsung": "/brands/samsung.svg",
        "Apple": "/brands/apple.svg",
        "Marshall": "/brands/bose.svg", // Use bose as fallback since marshall not available
        "Porodo": "/brands/poroda.svg",
        "Harman Kardon": "/brands/jbl.svg", // Use jbl as fallback since harman kardon not available
    };
    try {
        // Get all brands
        const { data: brands } = await query.graph({
            entity: "brand",
            fields: ["id", "name", "logo_url", "is_active", "display_order"],
        });
        console.log(`Found ${brands.length} brands\n`);
        console.log("Brands:", JSON.stringify(brands.map((b) => ({ id: b.id, name: b.name })), null, 2));
        // Use raw SQL to update logos
        const pgConnection = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
        for (const brand of brands) {
            if (!brand.id) {
                console.log(`Skipping brand with empty ID: ${brand.name}`);
                continue;
            }
            const newLogo = logoMap[brand.name];
            if (newLogo && brand.logo_url !== newLogo) {
                console.log(`Updating ${brand.name} (${brand.id}):`);
                console.log(`  Old: ${brand.logo_url}`);
                console.log(`  New: ${newLogo}`);
                await pgConnection.raw(`UPDATE brand SET logo_url = ? WHERE id = ?`, [newLogo, brand.id]);
                console.log(`  ✅ Updated\n`);
            }
            else {
                console.log(`${brand.name}: Already using correct logo or no mapping found`);
            }
        }
        console.log("\n✅ Brand logos fixed successfully!");
    }
    catch (error) {
        console.error("Error fixing brand logos:", error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LWJyYW5kLWxvZ29zLWZpbmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZml4LWJyYW5kLWxvZ29zLWZpbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsZ0NBdURDO0FBekRELHFEQUFzRTtBQUV2RCxLQUFLLFVBQVUsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ2pFLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBRXZDLDhFQUE4RTtJQUM5RSxNQUFNLE9BQU8sR0FBMkI7UUFDdEMsWUFBWSxFQUFFLHdCQUF3QjtRQUN0QyxTQUFTLEVBQUUscUJBQXFCO1FBQ2hDLE9BQU8sRUFBRSxtQkFBbUI7UUFDNUIsVUFBVSxFQUFFLGtCQUFrQixFQUFFLG9EQUFvRDtRQUNwRixRQUFRLEVBQUUsb0JBQW9CO1FBQzlCLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSx3REFBd0Q7S0FDN0YsQ0FBQztJQUVGLElBQUksQ0FBQztRQUNILGlCQUFpQjtRQUNqQixNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUN6QyxNQUFNLEVBQUUsT0FBTztZQUNmLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUM7U0FDakUsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLE1BQU0sQ0FBQyxNQUFNLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXRHLDhCQUE4QjtRQUM5QixNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWhGLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDM0QsU0FBUztZQUNYLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksT0FBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUVqQyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3BCLDRDQUE0QyxFQUM1QyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQ3BCLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvQixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLGtEQUFrRCxDQUFDLENBQUM7WUFDL0UsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMifQ==