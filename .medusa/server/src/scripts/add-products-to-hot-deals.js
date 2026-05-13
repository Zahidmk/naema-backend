"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addProductsToHotDeals;
const utils_1 = require("@medusajs/framework/utils");
async function addProductsToHotDeals({ container }) {
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    console.log("🔥 Adding products to Hot Deals collection...");
    // Get the Hot Deals collection
    const collectionsResult = await productService.listProductCollections({ handle: "hot-deals" }, { take: 1 });
    const collections = Array.isArray(collectionsResult) ? collectionsResult[0] : collectionsResult;
    const collectionsList = Array.isArray(collections) ? collections : [collections];
    console.log("Collections result:", JSON.stringify(collectionsResult, null, 2));
    if (!collectionsList || collectionsList.length === 0 || !collectionsList[0]) {
        console.log("❌ Hot Deals collection not found!");
        return;
    }
    const hotDealsCollection = collectionsList[0];
    console.log(`✅ Found Hot Deals collection: ${hotDealsCollection.id}`);
    // Get all products - fix the destructuring
    const productsResult = await productService.listProducts({}, { take: 20 });
    console.log("Products result type:", typeof productsResult, Array.isArray(productsResult));
    // Handle the [products, count] tuple format
    let productList = [];
    if (Array.isArray(productsResult) && productsResult.length >= 1) {
        productList = Array.isArray(productsResult[0]) ? productsResult[0] : productsResult;
    }
    else {
        productList = productsResult;
    }
    console.log(`📦 Found ${productList?.length || 0} total products`);
    if (!productList || productList.length === 0) {
        console.log("❌ No products found!");
        return;
    }
    // Take up to 6 products for Hot Deals
    const productsToAdd = productList.slice(0, Math.min(6, productList.length));
    console.log(`\n🔗 Linking ${productsToAdd.length} products to Hot Deals...`);
    // Update each product's collection_id
    for (const product of productsToAdd) {
        try {
            await productService.updateProducts(product.id, {
                collection_id: hotDealsCollection.id
            });
            console.log(`   ✅ Linked: ${product.title} (${product.id})`);
        }
        catch (err) {
            console.log(`   ⚠️ Failed to link ${product.title}: ${err.message}`);
        }
    }
    console.log("\n🎉 Hot Deals collection updated successfully!");
    console.log(`   Total products in Hot Deals: ${productsToAdd.length}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLXByb2R1Y3RzLXRvLWhvdC1kZWFscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2FkZC1wcm9kdWN0cy10by1ob3QtZGVhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSx3Q0EwREM7QUE1REQscURBQW1EO0FBRXBDLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUN6RSxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQVEsQ0FBQTtJQUVoRSxPQUFPLENBQUMsR0FBRyxDQUFDLCtDQUErQyxDQUFDLENBQUE7SUFFNUQsK0JBQStCO0lBQy9CLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxjQUFjLENBQUMsc0JBQXNCLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUMzRyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQTtJQUMvRixNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUE7SUFFaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRTlFLElBQUksQ0FBQyxlQUFlLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUE7UUFDaEQsT0FBTTtJQUNSLENBQUM7SUFFRCxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBRXJFLDJDQUEyQztJQUMzQyxNQUFNLGNBQWMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxPQUFPLGNBQWMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7SUFFMUYsNENBQTRDO0lBQzVDLElBQUksV0FBVyxHQUFVLEVBQUUsQ0FBQTtJQUMzQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoRSxXQUFXLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUE7SUFDckYsQ0FBQztTQUFNLENBQUM7UUFDTixXQUFXLEdBQUcsY0FBdUIsQ0FBQTtJQUN2QyxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLFdBQVcsRUFBRSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBRWxFLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUE7UUFDbkMsT0FBTTtJQUNSLENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFFM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsYUFBYSxDQUFDLE1BQU0sMkJBQTJCLENBQUMsQ0FBQTtJQUU1RSxzQ0FBc0M7SUFDdEMsS0FBSyxNQUFNLE9BQU8sSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUM7WUFDSCxNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7YUFDckMsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsT0FBTyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUM5RCxDQUFDO1FBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztZQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixPQUFPLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQ3RFLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpREFBaUQsQ0FBQyxDQUFBO0lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0FBQ3hFLENBQUMifQ==