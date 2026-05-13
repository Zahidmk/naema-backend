"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixKuwaitShippingPrice;
/**
 * Fix Kuwait Shipping Price and Links
 *
 * This script:
 * 1. Adds KWD price to Kuwait shipping option
 * 2. Links Kuwait stock location to sales channel
 *
 * Run: npx medusa exec ./src/scripts/fix-kuwait-shipping-price.ts
 */
async function fixKuwaitShippingPrice({ container }) {
    console.log("\n💰 Fixing Kuwait Shipping Price...");
    console.log("=".repeat(50));
    const fulfillmentModuleService = container.resolve("fulfillment");
    const stockLocationService = container.resolve("stock_location");
    const salesChannelService = container.resolve("sales_channel");
    const linkService = container.resolve("link");
    // Step 1: Find Kuwait shipping option
    console.log("\n1️⃣ Finding Kuwait Shipping Option...");
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({
        name: "Kuwait Standard Shipping"
    });
    if (shippingOptions.length === 0) {
        console.log("  ❌ Kuwait Standard Shipping not found!");
        return;
    }
    const kuwaitShipping = shippingOptions[0];
    console.log(`  ✅ Found: ${kuwaitShipping.id}`);
    // Step 2: Add/Update price for KWD
    console.log("\n2️⃣ Setting up KWD Price...");
    try {
        // Need to add price - use the pricing module
        const pricingService = container.resolve("pricing");
        // Create a price set and link it
        const priceSet = await pricingService.createPriceSets({
            prices: [
                {
                    amount: 0, // Free shipping
                    currency_code: "kwd"
                }
            ]
        });
        console.log(`  ✅ Created price set: ${priceSet.id}`);
        // Link price to shipping option
        try {
            await linkService.create({
                shipping_option_price_set: {
                    shipping_option_id: kuwaitShipping.id,
                    price_set_id: priceSet.id
                }
            });
            console.log("  ✅ Linked price to shipping option");
        }
        catch (linkErr) {
            console.log(`  ⚠️ Link error: ${linkErr.message}`);
        }
    }
    catch (err) {
        console.log(`  ⚠️ Price setup: ${err.message}`);
    }
    // Step 3: Link Kuwait stock location to sales channel
    console.log("\n3️⃣ Linking Stock Location to Sales Channel...");
    try {
        const kuwaitLocations = await stockLocationService.listStockLocations({
            name: "Kuwait Warehouse"
        });
        if (kuwaitLocations.length === 0) {
            console.log("  ⚠️ Kuwait Warehouse not found");
            return;
        }
        const kuwaitLocation = kuwaitLocations[0];
        console.log(`  📍 Kuwait Warehouse: ${kuwaitLocation.id}`);
        const salesChannels = await salesChannelService.listSalesChannels({});
        const defaultChannel = salesChannels[0];
        if (defaultChannel) {
            console.log(`  📢 Sales Channel: ${defaultChannel.name} (${defaultChannel.id})`);
            // Link stock location to sales channel
            try {
                await linkService.create({
                    sales_channel_stock_location: {
                        sales_channel_id: defaultChannel.id,
                        stock_location_id: kuwaitLocation.id
                    }
                });
                console.log("  ✅ Linked Kuwait Warehouse to Sales Channel");
            }
            catch (linkErr) {
                if (linkErr.message?.includes("already exists") || linkErr.message?.includes("duplicate")) {
                    console.log("  ✅ Link already exists");
                }
                else {
                    console.log(`  ⚠️ Link error: ${linkErr.message}`);
                }
            }
        }
    }
    catch (err) {
        console.log(`  ⚠️ Stock location linking: ${err.message}`);
    }
    // Step 4: Link fulfillment set to stock location
    console.log("\n4️⃣ Linking Fulfillment Set to Stock Location...");
    try {
        const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
            name: "Kuwait Fulfillment"
        });
        const kuwaitLocations = await stockLocationService.listStockLocations({
            name: "Kuwait Warehouse"
        });
        if (fulfillmentSets.length > 0 && kuwaitLocations.length > 0) {
            const fulfillmentSet = fulfillmentSets[0];
            const location = kuwaitLocations[0];
            try {
                await linkService.create({
                    stock_location_fulfillment_set: {
                        stock_location_id: location.id,
                        fulfillment_set_id: fulfillmentSet.id
                    }
                });
                console.log("  ✅ Linked Fulfillment Set to Stock Location");
            }
            catch (linkErr) {
                if (linkErr.message?.includes("already exists") || linkErr.message?.includes("duplicate")) {
                    console.log("  ✅ Link already exists");
                }
                else {
                    console.log(`  ⚠️ Link error: ${linkErr.message}`);
                }
            }
        }
    }
    catch (err) {
        console.log(`  ⚠️ Fulfillment linking: ${err.message}`);
    }
    console.log("\n" + "=".repeat(50));
    console.log("✅ Kuwait shipping price and links setup completed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LWt1d2FpdC1zaGlwcGluZy1wcmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2ZpeC1rdXdhaXQtc2hpcHBpbmctcHJpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFZQSx5Q0E0SUM7QUF0SkQ7Ozs7Ozs7O0dBUUc7QUFFWSxLQUFLLFVBQVUsc0JBQXNCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO0lBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTVCLE1BQU0sd0JBQXdCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNqRSxNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNoRSxNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDOUQsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUU3QyxzQ0FBc0M7SUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO0lBRXRELE1BQU0sZUFBZSxHQUFHLE1BQU0sd0JBQXdCLENBQUMsbUJBQW1CLENBQUM7UUFDekUsSUFBSSxFQUFFLDBCQUEwQjtLQUNqQyxDQUFDLENBQUE7SUFFRixJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO1FBQ3RELE9BQU07SUFDUixDQUFDO0lBRUQsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FB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