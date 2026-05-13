"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
/**
 * POST /store/account/change-password
 * Change customer password
 *
 * Body: { customer_id, current_password, new_password }
 */
async function POST(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { email, current_password, new_password } = req.body;
    if (!email || !new_password) {
        return res.status(400).json({
            type: "invalid_data",
            message: "email and new_password are required",
        });
    }
    if (new_password.length < 6) {
        return res.status(400).json({
            type: "invalid_data",
            message: "Password must be at least 6 characters",
        });
    }
    try {
        // Find auth identity for this email
        const authResult = await pgConnection.raw(`SELECT pi.id, pi.entity_id
       FROM provider_identity pi
       WHERE pi.entity_id = ? AND pi.provider = 'emailpass'`, [email]);
        if (!authResult.rows || authResult.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Account not found",
            });
        }
        // Update the password in provider_identity
        // MedusaJS stores hashed passwords - we need to use the auth module
        // For now, return guidance to use the standard Medusa auth flow
        res.json({
            success: true,
            message: "Password change request received. Please use the standard reset password flow via /auth/customer/emailpass endpoint.",
            reset_password_endpoint: "/auth/customer/emailpass",
            instructions: "Send POST to /auth/customer/emailpass with { email } to receive a reset token, then use the token to set a new password.",
        });
    }
    catch (error) {
        console.error("[Change Password] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2FjY291bnQvY2hhbmdlLXBhc3N3b3JkL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBU0Esb0JBbURDO0FBM0RELHFEQUFxRTtBQUVyRTs7Ozs7R0FLRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMvRSxNQUFNLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUlyRCxDQUFBO0lBRUQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzVCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSSxFQUFFLGNBQWM7WUFDcEIsT0FBTyxFQUFFLHFDQUFxQztTQUMvQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSSxFQUFFLGNBQWM7WUFDcEIsT0FBTyxFQUFFLHdDQUF3QztTQUNsRCxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gsb0NBQW9DO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDdkM7OzREQUVzRCxFQUN0RCxDQUFDLEtBQUssQ0FBQyxDQUNSLENBQUE7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNyRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMxQixJQUFJLEVBQUUsV0FBVztnQkFDakIsT0FBTyxFQUFFLG1CQUFtQjthQUM3QixDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsMkNBQTJDO1FBQzNDLG9FQUFvRTtRQUNwRSxnRUFBZ0U7UUFDaEUsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNQLE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTyxFQUFFLHNIQUFzSDtZQUMvSCx1QkFBdUIsRUFBRSwwQkFBMEI7WUFDbkQsWUFBWSxFQUFFLDBIQUEwSDtTQUN6SSxDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ2hELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDeEUsQ0FBQztBQUNILENBQUMifQ==