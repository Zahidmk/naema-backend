"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addKwdShippingPrices;
/**
 * Add KWD prices to shipping options
 *
 * Run: npx medusa exec ./src/scripts/add-kwd-shipping-prices.ts
 */
async function addKwdShippingPrices({ container }) {
    console.log("\n💵 Adding KWD Prices to Shipping Options...");
    console.log("=".repeat(50));
    const fulfillmentModuleService = container.resolve("fulfillment");
    const pricingService = container.resolve("pricing");
    // Step 1: Get all shipping options
    console.log("\n1️⃣ Finding shipping options...");
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({});
    console.log(`  📦 Found ${shippingOptions.length} shipping options`);
    for (const option of shippingOptions) {
        console.log(`\n  Processing: ${option.name} (${option.id})`);
        // Get price set for this shipping option via the link
        try {
            const query = container.resolve("query");
            // Query for the shipping option with its linked price sets
            const { data } = await query.graph({
                entity: "shipping_option",
                fields: ["id", "name", "price.*"],
                filters: { id: option.id }
            });
            if (data && data.length > 0) {
                const optionData = data[0];
                console.log(`    Linked data: ${JSON.stringify(optionData).substring(0, 100)}`);
                // Try to find price_set_id from linked prices
                const prices = optionData.price || optionData.prices || [];
                if (prices.length > 0) {
                    const priceSetId = prices[0]?.price_set_id;
                    if (priceSetId) {
                        console.log(`    Price Set ID: ${priceSetId}`);
                        // Check if KWD price exists
                        const existingPrices = await pricingService.listPrices({
                            price_set_id: [priceSetId],
                            currency_code: ["kwd"]
                        });
                        if (existingPrices.length > 0) {
                            console.log(`    ✅ KWD price already exists: ${existingPrices[0].amount}`);
                        }
                        else {
                            // Add KWD price
                            await pricingService.addPrices({
                                priceSetId: priceSetId,
                                prices: [{
                                        amount: 0, // Free shipping
                                        currency_code: "kwd"
                                    }]
                            });
                            console.log(`    ✅ Added KWD price: 0 (free shipping)`);
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log(`    ⚠️ Error: ${err.message}`);
            // Fallback: Try direct database approach
            try {
                // Get the remote link
                const remoteLink = container.resolve("remoteLink");
                const links = await remoteLink.list({
                    shipping_option: { shipping_option_id: option.id }
                });
                console.log(`    Links found: ${links.length}`);
            }
            catch (linkErr) {
                console.log(`    Link error: ${linkErr.message}`);
            }
        }
    }
    console.log("\n" + "=".repeat(50));
    console.log("✅ KWD pricing update completed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLWt3ZC1zaGlwcGluZy1wcmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9hZGQta3dkLXNoaXBwaW5nLXByaWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLHVDQWdGQztBQXRGRDs7OztHQUlHO0FBRVksS0FBSyxVQUFVLG9CQUFvQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLENBQUMsQ0FBQTtJQUM1RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUU1QixNQUFNLHdCQUF3QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDakUsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUVuRCxtQ0FBbUM7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0lBRWhELE1BQU0sZUFBZSxHQUFHLE1BQU0sd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDOUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLGVBQWUsQ0FBQyxNQUFNLG1CQUFtQixDQUFDLENBQUE7SUFFcEUsS0FBSyxNQUFNLE1BQU0sSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBRTVELHNEQUFzRDtRQUN0RCxJQUFJLENBQUM7WUFDSCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBRXhDLDJEQUEyRDtZQUMzRCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FB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