"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixCustomerAuth;
const utils_1 = require("@medusajs/framework/utils");
const crypto_1 = require("crypto");
async function fixCustomerAuth({ container }) {
    const customerModuleService = container.resolve(utils_1.Modules.CUSTOMER);
    const authModuleService = container.resolve(utils_1.Modules.AUTH);
    const email = "customer@example.com";
    const password = "password123";
    console.log("🔧 Fixing customer auth identity...");
    try {
        // 1. Find or create the customer
        let customer;
        const existingCustomers = await customerModuleService.listCustomers({ email });
        if (existingCustomers.length > 0) {
            customer = existingCustomers[0];
            console.log(`✅ Found existing customer: ${customer.id}`);
        }
        else {
            customer = await customerModuleService.createCustomers({
                email,
                first_name: "Test",
                last_name: "Customer",
                has_account: true,
            });
            console.log(`✅ Created customer: ${customer.id}`);
        }
        // 2. Check if auth identity exists
        const authIdentities = await authModuleService.listAuthIdentities({
            provider_identities: {
                entity_id: email,
                provider: "emailpass"
            }
        });
        if (authIdentities.length > 0) {
            console.log(`ℹ️  Auth identity already exists for ${email}`);
            // Update the provider identity to link to customer
            const authIdentity = authIdentities[0];
            const providerIdentity = authIdentity.provider_identities?.find((pi) => pi.provider === "emailpass");
            if (providerIdentity) {
                // Hash password
                const hashedPassword = (0, crypto_1.createHash)("sha256").update(password).digest("hex");
                await authModuleService.updateProviderIdentities([{
                        id: providerIdentity.id,
                        provider_metadata: {
                            password: hashedPassword
                        }
                    }]);
                console.log(`✅ Updated auth identity password`);
            }
            // Link auth identity to customer if not linked
            if (!authIdentity.app_metadata?.customer_id) {
                await authModuleService.updateAuthIdentities([{
                        id: authIdentity.id,
                        app_metadata: {
                            customer_id: customer.id
                        }
                    }]);
                console.log(`✅ Linked auth identity to customer`);
            }
        }
        else {
            // Create new auth identity with proper password hash
            const hashedPassword = (0, crypto_1.createHash)("sha256").update(password).digest("hex");
            const authIdentity = await authModuleService.createAuthIdentities({
                provider_identities: [{
                        entity_id: email,
                        provider: "emailpass",
                        provider_metadata: {
                            password: hashedPassword
                        }
                    }],
                app_metadata: {
                    customer_id: customer.id
                }
            });
            console.log(`✅ Created auth identity: ${authIdentity.id}`);
        }
        console.log(`\n🎉 Customer auth fixed!`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`\nNow try logging in via POST /auth/customer/emailpass`);
    }
    catch (error) {
        console.error("❌ Error:", error);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LWN1c3RvbWVyLWF1dGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9maXgtY3VzdG9tZXItYXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGtDQThGQztBQWxHRCxxREFBbUQ7QUFFbkQsbUNBQW1DO0FBRXBCLEtBQUssVUFBVSxlQUFlLENBQUMsRUFBRSxTQUFTLEVBQVk7SUFDbkUsTUFBTSxxQkFBcUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNqRSxNQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRXpELE1BQU0sS0FBSyxHQUFHLHNCQUFzQixDQUFBO0lBQ3BDLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQTtJQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUE7SUFFbEQsSUFBSSxDQUFDO1FBQ0gsaUNBQWlDO1FBQ2pDLElBQUksUUFBUSxDQUFBO1FBQ1osTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7UUFFOUUsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDakMsUUFBUSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzFELENBQUM7YUFBTSxDQUFDO1lBQ04sUUFBUSxHQUFHLE1BQU0scUJBQXFCLENBQUMsZUFBZSxDQUFDO2dCQUNyRCxLQUFLO2dCQUNMLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixTQUFTLEVBQUUsVUFBVTtnQkFDckIsV0FBVyxFQUFFLElBQUk7YUFDbEIsQ0FBQyxDQUFBO1lB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