"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /odoo/inventory
 * Get inventory for Odoo sync
 */
const GET = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { limit = "100", offset = "0", sku, low_stock, include_products, } = req.query;
    try {
        let whereClause = "WHERE 1=1";
        const params = [];
        if (sku) {
            whereClause += ` AND ii.sku ILIKE ?`;
            params.push(`%${sku}%`);
        }
        // Low stock threshold (default 10)
        if (low_stock === "true") {
            const threshold = 10;
            whereClause += ` AND COALESCE(il.stocked_quantity, 0) < ?`;
            params.push(threshold);
        }
        // Get total count
        const countResult = await pgConnection.raw(`SELECT COUNT(*) as total 
       FROM inventory_item ii
       LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id
       ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].total) || 0;
        // Get inventory items
        const inventoryResult = await pgConnection.raw(`SELECT 
        ii.id,
        ii.sku,
        ii.title,
        ii.description,
        ii.origin_country,
        ii.weight,
        ii.created_at,
        ii.updated_at,
        il.id as level_id,
        il.stocked_quantity,
        il.reserved_quantity,
        il.incoming_quantity,
        sl.id as location_id,
        sl.name as location_name
       FROM inventory_item ii
       LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id
       LEFT JOIN stock_location sl ON il.location_id = sl.id
       ${whereClause}
       ORDER BY ii.sku
       LIMIT ? OFFSET ?`, [...params, parseInt(limit), parseInt(offset)]);
        // Get product details if requested
        let inventory = inventoryResult.rows;
        if (include_products === "true") {
            inventory = await Promise.all(inventoryResult.rows.map(async (item) => {
                // Find product variant with this SKU
                const variantResult = await pgConnection.raw(`SELECT 
              pv.id as variant_id,
              pv.title as variant_title,
              pv.barcode,
              p.id as product_id,
              p.title as product_title,
              p.handle as product_handle
             FROM product_variant pv
             JOIN product p ON pv.product_id = p.id
             WHERE pv.sku = ?`, [item.sku]);
                return {
                    ...item,
                    available_quantity: (item.stocked_quantity || 0) - (item.reserved_quantity || 0),
                    product: variantResult.rows[0] || null,
                };
            }));
        }
        else {
            inventory = inventory.map((item) => ({
                ...item,
                available_quantity: (item.stocked_quantity || 0) - (item.reserved_quantity || 0),
            }));
        }
        res.json({
            inventory,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: parseInt(offset) + inventory.length < total,
            },
        });
    }
    catch (error) {
        console.error("[Odoo Inventory] Error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.GET = GET;
/**
 * POST /odoo/inventory
 * Batch sync inventory from Odoo
 */
const POST = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            type: "invalid_data",
            message: "items array is required",
        });
    }
    const results = [];
    let synced = 0;
    let failed = 0;
    for (const item of items) {
        try {
            const { sku, quantity, title } = item;
            if (!sku || quantity === undefined) {
                results.push({
                    sku: sku || "unknown",
                    status: "failed",
                    error: "sku and quantity are required",
                });
                failed++;
                continue;
            }
            // Find or create inventory item
            let inventoryItemId = null;
            let levelId = null;
            let previousQuantity = 0;
            const existingResult = await pgConnection.raw(`SELECT ii.id, il.id as level_id, il.stocked_quantity
         FROM inventory_item ii
         LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id
         WHERE ii.sku = ?`, [sku]);
            if (existingResult.rows && existingResult.rows.length > 0) {
                inventoryItemId = existingResult.rows[0].id;
                levelId = existingResult.rows[0].level_id;
                previousQuantity = existingResult.rows[0].stocked_quantity || 0;
            }
            if (!inventoryItemId) {
                // Create new inventory item
                const newId = `iitem_odoo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await pgConnection.raw(`INSERT INTO inventory_item (id, sku, title, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())`, [newId, sku, title || sku]);
                inventoryItemId = newId;
            }
            else if (title) {
                // Update title if provided
                await pgConnection.raw(`UPDATE inventory_item SET title = ?, updated_at = NOW() WHERE id = ?`, [title, inventoryItemId]);
            }
            // Get default location
            const locationResult = await pgConnection.raw(`SELECT id FROM stock_location LIMIT 1`);
            if (!locationResult.rows || locationResult.rows.length === 0) {
                results.push({
                    sku,
                    status: "failed",
                    error: "No stock location found",
                });
                failed++;
                continue;
            }
            const locationId = locationResult.rows[0].id;
            // Update or create inventory level
            if (levelId) {
                await pgConnection.raw(`UPDATE inventory_level 
           SET stocked_quantity = ?, updated_at = NOW() 
           WHERE id = ?`, [quantity, levelId]);
            }
            else {
                const newLevelId = `iloc_odoo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await pgConnection.raw(`INSERT INTO inventory_level 
           (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`, [newLevelId, inventoryItemId, locationId, quantity]);
            }
            results.push({
                sku,
                status: "synced",
                previous_quantity: previousQuantity,
                new_quantity: quantity,
            });
            synced++;
        }
        catch (error) {
            results.push({
                sku: item.sku || "unknown",
                status: "failed",
                error: error.message,
            });
            failed++;
        }
    }
    res.json({
        success: failed === 0,
        summary: {
            total: items.length,
            synced,
            failed,
        },
        results,
    });
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL29kb28vaW52ZW50b3J5L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHFEQUFzRTtBQUV0RTs7O0dBR0c7QUFDSSxNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDbkUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFaEYsTUFBTSxFQUNKLEtBQUssR0FBRyxLQUFLLEVBQ2IsTUFBTSxHQUFHLEdBQUcsRUFDWixHQUFHLEVBQ0gsU0FBUyxFQUNULGdCQUFnQixHQUNqQixHQUFHLEdBQUcsQ0FBQyxLQU1QLENBQUM7SUFFRixJQUFJLENBQUM7UUFDSCxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDOUIsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO1FBRXpCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDUixXQUFXLElBQUkscUJBQXFCLENBQUM7WUFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVELG1DQUFtQztRQUNuQyxJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUN6QixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDckIsV0FBVyxJQUFJLDJDQUEyQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixNQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3hDOzs7U0FHRyxXQUFXLEVBQUUsRUFDaEIsTUFBTSxDQUNQLENBQUM7UUFDRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLElB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