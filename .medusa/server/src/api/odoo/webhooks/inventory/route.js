"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * POST /odoo/webhooks/inventory
 * Webhook for Odoo to push inventory updates to Medusa
 *
 * Call this when:
 * - Stock is received in Odoo warehouse
 * - Stock adjustment is made
 * - Products are manufactured
 * - Inter-warehouse transfer happens
 */
const POST = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { event_type, items, } = req.body;
    // Validate required fields
    if (!event_type || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            type: "invalid_data",
            message: "event_type and items array are required",
        });
    }
    console.log(`[Odoo Webhook] Received ${event_type} for ${items.length} items`);
    const results = [];
    let processed = 0;
    let failed = 0;
    let notFound = 0;
    try {
        for (const item of items) {
            const { sku, quantity, adjustment_type = "absolute" } = item;
            if (!sku || quantity === undefined) {
                results.push({
                    sku: sku || "unknown",
                    status: "failed",
                    error: "sku and quantity are required",
                });
                failed++;
                continue;
            }
            // Find inventory item by SKU
            const inventoryResult = await pgConnection.raw(`SELECT 
          ii.id as inventory_item_id,
          il.id as level_id,
          il.stocked_quantity,
          il.reserved_quantity,
          il.location_id
         FROM inventory_item ii
         LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id
         WHERE ii.sku = ?`, [sku]);
            if (!inventoryResult.rows || inventoryResult.rows.length === 0) {
                // Inventory item doesn't exist - create it
                const newItemId = `iitem_odoo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await pgConnection.raw(`INSERT INTO inventory_item (id, sku, title, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())`, [newItemId, sku, sku]);
                // Get default location
                const locationResult = await pgConnection.raw(`SELECT id FROM stock_location LIMIT 1`);
                if (locationResult.rows && locationResult.rows.length > 0) {
                    const locationId = locationResult.rows[0].id;
                    const newLevelId = `iloc_odoo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await pgConnection.raw(`INSERT INTO inventory_level 
             (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at)
             VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`, [newLevelId, newItemId, locationId, quantity]);
                    results.push({
                        sku,
                        status: "success",
                        previous_quantity: 0,
                        new_quantity: quantity,
                    });
                    processed++;
                }
                else {
                    results.push({
                        sku,
                        status: "failed",
                        error: "No stock location found",
                    });
                    failed++;
                }
                continue;
            }
            const inventoryItem = inventoryResult.rows[0];
            const previousQuantity = inventoryItem.stocked_quantity || 0;
            // Calculate new quantity based on adjustment type
            let newQuantity;
            if (adjustment_type === "delta") {
                // Delta adjustment (add/subtract from current)
                newQuantity = Math.max(0, previousQuantity + quantity);
            }
            else {
                // Absolute value (replace current)
                newQuantity = Math.max(0, quantity);
            }
            if (inventoryItem.level_id) {
                // Update existing inventory level
                await pgConnection.raw(`UPDATE inventory_level 
           SET stocked_quantity = ?, updated_at = NOW() 
           WHERE id = ?`, [newQuantity, inventoryItem.level_id]);
            }
            else {
                // Create inventory level if it doesn't exist
                const locationResult = await pgConnection.raw(`SELECT id FROM stock_location LIMIT 1`);
                if (locationResult.rows && locationResult.rows.length > 0) {
                    const locationId = locationResult.rows[0].id;
                    const newLevelId = `iloc_odoo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await pgConnection.raw(`INSERT INTO inventory_level 
             (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at)
             VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`, [newLevelId, inventoryItem.inventory_item_id, locationId, newQuantity]);
                }
            }
            results.push({
                sku,
                status: "success",
                previous_quantity: previousQuantity,
                new_quantity: newQuantity,
            });
            processed++;
        }
        res.json({
            success: failed === 0,
            event_type,
            summary: {
                total: items.length,
                processed,
                failed,
                not_found: notFound,
            },
            results,
        });
    }
    catch (error) {
        console.error("[Odoo Webhook] Inventory webhook error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.POST = POST;
/**
 * GET /odoo/webhooks/inventory
 * Health check for webhook endpoint
 */
const GET = async (req, res) => {
    res.json({
        status: "ok",
        endpoint: "inventory",
        description: "Odoo inventory webhook endpoint",
        supported_events: ["inventory.updated", "inventory.adjustment", "stock.received", "stock.transfer"],
        example_payload: {
            event_type: "inventory.updated",
            items: [
                {
                    sku: "PROD-001",
                    odoo_product_id: 123,
                    quantity: 50,
                    adjustment_type: "absolute",
                    warehouse_name: "Main Warehouse",
                    reason: "Stock received from supplier",
                },
                {
                    sku: "PROD-002",
                    quantity: -5,
                    adjustment_type: "delta",
                    reason: "Manual adjustment",
                },
            ],
        },
    });
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL29kb28vd2ViaG9va3MvaW52ZW50b3J5L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHFEQUFzRTtBQUV0RTs7Ozs7Ozs7O0dBU0c7QUFDSSxNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDcEUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFaEYsTUFBTSxFQUNKLFVBQVUsRUFDVixLQUFLLEdBQ04sR0FBRyxHQUFHLENBQUMsSUFVUCxDQUFDO0lBRUYsMkJBQTJCO0lBQzNCLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDekUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQixJQUFJLEVBQUUsY0FBYztZQUNwQixPQUFPLEVBQUUseUNBQXlDO1NBQ25ELENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixVQUFVLFFBQVEsS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDLENBQUM7SUFFL0UsTUFBTSxPQUFPLEdBTVIsRUFBRSxDQUFDO0lBRVIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUVqQixJQUFJLENBQUM7UUFDSCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxHQUFH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