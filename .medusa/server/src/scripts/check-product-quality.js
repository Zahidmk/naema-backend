"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_sdk_1 = __importDefault(require("@medusajs/js-sdk"));
const client = new js_sdk_1.default({
    baseUrl: "http://localhost:9000",
    publishableKey: "pk_f8b6e5e814ea97ec6e132c556a380d0d28871bcd91a11e5e6008c58dddd3746b",
});
async function checkProductQuality() {
    try {
        const { products, count } = await client.store.product.list({
            limit: 500,
            region_id: "reg_01KFYZNTFQ4AGNEVR15206N3GN"
        });
        console.log("Total products:", count);
        console.log("Checking product quality...\n");
        const issues = {
            noTitle: [],
            noPrice: [],
            noImage: [],
            noVariants: [],
            noDescription: [],
        };
        for (const p of products || []) {
            const info = { id: p.id, title: p.title || "(no title)", handle: p.handle || "" };
            // Check for missing title
            if (!p.title || p.title.trim() === "") {
                issues.noTitle.push(info);
            }
            // Check for missing images
            if (!p.thumbnail && (!p.images || p.images.length === 0)) {
                issues.noImage.push(info);
            }
            // Check for no variants
            if (!p.variants || p.variants.length === 0) {
                issues.noVariants.push(info);
            }
            else {
                // Check for missing price
                const hasPrice = p.variants.some((v) => {
                    return v.calculated_price &&
                        v.calculated_price.calculated_amount !== null &&
                        v.calculated_price.calculated_amount > 0;
                });
                if (!hasPrice) {
                    issues.noPrice.push(info);
                }
            }
            // Check for missing description
            if (!p.description || p.description.trim() === "") {
                issues.noDescription.push(info);
            }
        }
        console.log("=== PRODUCT QUALITY REPORT ===\n");
        console.log(`Total products analyzed: ${products?.length || 0}`);
        console.log("\n--- Issues Found ---");
        console.log(`❌ No title: ${issues.noTitle.length}`);
        console.log(`❌ No image: ${issues.noImage.length}`);
        console.log(`❌ No price: ${issues.noPrice.length}`);
        console.log(`❌ No variants: ${issues.noVariants.length}`);
        console.log(`⚠️  No description: ${issues.noDescription.length}`);
        // List products without images (critical for display)
        if (issues.noImage.length > 0) {
            console.log("\n--- Products Without Images ---");
            issues.noImage.slice(0, 20).forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.title} (${p.handle})`);
            });
            if (issues.noImage.length > 20) {
                console.log(`  ... and ${issues.noImage.length - 20} more`);
            }
        }
        // List products without price (critical for checkout)
        if (issues.noPrice.length > 0) {
            console.log("\n--- Products Without Price ---");
            issues.noPrice.slice(0, 20).forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.title} (${p.handle})`);
            });
            if (issues.noPrice.length > 20) {
                console.log(`  ... and ${issues.noPrice.length - 20} more`);
            }
        }
        // Summary
        const goodProducts = (products?.length || 0) - issues.noImage.length - issues.noPrice.length - issues.noVariants.length;
        console.log("\n=== SUMMARY ===");
        console.log(`✅ Complete products (with image, price, variants): ${goodProducts}`);
        console.log(`❌ Products needing attention: ${issues.noImage.length + issues.noPrice.length + issues.noVariants.length}`);
        return {
            total: products?.length || 0,
            issues,
            goodProducts
        };
    }
    catch (e) {
        console.error("Error checking products:", e.message);
        throw e;
    }
}
checkProductQuality()
    .then((result) => {
    console.log("\nProduct quality check completed.");
    process.exit(0);
})
    .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stcHJvZHVjdC1xdWFsaXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY2hlY2stcHJvZHVjdC1xdWFsaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsOERBQXNDO0FBRXRDLE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQztJQUN4QixPQUFPLEVBQUUsdUJBQXVCO0lBQ2hDLGNBQWMsRUFBRSxxRUFBcUU7Q0FDdEYsQ0FBQyxDQUFDO0FBUUgsS0FBSyxVQUFVLG1CQUFtQjtJQUNoQyxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQzFELEtBQUssRUFBRSxHQUFHO1lBQ1YsU0FBUyxFQUFFLGdDQUFnQztTQUM1QyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUU3QyxNQUFNLE1BQU0sR0FBRztZQUNiLE9BQU8sRUFBRSxFQUFvQjtZQUM3QixPQUFPLEVBQUUsRUFBb0I7WUFDN0IsT0FBTyxFQUFFLEVBQW9CO1lBQzdCLFVBQVUsRUFBRSxFQUFvQjtZQUNoQyxhQUFhLEVBQUUsRUFBb0I7U0FDcEMsQ0FBQztRQUVGLEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQy9CLE1BQU0sSUFBSSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBRWxGLDBCQUEwQjtZQUMxQixJQUFJLENB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