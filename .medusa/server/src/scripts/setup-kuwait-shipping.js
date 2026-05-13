"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupKuwaitShipping;
/**
 * Setup Kuwait Shipping
 *
 * This script creates the necessary fulfillment and shipping configuration
 * for Kuwait region orders.
 *
 * Run: npx medusa exec ./src/scripts/setup-kuwait-shipping.ts
 */
async function setupKuwaitShipping({ container }) {
    console.log("\n🚚 Setting up Kuwait Shipping...");
    console.log("=".repeat(50));
    const regionService = container.resolve("region");
    const stockLocationService = container.resolve("stock_location");
    const fulfillmentModuleService = container.resolve("fulfillment");
    const linkService = container.resolve("link");
    // Step 1: Find or create Kuwait stock location
    console.log("\n1️⃣ Setting up Kuwait Stock Location...");
    let kuwaitLocation;
    const existingLocations = await stockLocationService.listStockLocations({ name: "Kuwait Warehouse" });
    if (existingLocations.length > 0) {
        kuwaitLocation = existingLocations[0];
        console.log(`  ✅ Found existing Kuwait Warehouse: ${kuwaitLocation.id}`);
    }
    else {
        kuwaitLocation = await stockLocationService.createStockLocations({
            name: "Kuwait Warehouse",
            address: {
                address_1: "Kuwait City",
                city: "Kuwait City",
                country_code: "kw",
                postal_code: "12345"
            }
        });
        console.log(`  ✅ Created Kuwait Warehouse: ${kuwaitLocation.id}`);
    }
    // Step 2: Find Kuwait region
    console.log("\n2️⃣ Finding Kuwait Region...");
    const regions = await regionService.listRegions({});
    const kuwaitRegion = regions.find((r) => r.name?.toLowerCase().includes('kuwait') ||
        r.countries?.some((c) => c.iso_2?.toLowerCase() === 'kw'));
    if (!kuwaitRegion) {
        console.error("  ❌ Kuwait region not found!");
        return;
    }
    console.log(`  ✅ Found Kuwait Region: ${kuwaitRegion.id} (${kuwaitRegion.name})`);
    // Step 3: Create fulfillment set for Kuwait
    console.log("\n3️⃣ Setting up Fulfillment Set for Kuwait...");
    let kuwaitFulfillmentSet;
    try {
        // Check if fulfillment set exists
        const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
            name: "Kuwait Fulfillment"
        });
        if (fulfillmentSets.length > 0) {
            kuwaitFulfillmentSet = fulfillmentSets[0];
            console.log(`  ✅ Found existing Kuwait Fulfillment Set: ${kuwaitFulfillmentSet.id}`);
        }
        else {
            kuwaitFulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
                name: "Kuwait Fulfillment",
                type: "shipping"
            });
            console.log(`  ✅ Created Kuwait Fulfillment Set: ${kuwaitFulfillmentSet.id}`);
        }
    }
    catch (err) {
        console.log(`  ⚠️ Fulfillment set error: ${err.message}`);
    }
    // Step 4: Create service zone for Kuwait
    console.log("\n4️⃣ Setting up Service Zone for Kuwait...");
    let kuwaitServiceZone;
    try {
        const serviceZones = await fulfillmentModuleService.listServiceZones({
            name: "Kuwait Zone"
        });
        if (serviceZones.length > 0) {
            kuwaitServiceZone = serviceZones[0];
            console.log(`  ✅ Found existing Kuwait Zone: ${kuwaitServiceZone.id}`);
        }
        else if (kuwaitFulfillmentSet) {
            kuwaitServiceZone = await fulfillmentModuleService.createServiceZones({
                name: "Kuwait Zone",
                fulfillment_set_id: kuwaitFulfillmentSet.id,
                geo_zones: [{
                        type: "country",
                        country_code: "kw"
                    }]
            });
            console.log(`  ✅ Created Kuwait Zone: ${kuwaitServiceZone.id}`);
        }
    }
    catch (err) {
        console.log(`  ⚠️ Service zone error: ${err.message}`);
    }
    // Step 5: Create shipping option for Kuwait
    console.log("\n5️⃣ Setting up Shipping Option for Kuwait...");
    try {
        // Get shipping profile
        const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({});
        const defaultProfile = shippingProfiles.find((p) => p.type === 'default') || shippingProfiles[0];
        if (!defaultProfile) {
            console.log("  ⚠️ No shipping profile found");
            return;
        }
        // Check for existing Kuwait shipping option
        const existingOptions = await fulfillmentModuleService.listShippingOptions({
            name: "Kuwait Standard Shipping"
        });
        if (existingOptions.length > 0) {
            console.log(`  ✅ Found existing Kuwait Standard Shipping: ${existingOptions[0].id}`);
        }
        else if (kuwaitServiceZone) {
            // Create shipping option
            const shippingOption = await fulfillmentModuleService.createShippingOptions({
                name: "Kuwait Standard Shipping",
                price_type: "flat",
                service_zone_id: kuwaitServiceZone.id,
                shipping_profile_id: defaultProfile.id,
                provider_id: "manual_manual",
                type: {
                    label: "Standard",
                    description: "Standard shipping to Kuwait (2-3 days)",
                    code: "standard"
                },
                rules: [
                    {
                        attribute: "enabled_in_store",
                        operator: "eq",
                        value: "true"
                    },
                    {
                        attribute: "is_return",
                        operator: "eq",
                        value: "false"
                    }
                ]
            });
            console.log(`  ✅ Created Kuwait Standard Shipping: ${shippingOption.id}`);
            // Add price for KWD
            try {
                const pricingService = container.resolve("pricing");
                await pricingService.createPriceSets({
                    prices: [{
                            amount: 0, // Free shipping
                            currency_code: "kwd"
                        }]
                });
                console.log("  ✅ Added KWD pricing (Free Shipping)");
            }
            catch (priceErr) {
                console.log(`  ⚠️ Pricing: ${priceErr.message}`);
            }
        }
    }
    catch (err) {
        console.log(`  ⚠️ Shipping option error: ${err.message}`);
    }
    // Step 6: Link stock location to fulfillment
    console.log("\n6️⃣ Linking Stock Location to Fulfillment...");
    try {
        if (kuwaitFulfillmentSet && kuwaitLocation) {
            await linkService.create({
                fulfillment_set_stock_location: {
                    fulfillment_set_id: kuwaitFulfillmentSet.id,
                    stock_location_id: kuwaitLocation.id
                }
            });
            console.log("  ✅ Linked Kuwait Warehouse to Fulfillment Set");
        }
    }
    catch (err) {
        console.log(`  ⚠️ Link error (may already exist): ${err.message}`);
    }
    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 KUWAIT SHIPPING SETUP SUMMARY");
    console.log("=".repeat(50));
    console.log(`📍 Stock Location: ${kuwaitLocation?.id || 'N/A'}`);
    console.log(`🌍 Region: ${kuwaitRegion?.id || 'N/A'}`);
    console.log(`📦 Fulfillment Set: ${kuwaitFulfillmentSet?.id || 'N/A'}`);
    console.log(`🗺️  Service Zone: ${kuwaitServiceZone?.id || 'N/A'}`);
    console.log("\n✅ Kuwait shipping setup completed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAta3V3YWl0LXNoaXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc2V0dXAta3V3YWl0LXNoaXBwaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBV0Esc0NBNkxDO0FBdE1EOzs7Ozs7O0dBT0c7QUFFWSxLQUFLLFVBQVUsbUJBQW1CLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO0lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTVCLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDakQsTUFBTSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDaEUsTUFBTSx3QkFBd0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ2pFLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFN0MsK0NBQStDO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtJQUV4RCxJQUFJLGNBQWMsQ0FBQTtJQUNsQixNQUFNLGlCQUFpQixHQUFHLE1BQU0sb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO0lBRXJHLElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2pDLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxjQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMxRSxDQUFDO1NBQU0sQ0FB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