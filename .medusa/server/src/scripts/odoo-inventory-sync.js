"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = odooInventorySync;
const axios_1 = __importDefault(require("axios"));
async function odooInventorySync({ container }) {
    console.log("\n📦 Starting Odoo Inventory Sync to MedusaJS...");
    console.log("=".repeat(50));
    // Get configuration from environment
    const odooUrl = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
    const odooDb = process.env.ODOO_DB_NAME || "oskarllc-new-27289548";
    const odooUsername = process.env.ODOO_USERNAME || "SYG";
    const odooPassword = process.env.ODOO_PASSWORD || "S123456";
    console.log(`📡 Odoo URL: ${odooUrl}`);
    console.log(`📁 Database: ${odooDb}`);
    // Authenticate with Odoo
    console.log("\n1️⃣ Authenticating with Odoo...");
    let uid;
    try {
        const authResponse = await axios_1.default.post(`${odooUrl}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [odooDb, odooUsername, odooPassword, {}]
            },
            id: 1
        });
        uid = authResponse.data.result;
        if (!uid) {
            console.error("❌ Authentication failed - no UID returned");
            return;
        }
        console.log(`✅ Authenticated successfully (UID: ${uid})`);
    }
    catch (error) {
        console.error("❌ Authentication failed:", error.message);
        return;
    }
    // Fetch inventory from Odoo
    console.log("\n2️⃣ Fetching inventory from Odoo...");
    let odooProducts = [];
    try {
        const productsResponse = await axios_1.default.post(`${odooUrl}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    odooDb,
                    uid,
                    odooPassword,
                    "product.product",
                    "search_read",
                    [[["active", "=", true]]],
                    {
                        fields: ["id", "default_code", "qty_available", "virtual_available", "name"],
                        limit: 1000
                    }
                ]
            },
            id: 2
        });
        odooProducts = productsResponse.data.result || [];
        console.log(`✅ Found ${odooProducts.length} products in Odoo`);
    }
    catch (error) {
        console.error("❌ Failed to fetch inventory:", error.message);
        return;
    }
    // Build SKU to inventory map
    const odooInventory = new Map();
    for (const product of odooProducts) {
        const sku = product.default_code || `ODOO-${product.id}`;
        odooInventory.set(sku, {
            qty: Math.max(0, Math.floor(product.qty_available)),
            odooId: product.id,
            name: product.name
        });
    }
    console.log(`📊 Built inventory map with ${odooInventory.size} SKUs`);
    // Get services from container
    const productModuleService = container.resolve("product");
    const inventoryModuleService = container.resolve("inventory");
    // Get existing products with variants
    console.log("\n3️⃣ Fetching MedusaJS products...");
    const existingProducts = await productModuleService.listProducts({}, {
        select: ["id", "handle", "metadata"],
        relations: ["variants"],
        take: 1000
    });
    console.log(`📊 Found ${existingProducts.length} products in MedusaJS`);
    // Get inventory items
    console.log("\n4️⃣ Fetching inventory items...");
    let inventoryItems = [];
    try {
        const items = await inventoryModuleService.listInventoryItems({}, { take: 2000 });
        inventoryItems = items;
        console.log(`📊 Found ${inventoryItems.length} inventory items`);
    }
    catch (error) {
        console.log(`⚠️ Could not list inventory items: ${error.message}`);
    }
    // Build SKU to inventory item map
    const inventoryItemMap = new Map();
    for (const item of inventoryItems) {
        if (item.sku) {
            inventoryItemMap.set(item.sku, item);
        }
    }
    // Update inventory levels
    console.log("\n5️⃣ Updating inventory levels...");
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let createdCount = 0;
    for (const product of existingProducts) {
        for (const variant of product.variants || []) {
            const sku = variant.sku;
            if (!sku)
                continue;
            const odooStock = odooInventory.get(sku);
            if (!odooStock) {
                skippedCount++;
                continue;
            }
            try {
                // Check if inventory item exists
                let inventoryItem = inventoryItemMap.get(sku);
                if (!inventoryItem) {
                    // Create inventory item for this variant
                    try {
                        inventoryItem = await inventoryModuleService.createInventoryItems({
                            sku: sku,
                            title: variant.title || product.title || "Product",
                        });
                        if (Array.isArray(inventoryItem)) {
                            inventoryItem = inventoryItem[0];
                        }
                        createdCount++;
                        console.log(`  📦 Created inventory item for SKU: ${sku}`);
                    }
                    catch (createError) {
                        // Item might already exist
                        const existing = await inventoryModuleService.listInventoryItems({ sku });
                        if (existing && existing.length > 0) {
                            inventoryItem = existing[0];
                        }
                    }
                }
                if (inventoryItem) {
                    // Get or create inventory level for default location
                    try {
                        // Get stock locations
                        const stockLocationService = container.resolve("stock_location");
                        const locations = await stockLocationService.listStockLocations({});
                        if (locations.length === 0) {
                            // Create a default location
                            const newLocation = await stockLocationService.createStockLocations({
                                name: "Kuwait Warehouse",
                                address: {
                                    address_1: "Kuwait City",
                                    country_code: "kw"
                                }
                            });
                            console.log(`  📍 Created default stock location: Kuwait Warehouse`);
                        }
                        const location = locations[0] || (await stockLocationService.listStockLocations({}))[0];
                        if (location) {
                            // Update or create inventory level
                            const levels = await inventoryModuleService.listInventoryLevels({
                                inventory_item_id: inventoryItem.id,
                                location_id: location.id
                            });
                            if (levels.length > 0) {
                                // Update existing level
                                await inventoryModuleService.updateInventoryLevels({
                                    inventory_item_id: inventoryItem.id,
                                    location_id: location.id,
                                    stocked_quantity: odooStock.qty
                                });
                            }
                            else {
                                // Create new level
                                await inventoryModuleService.createInventoryLevels({
                                    inventory_item_id: inventoryItem.id,
                                    location_id: location.id,
                                    stocked_quantity: odooStock.qty
                                });
                            }
                            updatedCount++;
                            if (updatedCount <= 20) {
                                console.log(`  ✅ ${sku}: ${odooStock.qty} units (${odooStock.name})`);
                            }
                        }
                    }
                    catch (levelError) {
                        errorCount++;
                        console.log(`  ❌ Error updating level for ${sku}: ${levelError.message}`);
                    }
                }
            }
            catch (error) {
                errorCount++;
                console.log(`  ❌ Error processing ${sku}: ${error.message}`);
            }
        }
    }
    if (updatedCount > 20) {
        console.log(`  ... and ${updatedCount - 20} more`);
    }
    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 INVENTORY SYNC SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Inventory levels updated: ${updatedCount}`);
    console.log(`📦 Inventory items created: ${createdCount}`);
    console.log(`⏭️  Products skipped (no Odoo match): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total Odoo products: ${odooProducts.length}`);
    console.log("\n✅ Inventory sync completed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2Rvby1pbnZlbnRvcnktc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL29kb28taW52ZW50b3J5LXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFxQkEsb0NBZ1BDO0FBcFFELGtEQUF5QjtBQW9CVixLQUFLLFVBQVUsaUJBQWlCLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDckUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrREFBa0QsQ0FBQyxDQUFBO0lBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRTVCLHFDQUFxQztJQUNyQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSw0Q0FBNEMsQ0FBQTtJQUNwRixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSx1QkFBdUIsQ0FBQTtJQUNsRSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUE7SUFDdkQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksU0FBUyxDQUFBO0lBRTNELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUVyQyx5QkFBeUI7SUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0lBRWhELElBQUksR0FBVyxDQUFBO0lBQ2YsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxVQUFVLEVBQUU7WUFDMUQsT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUsTUFBTTtZQUNkLE1B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