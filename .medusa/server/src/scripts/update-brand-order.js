"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateBrandOrder;
async function updateBrandOrder({ container }) {
    const logger = container.resolve("logger");
    const brandsModuleService = container.resolve("brands");
    // List all brands
    const allBrands = await brandsModuleService.listBrands({});
    logger.info("📦 All brands in database:");
    allBrands.forEach((b) => {
        logger.info(`  - ${b.name} (slug: ${b.slug}, order: ${b.display_order}, id: ${b.id})`);
    });
    // Find Apple brand
    const appleBrand = allBrands.find((b) => b.slug === "apple" || b.name.toLowerCase() === "apple");
    logger.info(`Apple brand found: ${JSON.stringify(appleBrand)}`);
    if (appleBrand && appleBrand.id) {
        logger.info(`Updating brand with ID: ${appleBrand.id}`);
        await brandsModuleService.updateBrands({
            id: appleBrand.id,
            display_order: 3
        });
        logger.info("✅ Updated Apple display_order to 3");
    }
    else {
        logger.info("❌ Apple brand not found, creating it...");
        await brandsModuleService.createBrands({
            name: "Apple",
            slug: "apple",
            description: "Think Different - Premium consumer electronics",
            logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png",
            is_active: true,
            display_order: 3
        });
        logger.info("✅ Created Apple brand with display_order 3");
    }
    // Show final sorted list
    const finalBrands = await brandsModuleService.listBrands({});
    const sorted = finalBrands
        .filter((b) => b.is_active)
        .sort((a, b) => (a.display_order || 99) - (b.display_order || 99))
        .slice(0, 6);
    logger.info("\n📦 Top 6 brands by display_order:");
    sorted.forEach((b, i) => {
        logger.info(`  ${i + 1}. ${b.name} (order: ${b.display_order})`);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWJyYW5kLW9yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvdXBkYXRlLWJyYW5kLW9yZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsbUNBZ0RDO0FBaERjLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNwRSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFDLE1BQU0sbUJBQW1CLEdBQVEsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU3RCxrQkFBa0I7SUFDbEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFM0QsTUFBTSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTtRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxhQUFhLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDekYsQ0FBQyxDQUFDLENBQUM7SUFFSCxtQkFBbUI7SUFDbkIsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztJQUV0RyxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoRSxJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEQsTUFBTSxtQkFBbUIsQ0FBQyxZQUFZLENBQUM7WUFDckMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ2pCLGFBQWEsRUFBRSxDQUFDO1NBQ2pCLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUNwRCxDQUFDO1NBQU0sQ0FBQztRQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMseUNBQXlDLENBQUMsQ0FBQztRQUN2RCxNQUFNLG1CQUFtQixDQUFDLFlBQVksQ0FBQztZQUNyQyxJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLGdEQUFnRDtZQUM3RCxRQUFRLEVBQUUsK0dBQStHO1lBQ3pILFNBQVMsRUFBRSxJQUFJO1lBQ2YsYUFBYSxFQUFFLENBQUM7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCx5QkFBeUI7SUFDekIsTUFBTSxXQUFXLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0QsTUFBTSxNQUFNLEdBQUcsV0FBVztTQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDL0IsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUMzRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWYsTUFBTSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFNLEVBQUUsQ0FBUyxFQUFFLEVBQUU7UUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUNuRSxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMifQ==