"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedProperCustomer;
const utils_1 = require("@medusajs/framework/utils");
async function seedProperCustomer({ container }) {
    const authModuleService = container.resolve(utils_1.Modules.AUTH);
    const customerModuleService = container.resolve(utils_1.Modules.CUSTOMER);
    const email = "customer@example.com";
    const password = "password123";
    console.log("=== Creating/Resetting Customer Auth ===");
    // Delete any existing auth identities for customer@example.com
    const existingAuths = await authModuleService.listAuthIdentities({
        provider_identities: {
            entity_id: email,
            provider: "emailpass"
        }
    });
    if (existingAuths.length > 0) {
        console.log(`Deleting ${existingAuths.length} existing auth identity for ${email}...`);
        await authModuleService.deleteAuthIdentities(existingAuths.map((a) => a.id));
    }
    // Register auth identity via auth module service using emailpass provider
    const authIdentity = await authModuleService.register("emailpass", {
        body: {
            email,
            password,
        }
    });
    console.log(`✅ Registered auth identity: ${authIdentity.authIdentity.id}`);
    // Find or create customer entity
    const customers = await customerModuleService.listCustomers({ email });
    let customer;
    if (customers.length > 0) {
        customer = customers[0];
    }
    else {
        customer = await customerModuleService.createCustomers({
            email,
            first_name: "Test",
            last_name: "Customer",
            has_account: true,
        });
    }
    // Link auth identity to customer
    await authModuleService.updateAuthIdentities([{
            id: authIdentity.authIdentity.id,
            app_metadata: {
                customer_id: customer.id
            }
        }]);
    console.log(`🔗 Linked auth identity to customer: ${customer.id}`);
    console.log(`\n🎉 Customer Credentials set successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1wcm9wZXItY3VzdG9tZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9zZWVkLXByb3Blci1jdXN0b21lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHFDQTBEQztBQTVERCxxREFBbUQ7QUFFcEMsS0FBSyxVQUFVLGtCQUFrQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3RFLE1BQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDekQsTUFBTSxxQkFBcUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUVqRSxNQUFNLEtBQUssR0FBRyxzQkFBc0IsQ0FBQTtJQUNwQyxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUE7SUFFOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO0lBRXZELCtEQUErRDtJQUMvRCxNQUFNLGFBQWEsR0FBRyxNQUFNLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDO1FBQy9ELG1CQUFtQixFQUFFO1lBQ25CLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFFBQVEsRUFBRSxXQUFXO1NBQ3RCO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxhQUFhLENBQUMsTUFBTSwrQkFBK0IsS0FBSyxLQUFLLENBQUMsQ0FBQTtRQUN0RixNQUFNLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ25GLENBQUM7SUFFRCwwRUFBMEU7SUFDMUUsTUFBTSxZQUFZLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFO1FBQ2pFLElBQUksRUFBRTtZQUNKLEtBQUs7WUFDTCxRQUFRO1NBQ1Q7S0FDRixDQUFDLENBQUE7SUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixZQUFZLENBQUMsWUFBYSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFM0UsaUNBQWlDO0lBQ2pDLE1BQU0sU0FBUyxHQUFHLE1BQU0scUJBQXFCLENBQUMsYUFBYSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUN0RSxJQUFJLFFBQVEsQ0FBQTtJQUNaLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN6QixRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pCLENBQUM7U0FBTSxDQUFDO1FBQ04sUUFBUSxHQUFHLE1BQU0scUJBQXFCLENBQUMsZUFBZSxDQUFDO1lBQ3JELEtBQUs7WUFDTCxVQUFVLEVBQUUsTUFBTTtZQUNsQixTQUFTLEVBQUUsVUFBVTtZQUNyQixXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLE1BQU0saUJBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM1QyxFQUFFLEVBQUUsWUFBWSxDQUFDLFlBQWEsQ0FBQyxFQUFFO1lBQ2pDLFlBQVksRUFBRTtnQkFDWixXQUFXLEVBQUUsUUFBUSxDQUFDLEVBQUU7YUFDekI7U0FDRixDQUFDLENBQUMsQ0FBQTtJQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQTtJQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3pDLENBQUMifQ==