"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
/**
 * POST /store/account/delete
 * Delete customer account (soft delete / anonymize)
 *
 * Body: { customer_id, email, reason? }
 */
async function POST(req, res) {
    const pgConnection = req.scope.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    const { customer_id, email, reason } = req.body;
    if (!customer_id && !email) {
        return res.status(400).json({
            type: "invalid_data",
            message: "customer_id or email is required",
        });
    }
    try {
        // Find the customer
        let customerResult;
        if (customer_id) {
            customerResult = await pgConnection.raw(`SELECT id, email, first_name, last_name FROM customer WHERE id = ? AND deleted_at IS NULL`, [customer_id]);
        }
        else {
            customerResult = await pgConnection.raw(`SELECT id, email, first_name, last_name FROM customer WHERE email = ? AND deleted_at IS NULL`, [email]);
        }
        if (!customerResult.rows || customerResult.rows.length === 0) {
            return res.status(404).json({
                type: "not_found",
                message: "Customer not found",
            });
        }
        const customer = customerResult.rows[0];
        // Soft delete the customer (set deleted_at timestamp)
        await pgConnection.raw(`UPDATE customer SET deleted_at = NOW(), metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{deletion_reason}',
        ?::jsonb
      ) WHERE id = ?`, [JSON.stringify(reason || "Customer requested deletion"), customer.id]);
        // Anonymize customer addresses
        await pgConnection.raw(`UPDATE customer_address SET 
        first_name = 'Deleted',
        last_name = 'User',
        phone = NULL,
        address_1 = 'Deleted',
        address_2 = NULL,
        deleted_at = NOW()
      WHERE customer_id = ?`, [customer.id]);
        // Remove auth identity link (prevent login)
        try {
            await pgConnection.raw(`DELETE FROM provider_identity WHERE entity_id = ?`, [customer.email]);
        }
        catch (err) {
            // Auth identity may not exist, that's ok
            console.warn("[Delete Account] Could not remove auth identity:", err);
        }
        res.json({
            success: true,
            message: "Account has been deleted successfully",
            deleted_customer_id: customer.id,
        });
    }
    catch (error) {
        console.error("[Delete Account] Error:", error);
        res.status(500).json({ type: "server_error", message: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2FjY291bnQvZGVsZXRlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBU0Esb0JBa0ZDO0FBMUZELHFEQUFxRTtBQUVyRTs7Ozs7R0FLRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMvRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFJMUMsQ0FBQTtJQUVELElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksRUFBRSxjQUFjO1lBQ3BCLE9BQU8sRUFBRSxrQ0FBa0M7U0FDNUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQztRQUNILG9CQUFvQjtRQUNwQixJQUFJLGNBQWMsQ0FBQTtRQUNsQixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLGNBQWMsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3JDLDJGQUEyRixFQUMzRixDQUFDLFdBQVcsQ0FBQyxDQUNkLENBQUE7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLGNBQWMsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLENBQ3JDLDhGQUE4RixFQUM5RixDQUFDLEtBQUssQ0FBQyxDQUNSLENBQUE7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDN0QsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDMUIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLE9BQU8sRUFBRSxvQkFBb0I7YUFDOUIsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFdkMsc0RBQXNEO1FBQ3RELE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDcEI7Ozs7cUJBSWUsRUFDZixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLDZCQUE2QixDQUFDLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUN2RSxDQUFBO1FBRUQsK0JBQStCO1FBQy9CLE1BQU0sWUFBWSxDQUFDLEdBQUcsQ0FDcEI7Ozs7Ozs7NEJBT3NCLEVBQ3RCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUNkLENBQUE7UUFFRCw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxZQUFZLENBQUMsR0FBRyxDQUNwQixtREFBbUQsRUFDbkQsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQ2pCLENBQUE7UUFDSCxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLHlDQUF5QztZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZFLENBQUM7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsT0FBTyxFQUFFLElBQUk7WUFDYixPQUFPLEVBQUUsdUNBQXVDO1lBQ2hELG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxFQUFFO1NBQ2pDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDL0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUN4RSxDQUFDO0FBQ0gsQ0FBQyJ9