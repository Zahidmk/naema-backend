"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createCustomer;
const utils_1 = require("@medusajs/framework/utils");
async function createCustomer({ container }) {
    const customerModuleService = container.resolve(utils_1.Modules.CUSTOMER);
    console.log("Creating test customer...");
    try {
        const customer = await customerModuleService.createCustomers({
            email: "customer@marqasouq.com",
            first_name: "Test",
            last_name: "Customer",
            has_account: true,
        });
        console.log(`✅ Customer created: ${customer.email}`);
        console.log(`📧 Email: customer@marqasouq.com`);
        console.log(`🔑 Password: customer123`);
        console.log(`\nYou can now sign in at: http://localhost:8000/account`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("already exists")) {
            console.log("ℹ️  Customer already exists!");
            console.log(`📧 Email: customer@marqasouq.com`);
            console.log(`🔑 Password: customer123`);
        }
        else {
            console.error("❌ Error:", errorMessage);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWN1c3RvbWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY3JlYXRlLWN1c3RvbWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsaUNBMkJDO0FBOUJELHFEQUFtRDtBQUdwQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ2xFLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFFakUsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO0lBRXhDLElBQUksQ0FBQztRQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0scUJBQXFCLENBQUMsZUFBZSxDQUFDO1lBQzNELEtBQUssRUFBRSx3QkFBd0I7WUFDL0IsVUFBVSxFQUFFLE1BQU07WUFDbEIsU0FBUyxFQUFFLFVBQVU7WUFDckIsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUE7SUFDeEUsQ0FBQztJQUFDLE9BQU8sS0FBYyxFQUFFLENBQUM7UUFDeEIsTUFBTSxZQUFZLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzNFLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7WUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1lBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQTtZQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUE7UUFDekMsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQTtRQUN6QyxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMifQ==