"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixKwdPricesDirect;
/**
 * Add KWD prices via direct database query
 *
 * Run: npx medusa exec ./src/scripts/fix-kwd-prices-direct.ts
 */
async function fixKwdPricesDirect({ container }) {
    console.log("\n💵 Adding KWD Prices (Direct Database)...");
    console.log("=".repeat(50));
    const pricingService = container.resolve("pricing");
    // Step 1: List all price sets
    console.log("\n1️⃣ Finding price sets...");
    const priceSets = await pricingService.listPriceSets({}, { take: 100 });
    console.log(`  📊 Found ${priceSets.length} price sets`);
    // Step 2: For each price set that has EUR or USD prices for shipping (low amounts like 10),
    // add a KWD price
    let addedCount = 0;
    for (const priceSet of priceSets) {
        try {
            // Get prices for this set
            const prices = await pricingService.listPrices({
                price_set_id: [priceSet.id]
            });
            // Check if this looks like a shipping price (amount <= 100, has EUR or USD)
            const hasShippingPrice = prices.some((p) => (p.currency_code === 'usd' || p.currency_code === 'eur') &&
                p.amount <= 100);
            const hasKwd = prices.some((p) => p.currency_code === 'kwd');
            if (hasShippingPrice && !hasKwd) {
                console.log(`\n  Price Set ${priceSet.id}:`);
                console.log(`    Current prices: ${prices.map((p) => `${p.currency_code}:${p.amount}`).join(', ')}`);
                // Add KWD price
                try {
                    await pricingService.addPrices({
                        priceSetId: priceSet.id,
                        prices: [{
                                amount: 0, // Free shipping in KWD
                                currency_code: "kwd"
                            }]
                    });
                    console.log(`    ✅ Added KWD: 0 (free shipping)`);
                    addedCount++;
                }
                catch (addErr) {
                    console.log(`    ⚠️ Add error: ${addErr.message}`);
                }
            }
        }
        catch (err) {
            // Skip errors
        }
    }
    console.log("\n" + "=".repeat(50));
    console.log(`✅ Added KWD prices to ${addedCount} price sets`);
    // Step 3: Verify
    console.log("\n3️⃣ Verifying shipping prices...");
    const fulfillmentModuleService = container.resolve("fulfillment");
    const shippingOptions = await fulfillmentModuleService.listShippingOptions({});
    for (const option of shippingOptions) {
        console.log(`  ${option.name}: ${option.id}`);
    }
    console.log("\n✅ Done!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LWt3ZC1wcmljZXMtZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZml4LWt3ZC1wcmljZXMtZGlyZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUUEscUNBcUVDO0FBM0VEOzs7O0dBSUc7QUFFWSxLQUFLLFVBQVUsa0JBQWtCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFBO0lBQzFELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTVCLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFbkQsOEJBQThCO0lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtJQUUxQyxNQUFNLFNBQVMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLFNBQVMsQ0FBQyxNQUFNLGFBQWEsQ0FBQyxDQUFBO0lBRXhELDRGQUE0RjtJQUM1RixrQkFBa0I7SUFDbEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFBO0lBRWxCLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDO1lBQ0gsMEJBQTBCO1lBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxDQUFDLFVBQVUsQ0FBQztnQkFDN0MsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQzthQUM1QixDQUFDLENBQUE7WUFFRiw0RUFBNEU7WUFDNUUsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FDOUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQztnQkFDeEQsQ0FBQyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQ2hCLENBQUE7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxLQUFLLEtBQUssQ0FBQyxDQUFBO1lBRWpFLElBQUksZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUV6RyxnQkFBZ0I7Z0JBQ2hCLElBQUksQ0FBQztvQkFDSCxNQUFNLGNBQWMsQ0FBQyxTQUFTLENBQUM7d0JBQzdCLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRTt3QkFDdkIsTUFBTSxFQUFFLENBQUM7Z0NBQ1AsTUFBTSxFQUFFLENBQUMsRUFBRSx1QkFBdUI7Z0NBQ2xDLGFBQWEsRUFBRSxLQUFLOzZCQUNyQixDQUFDO3FCQUNILENBQUMsQ0FBQTtvQkFDRixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUE7b0JBQ2pELFVBQVUsRUFBRSxDQUFBO2dCQUNkLENBQUM7Z0JBQUMsT0FBTyxNQUFXLEVBQUUsQ0FBQztvQkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7Z0JBQ3BELENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7WUFDbEIsY0FBYztRQUNoQixDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixVQUFVLGFBQWEsQ0FBQyxDQUFBO0lBRTdELGlCQUFpQjtJQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUE7SUFFakQsTUFBTSx3QkFBd0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ2pFLE1BQU0sZUFBZSxHQUFHLE1BQU0sd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFOUUsS0FBSyxNQUFNLE1BQU0sSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMvQyxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUMxQixDQUFDIn0=