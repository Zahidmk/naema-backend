import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedCategoryAndProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

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
  const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
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
      status: ProductStatus.PUBLISHED,
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
      status: ProductStatus.PUBLISHED,
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
      status: ProductStatus.PUBLISHED,
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

  const { result: createdProducts } = await createProductsWorkflow(container).run({
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

    const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems.map((item: any) => ({
      location_id: stockLocation.id,
      stocked_quantity: 500,
      inventory_item_id: item.id,
    }));

    if (inventoryLevels.length > 0) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryLevels,
        },
      });
      logger.info(`✅ Initialized inventory levels for ${inventoryLevels.length} inventory items.`);
    }
  }

  logger.info("🎉 All category and product data updated successfully!");
}
