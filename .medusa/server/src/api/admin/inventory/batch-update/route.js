"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * POST /admin/inventory/batch-update
 * Batch update inventory stock quantities from External ERP
 */
const POST = async (req, res) => {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            type: "invalid_data",
            message: "updates array is required",
        });
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const results = [];
    let updated = 0;
    let failed = 0;
    for (const update of updates) {
        try {
            const { sku, stocked_quantity } = update;
            if (!sku || stocked_quantity === undefined) {
                results.push({
                    sku: sku || "unknown",
                    status: "failed",
                    error: "sku and stocked_quantity are required",
                });
                failed++;
                continue;
            }
            // Find inventory item by SKU
            const inventoryResult = await pgConnection.raw(`SELECT ii.id, il.id as level_id, il.stocked_quantity 
         FROM inventory_item ii 
         LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id 
         WHERE ii.sku = ?`, [sku]);
            if (!inventoryResult.rows || inventoryResult.rows.length === 0) {
                results.push({
                    sku,
                    status: "failed",
                    error: "Inventory item not found",
                });
                failed++;
                continue;
            }
            const inventoryItem = inventoryResult.rows[0];
            // Update inventory level
            if (inventoryItem.level_id) {
                await pgConnection.raw(`UPDATE inventory_level SET stocked_quantity = ? WHERE id = ?`, [stocked_quantity, inventoryItem.level_id]);
            }
            else {
                // Create inventory level if not exists
                const locationResult = await pgConnection.raw(`SELECT id FROM stock_location LIMIT 1`);
                if (locationResult.rows && locationResult.rows.length > 0) {
                    const locationId = locationResult.rows[0].id;
                    await pgConnection.raw(`INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at)
             VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`, [`iloc_${Date.now()}`, inventoryItem.id, locationId, stocked_quantity]);
                }
            }
            results.push({
                sku,
                status: "updated",
                stocked_quantity,
            });
            updated++;
        }
        catch (error) {
            results.push({
                sku: update.sku || "unknown",
                status: "failed",
                error: error.message,
            });
            failed++;
        }
    }
    res.json({
        success: failed === 0,
        updated,
        failed,
        results,
    });
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2ludmVudG9yeS9iYXRjaC11cGRhdGUvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXNFO0FBRXRFOzs7R0FHRztBQUNJLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNwRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBRXZCLENBQUM7SUFFRixJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ3hDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSSxFQUFFLGNBQWM7WUFDcEIsT0FBTyxFQUFFLDJCQUEyQjtTQUNyQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFaEYsTUFBTSxPQUFPLEdBS1IsRUFBRSxDQUFDO0lBRVIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUVmLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDO1lBQ0gsTUFBTSxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLE1BQU0sQ0FBQztZQUV6QyxJQUFJLENBQUMsR0FBRyxJQUFJLGdCQUFnQixLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUMzQyxP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