"use strict";
/**
 * Fix Variants - Ensure all products have variants and are linked to sales channel
 *
 * Some products may have been created without variants or without proper sales channel links.
 * This script ensures every product has at least one variant and is properly linked.
 *
 * Usage: npx medusa exec ./src/scripts/fix-variants-sales-channel.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixVariants;
const utils_1 = require("@medusajs/framework/utils");
async function fixVariants({ container }) {
    const logger = container.resolve("logger");
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_LINK);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    logger.info("🔧 Fixing products without variants and sales channel links...");
    try {
        // Get all products with variants
        const products = await productService.listProducts({}, {
            relations: ["variants", "options"],
            take: 1000,
        });
        logger.info(`Found ${products.length} products to check`);
        // Get default sales channel
        const salesChannels = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" });
        let defaultChannel = salesChannels[0];
        if (!defaultChannel) {
            // Try to get first available sales channel
            const allChannels = await salesChannelService.listSalesChannels({});
            defaultChannel = allChannels[0];
        }
        if (!defaultChannel) {
            logger.error("No sales channel found!");
            return;
        }
        logger.info(`Using sales channel: ${defaultChannel.name} (${defaultChannel.id})`);
        let fixedVariants = 0;
        let linkedProducts = 0;
        let skippedProducts = 0;
        let errors = 0;
        for (const product of products) {
            try {
                // Check if product has variants
                const hasVariants = product.variants && product.variants.length > 0;
                if (!hasVariants) {
                    // Create a default variant for this product
                    logger.info(`Creating variant for product: ${product.title}`);
                    // First ensure product has an option
                    const options = product.options || [];
                    if (options.length === 0) {
                        // Add default option to product
                        await productService.updateProducts(product.id, {
                            options: [
                                {
                                    title: "Default",
                                    values: ["Default"]
                                }
                            ]
                        });
                    }
                    // Now create the variant
                    const variant = await productService.createProductVariants({
                        product_id: product.id,
                        title: "Default",
                        sku: `${product.handle}-default`,
                        manage_inventory: false,
                        options: {
                            "Default": "Default"
                        }
                    });
                    fixedVariants++;
                    logger.info(`  ✅ Created variant for ${product.title}`);
                }
                // Check if product is linked to sales channel
                const { data: existingLinks } = await query.graph({
                    entity: "product_sales_channel",
                    fields: ["product_id", "sales_channel_id"],
                    filters: {
                        product_id: product.id,
                        sales_channel_id: defaultChannel.id
                    },
                });
                if (!existingLinks || existingLinks.length === 0) {
                    // Link product to sales channel
                    await remoteLink.create({
                        productService: {
                            product_id: product.id,
                        },
                        salesChannelService: {
                            sales_channel_id: defaultChannel.id,
                        },
                    });
                    linkedProducts++;
                    logger.info(`  📎 Linked ${product.title} to sales channel`);
                }
                else {
                    skippedProducts++;
                }
            }
            catch (error) {
                errors++;
                logger.error(`Error processing ${product.title}: ${error.message}`);
            }
        }
        logger.info("==================================================");
        logger.info("📊 Fix Summary:");
        logger.info(`   ✅ Variants created: ${fixedVariants}`);
        logger.info(`   📎 Products linked: ${linkedProducts}`);
        logger.info(`   ⏭️  Already OK: ${skippedProducts}`);
        logger.info(`   ❌ Errors: ${errors}`);
        logger.info("==================================================");
    }
    catch (error) {
        logger.error(`Failed to fix variants: ${error.message}`);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LXZhcmlhbnRzLXNhbGVzLWNoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9maXgtdmFyaWFudHMtc2FsZXMtY2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7R0FPRzs7QUFLSCw4QkEySEM7QUE3SEQscURBQThFO0FBRS9ELEtBQUssVUFBVSxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDL0QsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQyxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN6RCxNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ3BFLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDM0UsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVoRSxNQUFNLENBQUMsSUFBSSxDQUFDLGdFQUFnRSxDQUFDLENBQUE7SUFFN0UsSUFBSSxDQUFDO1FBQ0gsaUNBQWlDO1FBQ2pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FDaEQsRUFBRSxFQUNGO1lBQ0UsU0FBUyxFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQztZQUNsQyxJQUFJLEVBQUUsSUFBSTtTQUNYLENBQ0YsQ0FBQTtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxRQUFRLENBQUMsTUFBTSxvQkFBb0IsQ0FBQyxDQUFBO1FBRXpELDRCQUE0QjtRQUM1QixNQUFNLGFBQWEsR0FBRyxNQUFNLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLEVB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