"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
/**
 * POST /store/customers/me/fcm-token
 * Save or update the Flutter FCM device token for push notifications
 *
 * Flutter calls this:
 * 1. After login/register — save FCM token
 * 2. When Firebase refreshes token — update FCM token
 */
const POST = async (req, res) => {
    const customerId = req.auth_context?.actor_id;
    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { fcm_token, device_type } = req.body;
    if (!fcm_token) {
        return res.status(400).json({ message: "fcm_token is required" });
    }
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    try {
        // Get current metadata
        const result = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ?`, [customerId]);
        if (!result.rows?.length) {
            return res.status(404).json({ message: "Customer not found" });
        }
        const currentMetadata = result.rows[0].metadata || {};
        // Save FCM token in customer metadata
        const updatedMetadata = {
            ...currentMetadata,
            fcm_token,
            fcm_device_type: device_type || "android",
            fcm_token_updated_at: new Date().toISOString(),
        };
        await pgConnection.raw(`UPDATE customer SET metadata = ?, updated_at = NOW() WHERE id = ?`, [JSON.stringify(updatedMetadata), customerId]);
        console.log(`[FCM] Token saved for customer ${customerId}`);
        return res.json({ success: true, message: "FCM token saved" });
    }
    catch (error) {
        console.error("[FCM] Error saving token:", error);
        return res.status(500).json({ message: error.message });
    }
};
exports.POST = POST;
/**
 * DELETE /store/customers/me/fcm-token
 * Remove FCM token on logout
 */
const DELETE = async (req, res) => {
    const customerId = req.auth_context?.actor_id;
    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    try {
        const result = await pgConnection.raw(`SELECT metadata FROM customer WHERE id = ?`, [customerId]);
        const currentMetadata = result.rows[0]?.metadata || {};
        const { fcm_token, fcm_device_type, fcm_token_updated_at, ...rest } = currentMetadata;
        await pgConnection.raw(`UPDATE customer SET metadata = ?, updated_at = NOW() WHERE id = ?`, [JSON.stringify(rest), customerId]);
        return res.json({ success: true, message: "FCM token removed" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.DELETE = DELETE;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2N1c3RvbWVycy9tZS9mY20tdG9rZW4vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXNFO0FBRXRFOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDcEUsTUFBTSxVQUFVLEdBQUksR0FBVyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFdkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFHdEMsQ0FBQztJQUVGLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVoRixJQUFJLENBQUM7UUFDSCx1QkFBdUI7UUFDdkIsTUFBTSxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNuQyw0Q0FBNEMsRUFDNUMsQ0FBQyxVQUFVLENBQUMsQ0FDYixDQUFDO1FBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDekIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FB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