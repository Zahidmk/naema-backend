"use strict";
/**
 * Sync Odoo Prices to Medusa Pricing Module
 *
 * This script reads odoo_price from variant metadata and creates
 * proper Medusa price records so products can be added to cart.
 *
 * Usage: npx medusa exec ./src/scripts/sync-odoo-prices.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncOdooPrices;
const utils_1 = require("@medusajs/framework/utils");
async function syncOdooPrices({ container }) {
    const logger = container.resolve("logger");
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    const regionService = container.resolve(utils_1.Modules.REGION);
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_LINK);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    logger.info("🔄 Starting Odoo price sync to Medusa pricing module...");
    try {
        // Get or create default region for Kuwait
        let regions = await regionService.listRegions({});
        let region = regions.find(r => r.currency_code === "kwd") || regions[0];
        if (!region) {
            logger.info("Creating Kuwait region...");
            const [createdRegion] = await regionService.createRegions([{
                    name: "Kuwait",
                    currency_code: "kwd",
                    countries: ["kw"],
                }]);
            region = createdRegion;
        }
        logger.info(`Using region: ${region.name} (${region.currency_code.toUpperCase()})`);
        // Get all products with variants
        const products = await productService.listProducts({}, {
            relations: ["variants"],
            take: 1000,
        });
        logger.info(`Found ${products.length} products to process`);
        let successCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        for (const product of products) {
            for (const variant of product.variants || []) {
                try {
                    // Get price from metadata
                    const metadata = variant.metadata || {};
                    let odooPrice = metadata.odoo_price;
                    // If no odoo_price, set a default price of 10 KWD for soft launch
                    if (!odooPrice && odooPrice !== 0) {
                        odooPrice = 10.000; // Default 10 KWD
                        logger.warn(`No odoo_price for variant ${variant.id} (${variant.sku || 'no-sku'}), using default 10 KWD`);
                    }
                    // Convert price to smallest unit (fils for KWD - 1 KWD = 1000 fils)
                    // KWD uses 3 decimal places unlike most currencies that use 2
                    const priceAmount = Math.round(parseFloat(odooPrice) * 1000);
                    // Check if variant already has a price set linked
                    const { data: existingLinks } = await query.graph({
                        entity: "product_variant",
                        fields: ["id", "price_set.*"],
                        filters: { id: variant.id },
                    });
                    if (existingLinks?.[0]?.price_set) {
                        // Price set already linked, add/update price
                        const priceSetId = existingLinks[0].price_set.id;
                        logger.info(`Variant ${variant.sku} already has price set ${priceSetId}, updating...`);
                        // Add new price (will be added if currency doesn't exist)
                        try {
                            await pricingService.addPrices([{
                                    priceSetId: priceSetId,
                                    prices: [{
                                            amount: priceAmount,
                                            currency_code: region.currency_code,
                                        }]
                                }]);
                            logger.info(`Updated price for ${variant.sku}: ${odooPrice} ${region.currency_code}`);
                        }
                        catch (addError) {
                            // Price might already exist, that's okay
                            logger.warn(`Could not add price for ${variant.sku}: ${addError.message}`);
                        }
                    }
                    else {
                        // Create new price set with price
                        const [newPriceSet] = await pricingService.createPriceSets([{
                                prices: [{
                                        amount: priceAmount,
                                        currency_code: region.currency_code,
                                    }]
                            }]);
                        // Link price set to variant using remote link
                        await remoteLink.create({
                            [utils_1.Modules.PRODUCT]: {
                                variant_id: variant.id,
                            },
                            [utils_1.Modules.PRICING]: {
                                price_set_id: newPriceSet.id,
                            },
                        });
                        logger.info(`Created price set for ${variant.sku}: ${odooPrice} ${region.currency_code}`);
                    }
                    successCount++;
                }
                catch (variantError) {
                    logger.error(`Error processing variant ${variant.id}: ${variantError.message}`);
                    errorCount++;
                }
            }
        }
        logger.info("=".repeat(50));
        logger.info("📊 Price Sync Summary:");
        logger.info(`   ✅ Success: ${successCount}`);
        logger.info(`   ⏭️  Skipped (no price): ${skippedCount}`);
        logger.info(`   ❌ Errors: ${errorCount}`);
        logger.info("=".repeat(50));
    }
    catch (error) {
        logger.error(`Failed to sync prices: ${error.message}`);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1vZG9vLXByaWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3N5bmMtb2Rvby1wcmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7O0dBT0c7O0FBS0gsaUNBOEhDO0FBaElELHFEQUE4RTtBQUUvRCxLQUFLLFVBQVUsY0FBYyxDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ2xFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUMsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDekQsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDekQsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDdkQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUMzRSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWhFLE1BQU0sQ0FBQyxJQUFJLENBQUMseURBQXlELENBQUMsQ0FBQTtJQUV0RSxJQUFJLENBQUM7UUFDSCwwQ0FBMEM7UUFDMUMsSUFBSSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2pELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUV2RSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFD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