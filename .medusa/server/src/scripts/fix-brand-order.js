"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixBrandOrder;
async function fixBrandOrder({ container }) {
    const logger = container.resolve("logger");
    const brandsModuleService = container.resolve("brands");
    // List all brands
    const allBrands = await brandsModuleService.listBrands({});
    logger.info("📦 Current brands:");
    allBrands.forEach((b) => {
        logger.info(`  - ${b.name} (slug: ${b.slug}, order: ${b.display_order}, active: ${b.is_active})`);
    });
    // Set high display_order for unwanted brands (or deactivate them)
    const unwantedSlugs = ['ssss', 'sony', 'xiaomi'];
    for (const slug of unwantedSlugs) {
        const brand = allBrands.find((b) => b.slug === slug);
        if (brand && brand.id) {
            await brandsModuleService.updateBrands({
                id: brand.id,
                display_order: 99, // Put at the end
                is_active: false // Or deactivate
            });
            logger.info(`✅ Deactivated and moved to end: ${brand.name}`);
        }
    }
    // Make sure client brands have correct order and are active
    const clientBrands = [
        { slug: 'powerology', order: 1 },
        { slug: 'samsung', order: 2 },
        { slug: 'apple', order: 3 },
        { slug: 'marshall', order: 4 },
        { slug: 'porodo', order: 5 },
        { slug: 'harman-kardon', order: 6 }
    ];
    for (const cb of clientBrands) {
        const brand = allBrands.find((b) => b.slug === cb.slug);
        if (brand && brand.id) {
            await brandsModuleService.updateBrands({
                id: brand.id,
                display_order: cb.order,
                is_active: true
            });
            logger.info(`✅ Updated ${brand.name}: order=${cb.order}, active=true`);
        }
    }
    // Show final result
    const finalBrands = await brandsModuleService.listBrands({});
    const sorted = finalBrands
        .filter((b) => b.is_active)
        .sort((a, b) => (a.display_order || 99) - (b.display_order || 99))
        .slice(0, 6);
    logger.info("\n📦 Top 6 ACTIVE brands by display_order:");
    sorted.forEach((b, i) => {
        logger.info(`  ${i + 1}. ${b.name} (order: ${b.display_order})`);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LWJyYW5kLW9yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZml4LWJyYW5kLW9yZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsZ0NBNERDO0FBNURjLEtBQUssVUFBVSxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDakUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQyxNQUFNLG1CQUFtQixHQUFRLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFN0Qsa0JBQWtCO0lBQ2xCLE1BQU0sU0FBUyxHQUFHLE1BQU0sbUJBQW1CLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTNELE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNsQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsYUFBYSxhQUFhLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ3BHLENBQUMsQ0FBQyxDQUFDO0lBRUgsa0VBQWtFO0lBQ2xFLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUVqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sbUJBQW1CLENBQUMsWUFB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