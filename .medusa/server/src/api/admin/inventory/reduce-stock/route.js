"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * POST /admin/inventory/reduce-stock
 * Reduce stock when order is fulfilled (called by External ERP)
 */
const POST = async (req, res) => {
    const { items, order_id, reason } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            type: "invalid_data",
            message: "items array is required",
        });
    }
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const results = [];
    let success_count = 0;
    let failed_count = 0;
    let insufficient_stock_count = 0;
    for (const item of items) {
        try {
            const { sku, quantity } = item;
            if (!sku || !quantity || quantity <= 0) {
                results.push({
                    sku: sku || "unknown",
                    status: "failed",
                    error: "sku and positive quantity are required",
                });
                failed_count++;
                continue;
            }
            // Find inventory item by SKU with current stock
            const inventoryResult = await pgConnection.raw(`SELECT ii.id, ii.sku, ii.title, il.id as level_id, il.stocked_quantity, il.reserved_quantity
         FROM inventory_item ii 
         LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id 
         WHERE ii.sku = ?`, [sku]);
            if (!inventoryResult.rows || inventoryResult.rows.length === 0) {
                results.push({
                    sku,
                    status: "failed",
                    error: "Inventory item not found",
                });
                failed_count++;
                continue;
            }
            const inventoryItem = inventoryResult.rows[0];
            const currentStock = inventoryItem.stocked_quantity || 0;
            // Check if enough stock
            if (currentStock < quantity) {
                results.push({
                    sku,
                    status: "insufficient_stock",
                    previous_quantity: currentStock,
                    error: `Requested to reduce ${quantity} but only ${currentStock} available`,
                });
                insufficient_stock_count++;
                continue;
            }
            const newQuantity = currentStock - quantity;
            // Update inventory level
            if (inventoryItem.level_id) {
                await pgConnection.raw(`UPDATE inventory_level SET stocked_quantity = ?, updated_at = NOW() WHERE id = ?`, [newQuantity, inventoryItem.level_id]);
                results.push({
                    sku,
                    status: "reduced",
                    previous_quantity: currentStock,
                    new_quantity: newQuantity,
                    reduced_by: quantity,
                });
                success_count++;
            }
            else {
                results.push({
                    sku,
                    status: "failed",
                    error: "No inventory level found for this item",
                });
                failed_count++;
            }
        }
        catch (error) {
            results.push({
                sku: item.sku || "unknown",
                status: "failed",
                error: error.message,
            });
            failed_count++;
        }
    }
    // Log the operation
    console.log(`[Stock Reduction] Order: ${order_id || "N/A"}, Reason: ${reason || "N/A"}`);
    console.log(`[Stock Reduction] Success: ${success_count}, Failed: ${failed_count}, Insufficient: ${insufficient_stock_count}`);
    res.json({
        success: failed_count === 0 && insufficient_stock_count === 0,
        order_id: order_id || null,
        reason: reason || "stock_reduction",
        summary: {
            total_items: items.length,
            successful: success_count,
            failed: failed_count,
            insufficient_stock: insufficient_stock_count,
        },
        results,
    });
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2ludmVudG9yeS9yZWR1Y2Utc3RvY2svcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXNFO0FBRXRFOzs7R0FHRztBQUNJLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNwRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFJdkMsQ0FBQztJQUVGLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDcEMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQixJQUFJLEVBQUUsY0FBYztZQUNwQixPQUFPLEVBQUUseUJBQXlCO1NBQ25DLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVoRixNQUFNLE9BQU8sR0FPUixFQUFFLENBQUM7SUFFUixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFDdEIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLElBQUksd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO0lBRWpDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZDLE9BQU8sQ0FBQyxJQUFJ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