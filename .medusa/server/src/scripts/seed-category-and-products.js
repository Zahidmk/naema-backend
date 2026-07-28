"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedCategoryAndProducts;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
async function seedCategoryAndProducts({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const fulfillmentModuleService = container.resolve(utils_1.Modules.FULFILLMENT);
    const salesChannelModuleService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const stockLocationModuleService = container.resolve(utils_1.Modules.STOCK_LOCATION);
    logger.info("📦 Starting category and product creation script...");
    // 1. Fetch default Sales Channel
    const salesChannels = await salesChannelModuleService.listSalesChannels({});
    if (!salesChannels.length) {
        throw new Error("No sales channels found in database.");
    }
    const defaultSalesChannel = salesChannels[0];
    logger.info(`Sales Channel found: ${defaultSalesChannel.name} (${defaultSalesChannel.id})`);
    // 2. Fetch default Shipping Profile
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({});
    if (!shippingProfiles.length) {
        throw new Error("No shipping profiles found in database.");
    }
    const defaultShippingProfile = shippingProfiles[0];
    logger.info(`Shipping Profile found: ${defaultShippingProfile.name} (${defaultShippingProfile.id})`);
    // 3. Fetch Stock Location
    const stockLocations = await stockLocationModuleService.listStockLocations({});
    const stockLocation = stockLocations.length ? stockLocations[0] : null;
    // 4. Create Product Category "Royal Organic Dates"
    const categoryName = "Royal Organic Dates";
    const categoryHandle = "royal-organic-dates";
    logger.info(`Creating category "${categoryName}"...`);
    const { result: categoryResult } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
        input: {
            product_categories: [
                {
                    name: categoryName,
                    handle: categoryHandle,
                    description: "Handpicked premium organic dates sourced directly from certified artisan groves.",
                    is_active: true,
                    is_internal: false,
                },
            ],
        },
    });
    const createdCategory = categoryResult[0];
    logger.info(`✅ Category created: ${createdCategory.name} (ID: ${createdCategory.id})`);
    // 5. Create Products under this category
    logger.info("Creating products with variants, prices, and images...");
    const productsData = [
        {
            title: "Ajwa Premium Al-Madinah Dates",
            handle: "ajwa-premium-madinah-dates",
            description: "Organic authentic Ajwa dates sourced directly from Madinah Al-Munawwarah. Soft, rich in nutrients, and naturally sweet.",
            category_ids: [createdCategory.id],
            status: utils_1.ProductStatus.PUBLISHED,
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            images: [
                { url: "https://images.unsplash.com/photo-1596504245366-c95107e3ef81?auto=format&fit=crop&q=80&w=800" },
                { url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800" },
            ],
            options: [
                {
                    title: "Package Size",
                    values: ["500g Box", "1kg Premium Box"],
                },
            ],
            variants: [
                {
                    title: "500g Box",
                    sku: "AJWA-500G",
                    options: { "Package Size": "500g Box" },
                    prices: [
                        { amount: 12500, currency_code: "kwd" },
                        { amount: 4000, currency_code: "usd" },
                    ],
                },
                {
                    title: "1kg Premium Box",
                    sku: "AJWA-1KG",
                    options: { "Package Size": "1kg Premium Box" },
                    prices: [
                        { amount: 22000, currency_code: "kwd" },
                        { amount: 7200, currency_code: "usd" },
                    ],
                },
            ],
        },
        {
            title: "Royal Majdool Extra Large Dates",
            handle: "royal-majdool-xl-dates",
            description: "Known as the King of Dates — extra-large, moist, and caramel-flavored Medjool dates of supreme quality.",
            category_ids: [createdCategory.id],
            status: utils_1.ProductStatus.PUBLISHED,
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            images: [
                { url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=800" },
            ],
            options: [
                {
                    title: "Weight",
                    values: ["500g", "1kg Gift Box"],
                },
            ],
            variants: [
                {
                    title: "500g",
                    sku: "MAJDOOL-500G",
                    options: { Weight: "500g" },
                    prices: [
                        { amount: 15000, currency_code: "kwd" },
                        { amount: 4800, currency_code: "usd" },
                    ],
                },
                {
                    title: "1kg Gift Box",
                    sku: "MAJDOOL-1KG",
                    options: { Weight: "1kg Gift Box" },
                    prices: [
                        { amount: 28000, currency_code: "kwd" },
                        { amount: 9000, currency_code: "usd" },
                    ],
                },
            ],
        },
        {
            title: "Sukkari VIP Stuffed Dates Selection",
            handle: "sukkari-vip-stuffed-dates",
            description: "Crispy golden Sukkari dates hand-stuffed with roasted almonds, pistachios, and organic cardamoms.",
            category_ids: [createdCategory.id],
            status: utils_1.ProductStatus.PUBLISHED,
            shipping_profile_id: defaultShippingProfile.id,
            sales_channels: [{ id: defaultSalesChannel.id }],
            images: [
                { url: "https://images.unsplash.com/photo-1596504245366-c95107e3ef81?auto=format&fit=crop&q=80&w=800" },
            ],
            options: [
                {
                    title: "Assortment",
                    values: ["12 Pieces Wooden Box", "24 Pieces Royal Velvet Box"],
                },
            ],
            variants: [
                {
                    title: "12 Pieces Wooden Box",
                    sku: "SUKKARI-STUFFED-12P",
                    options: { Assortment: "12 Pieces Wooden Box" },
                    prices: [
                        { amount: 18500, currency_code: "kwd" },
                        { amount: 6000, currency_code: "usd" },
                    ],
                },
                {
                    title: "24 Pieces Royal Velvet Box",
                    sku: "SUKKARI-STUFFED-24P",
                    options: { Assortment: "24 Pieces Royal Velvet Box" },
                    prices: [
                        { amount: 32000, currency_code: "kwd" },
                        { amount: 10500, currency_code: "usd" },
                    ],
                },
            ],
        },
    ];
    const { result: createdProducts } = await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: productsData,
        },
    });
    logger.info(`✅ Created ${createdProducts.length} products successfully!`);
    // 6. Seed stock levels if stock location exists
    if (stockLocation) {
        logger.info(`Setting inventory levels at location: ${stockLocation.name} (${stockLocation.id})...`);
        const { data: inventoryItems } = await query.graph({
            entity: "inventory_item",
            fields: ["id"],
        });
        const inventoryLevels = inventoryItems.map((item) => ({
            location_id: stockLocation.id,
            stocked_quantity: 500,
            inventory_item_id: item.id,
        }));
        if (inventoryLevels.length > 0) {
            await (0, core_flows_1.createInventoryLevelsWorkflow)(container).run({
                input: {
                    inventory_levels: inventoryLevels,
                },
            });
            logger.info(`✅ Initialized inventory levels for ${inventoryLevels.length} inventory items.`);
        }
    }
    logger.info("🎉 All category and product data updated successfully!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1jYXRlZ29yeS1hbmQtcHJvZHVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9zZWVkLWNhdGVnb3J5LWFuZC1wcm9kdWN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVlBLDBDQThNQztBQXpORCxxREFJbUM7QUFDbkMsNERBSXFDO0FBRXRCLEtBQUssVUFBVSx1QkFBdUIsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUMzRSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25FLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSx3QkFBd0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN4RSxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sMEJBQTBCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFN0UsTUFBTSxDQUFDLElBQUksQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO0lBRW5FLGlDQUFpQztJQUNqQyxNQUFNLGFBQWEsR0FBRyxNQUFNLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFDRCxNQUFNLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixtQkFBbUIsQ0FBQyxJQUFJLEtBQUss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