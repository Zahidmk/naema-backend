"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addKuwaitToShippingZone;
/**
 * Add Kuwait to Existing Shipping Zone
 *
 * This adds Kuwait (KW) to the existing Europe service zone,
 * which already has working shipping options with prices.
 *
 * Run: npx medusa exec ./src/scripts/add-kuwait-to-shipping-zone.ts
 */
async function addKuwaitToShippingZone({ container }) {
    console.log("\n🌍 Adding Kuwait to Shipping Zone...");
    console.log("=".repeat(50));
    const fulfillmentModuleService = container.resolve("fulfillment");
    // Step 1: Find the Europe service zone (which has working shipping)
    console.log("\n1️⃣ Finding existing service zones...");
    const serviceZones = await fulfillmentModuleService.listServiceZones({});
    console.log(`  📊 Found ${serviceZones.length} service zones`);
    for (const zone of serviceZones) {
        console.log(`  - ${zone.name} (${zone.id})`);
    }
    // Find the Europe zone
    const europeZone = serviceZones.find((z) => z.name === "Europe");
    if (!europeZone) {
        console.log("  ❌ Europe zone not found!");
        return;
    }
    console.log(`\n2️⃣ Adding Kuwait to ${europeZone.name}...`);
    // Get current geo zones for this service zone
    const allGeoZones = await fulfillmentModuleService.listGeoZones({});
    const geoZones = allGeoZones.filter((g) => g.service_zone_id === europeZone.id);
    console.log(`  📍 Current geo zones: ${geoZones.length}`);
    for (const geo of geoZones) {
        console.log(`    - ${geo.country_code || 'N/A'} (${geo.type})`);
    }
    // Check if Kuwait already exists
    const kuwaitExists = geoZones.some((g) => g.country_code?.toLowerCase() === 'kw');
    if (kuwaitExists) {
        console.log("  ✅ Kuwait already in this zone!");
    }
    else {
        // Add Kuwait geo zone
        try {
            await fulfillmentModuleService.createGeoZones({
                type: "country",
                country_code: "kw",
                service_zone_id: europeZone.id
            });
            console.log("  ✅ Added Kuwait to Europe zone!");
        }
        catch (err) {
            console.log(`  ⚠️ Error: ${err.message}`);
        }
    }
    // Step 3: Check shipping options for this zone
    console.log("\n3️⃣ Checking shipping options...");
    const allShippingOptions = await fulfillmentModuleService.listShippingOptions({});
    const shippingOptions = allShippingOptions.filter((o) => o.service_zone_id === europeZone.id);
    console.log(`  📦 Shipping options in this zone: ${shippingOptions.length}`);
    for (const option of shippingOptions) {
        console.log(`    - ${option.name} (${option.id})`);
    }
    // Step 4: Add KWD price to shipping options if not exists
    console.log("\n4️⃣ Checking prices for KWD...");
    for (const option of shippingOptions) {
        // Get the full option with prices
        const [fullOption] = await fulfillmentModuleService.listShippingOptions({ id: option.id }, { relations: ["prices"] });
        const prices = fullOption.prices || [];
        const hasKwd = prices.some((p) => p.currency_code === 'kwd');
        console.log(`  ${option.name}: ${prices.length} prices, KWD: ${hasKwd ? '✅' : '❌'}`);
        if (!hasKwd && prices.length > 0) {
            // Try to add KWD price through update
            console.log(`    Adding KWD price...`);
            try {
                // Get the price set ID from existing price
                const existingPrice = prices[0];
                const priceSetId = existingPrice.price_set_id;
                if (priceSetId) {
                    const pricingService = container.resolve("pricing");
                    await pricingService.addPrices({
                        priceSetId: priceSetId,
                        prices: [{
                                amount: 0, // Free shipping
                                currency_code: "kwd"
                            }]
                    });
                    console.log(`    ✅ Added KWD price (free shipping)`);
                }
            }
            catch (priceErr) {
                console.log(`    ⚠️ Price error: ${priceErr.message}`);
            }
        }
    }
    console.log("\n" + "=".repeat(50));
    console.log("✅ Kuwait shipping zone setup completed!");
    console.log("\n💡 TIP: Clear cart and add items again to get Kuwait shipping options");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLWt1d2FpdC10by1zaGlwcGluZy16b25lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvYWRkLWt1d2FpdC10by1zaGlwcGluZy16b25lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBV0EsMENBNEdDO0FBckhEOzs7Ozs7O0dBT0c7QUFFWSxLQUFLLFVBQVUsdUJBQXVCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO0lBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTVCLE1BQU0sd0JBQXdCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUVqRSxvRUFBb0U7SUFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO0lBRXRELE1BQU0sWUFBWSxHQUFHLE1BQU0sd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLFlBQVksQ0FBQyxNQUFNLGdCQUFnQixDQUFDLENBQUE7SUFFOUQsS0FBSyxNQUFNLElBQUksSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsdUJBQXVCO0lBQ3ZCLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUE7SUFFckUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMs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