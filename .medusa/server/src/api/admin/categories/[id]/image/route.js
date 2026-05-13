"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * GET /admin/categories/:id/image
 * Get category image
 */
const GET = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id } = req.params;
    try {
        const result = await pgConnection.raw(`SELECT id, name, handle, metadata FROM product_category WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Category not found",
            });
        }
        const category = result.rows[0];
        const metadata = category.metadata || {};
        res.json({
            category: {
                id: category.id,
                name: category.name,
                handle: category.handle,
                image_url: metadata.image_url || null,
                icon: metadata.icon || null,
            },
        });
    }
    catch (error) {
        console.error("[Category Image] GET error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.GET = GET;
/**
 * POST /admin/categories/:id/image
 * Update category image
 *
 * Request body:
 * {
 *   "image_url": "https://example.com/image.jpg",
 *   "icon": "smartphone" // optional icon name
 * }
 */
const POST = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id } = req.params;
    const { image_url, icon } = req.body;
    try {
        // Check if category exists
        const existing = await pgConnection.raw(`SELECT id, name, handle, metadata FROM product_category WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (!existing.rows || existing.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Category not found",
            });
        }
        const currentMetadata = existing.rows[0].metadata || {};
        const newMetadata = {
            ...currentMetadata,
            ...(image_url !== undefined && { image_url }),
            ...(icon !== undefined && { icon }),
        };
        // Update metadata
        await pgConnection.raw(`UPDATE product_category SET metadata = ?, updated_at = NOW() WHERE id = ?`, [JSON.stringify(newMetadata), id]);
        res.json({
            success: true,
            category: {
                id: existing.rows[0].id,
                name: existing.rows[0].name,
                handle: existing.rows[0].handle,
                image_url: newMetadata.image_url || null,
                icon: newMetadata.icon || null,
            },
        });
    }
    catch (error) {
        console.error("[Category Image] POST error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.POST = POST;
/**
 * DELETE /admin/categories/:id/image
 * Remove category image
 */
const DELETE = async (req, res) => {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { id } = req.params;
    try {
        // Check if category exists
        const existing = await pgConnection.raw(`SELECT id, metadata FROM product_category WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (!existing.rows || existing.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Category not found",
            });
        }
        const currentMetadata = existing.rows[0].metadata || {};
        delete currentMetadata.image_url;
        delete currentMetadata.icon;
        // Update metadata
        await pgConnection.raw(`UPDATE product_category SET metadata = ?, updated_at = NOW() WHERE id = ?`, [JSON.stringify(currentMetadata), id]);
        res.json({
            success: true,
            message: "Category image removed",
        });
    }
    catch (error) {
        console.error("[Category Image] DELETE error:", error);
        res.status(500).json({
            type: "server_error",
            message: error.message,
        });
    }
};
exports.DELETE = DELETE;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2NhdGVnb3JpZXMvW2lkXS9pbWFnZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxREFBc0U7QUFFdEU7OztHQUdHO0FBQ0ksTUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFFLEdBQWtCLEVBQUUsR0FBbUIsRUFBRSxFQUFFO0lBQ25FLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBRTFCLElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDbkMsNkZBQTZGLEVBQzdGLENBQUMsRUFBRSxDQUFDLENBQ0wsQ0FBQztRQUVGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzdDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLElBQUksRUFBRSxXQUFXO2dCQUNqQixPQUFPLEVBQUUsb0JBQW9CO2FBQzlCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO1FBRXpDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxRQUFRLEVBQUU7Z0JBQ1IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUNmLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtnQkFDbkIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO2dCQUN2QixTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsSUFBSSxJQUFJO2dCQUNyQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJO2FBQzVCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixJQUFJLEVBQUUsY0FBYztZQUNwQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87U0FDdkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUMsQ0FBQztBQXBDVyxRQUFBLEdBQUcsT0FvQ2Q7QUFFRjs7Ozs7Ozs7O0dBU0c7QUFDSSxNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDcEUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEYsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDMUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBNkMsQ0FBQztJQUU5RSxJQUFJLENBQUM7UUFDSCwyQkFBMkI7UUFDM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNyQyw2RkFBNkYsRUFDN0YsQ0FBQyxFQUFFLENBQUMsQ0FDTCxDQUFDO1FBRUYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDakQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDMUIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLE9BQU8sRUFBRSxvQkFBb0I7YUFDOUIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUN4RCxNQUFNLFdBQVcsR0FBRztZQUNsQixHQUFHLGVBQWU7WUFDbEIsR0FBRyxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUM3QyxHQUFHLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ3BDLENBQUM7UUFFRixrQkFBa0I7UUFDbEIsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNwQiwyRUFBMkUsRUFDM0UsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNsQyxDQUFDO1FBRUYsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNQLE9BQU8sRUFBRSxJQUFJO1lBQ2IsUUFBUSxFQUFFO2dCQUNSLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQzNCLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07Z0JBQy9CLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxJQUFJLElBQUk7Z0JBQ3hDLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSSxJQUFJLElBQUk7YUFDL0I7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLElBQUksRUFBRSxjQUFjO1lBQ3BCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztTQUN2QixDQUFDLENBQUM7SUFDTCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBakRXLFFBQUEsSUFBSSxRQWlEZjtBQUVGOzs7R0FHRztBQUNJLE1BQU0sTUFBTSxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUN0RSxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUUxQixJQUFJLENBQUM7UUFDSCwyQkFBMkI7UUFDM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNyQywrRUFBK0UsRUFDL0UsQ0FBQyxFQUFFLENBQUMsQ0FDTCxDQUFDO1FBRUYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDakQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDMUIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLE9BQU8sRUFBRSxvQkFBb0I7YUFDOUIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUN4RCxPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUM7UUFDakMsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDO1FBRTVCLGtCQUFrQjtRQUNsQixNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3BCLDJFQUEyRSxFQUMzRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3RDLENBQUM7UUFFRixHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsT0FBTyxFQUFFLElBQUk7WUFDYixPQUFPLEVBQUUsd0JBQXdCO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsSUFBSSxFQUFFLGNBQWM7WUFDcEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO1NBQ3ZCLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDLENBQUM7QUF2Q1csUUFBQSxNQUFNLFVBdUNqQiJ9