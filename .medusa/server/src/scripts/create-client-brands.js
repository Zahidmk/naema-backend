"use strict";
/**
 * Create Client Recommended Brands
 * Adds the 6 brands recommended by client: Powerology, Samsung, Apple, Marshall, Porodo, Harman Kardon
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createClientBrands;
const CLIENT_BRANDS = [
    {
        name: "Powerology",
        slug: "powerology",
        description: "Premium tech accessories and power solutions",
        logo_url: "https://www.powerology.com/media/logo/stores/1/logo.png",
        is_active: true,
        display_order: 1
    },
    {
        name: "Samsung",
        slug: "samsung",
        description: "World-leading technology and electronics",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png",
        is_active: true,
        display_order: 2
    },
    {
        name: "Apple",
        slug: "apple",
        description: "Think Different - Premium consumer electronics",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png",
        is_active: true,
        display_order: 3
    },
    {
        name: "Marshall",
        slug: "marshall",
        description: "Legendary audio equipment and speakers",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Marshall_Amplification_logo.svg/2560px-Marshall_Amplification_logo.svg.png",
        is_active: true,
        display_order: 4
    },
    {
        name: "Porodo",
        slug: "porodo",
        description: "Smart lifestyle accessories",
        logo_url: "https://porodo.net/wp-content/uploads/2021/03/porodo-logo.png",
        is_active: true,
        display_order: 5
    },
    {
        name: "Harman Kardon",
        slug: "harman-kardon",
        description: "Premium audio and connected technologies",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Harman_Kardon_logo.svg/2560px-Harman_Kardon_logo.svg.png",
        is_active: true,
        display_order: 6
    }
];
async function createClientBrands({ container }) {
    const logger = container.resolve("logger");
    const brandModuleService = container.resolve("brands");
    logger.info("🏷️ Creating client recommended brands...");
    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const brandData of CLIENT_BRANDS) {
        try {
            // Check if brand exists by slug
            const existing = await brandModuleService.listBrands({
                slug: brandData.slug
            });
            if (existing && existing.length > 0) {
                // Update existing brand with new logo
                await brandModuleService.updateBrands(existing[0].id, {
                    logo_url: brandData.logo_url,
                    description: brandData.description,
                    is_active: true,
                    display_order: brandData.display_order
                });
                logger.info(`✅ Updated: ${brandData.name}`);
                updated++;
            }
            else {
                // Create new brand
                await brandModuleService.createBrands(brandData);
                logger.info(`✅ Created: ${brandData.name}`);
                created++;
            }
        }
        catch (error) {
            logger.warn(`⚠️ Error with ${brandData.name}: ${error.message}`);
            skipped++;
        }
    }
    logger.info(`\n📊 Summary:`);
    logger.info(`   Created: ${created}`);
    logger.info(`   Updated: ${updated}`);
    logger.info(`   Skipped: ${skipped}`);
    logger.info(`\n🏷️ Client brands setup complete!`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWNsaWVudC1icmFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jcmVhdGUtY2xpZW50LWJyYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOztBQXVESCxxQ0E0Q0M7QUEvRkQsTUFBTSxhQUFhLEdBQUc7SUFDcEI7UUFDRSxJQUFJLEVBQUUsWUFBWTtRQUNsQixJQUFJLEVBQUUsWUFBWTtRQUNsQixXQUFXLEVBQUUsOENBQThDO1FBQzNELFFBQVEsRUFBRSx5REFBeUQ7UUFDbkUsU0FBUyxFQUFFLElBQUk7UUFDZixhQUFhLEVBQUUsQ0FBQztLQUNqQjtJQUNEO1FBQ0UsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLFdBQVcsRUFBRSwwQ0FBMEM7UUFDdkQsUUFBUSxFQUFFLHdHQUF3RztRQUNsSCxTQUFTLEVBQUUsSUFBSTtRQUNmLGFBQWEsRUFBRSxDQUFDO0tBQ2pCO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsT0FBTztRQUNiLElBQUksRUFBRSxPQUFPO1FBQ2IsV0FBVyxFQUFFLGdEQUFnRDtRQUM3RCxRQUFRLEVBQUUsK0dBQStHO1FBQ3pILFNBQVMsRUFBRSxJQUFJO1FBQ2YsYUFBYSxFQUFFLENBQUM7S0FDakI7SUFDRDtRQUNFLElBQUksRUFBRSxVQUFVO1FBQ2hCLElBQUksRUFBRSxVQUFVO1FBQ2hCLFdBQVcsRUFBRSx3Q0FBd0M7UUFDckQsUUFBUSxFQUFFLHNJQUFzSTtRQUNoSixTQUFTLEVBQUUsSUFBSTtRQUNmLGFBQWEsRUFBRSxDQUFDO0tBQ2pCO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLDZCQUE2QjtRQUMxQyxRQUFRLEVBQUUsK0RBQStEO1FBQ3pFLFNBQVMsRUFBRSxJQUFJO1FBQ2YsYUFBYSxFQUFFLENBQUM7S0FDakI7SUFDRDtRQUNFLElBQUks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