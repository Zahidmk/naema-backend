import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function seedProperCustomer({ container }: ExecArgs) {
  const authModuleService = container.resolve(Modules.AUTH)
  const customerModuleService = container.resolve(Modules.CUSTOMER)

  const email = "customer@example.com"
  const password = "password123"

  console.log("=== Creating/Resetting Customer Auth ===")

  // Delete any existing auth identities for customer@example.com
  const existingAuths = await authModuleService.listAuthIdentities({
    provider_identities: {
      entity_id: email,
      provider: "emailpass"
    }
  })

  if (existingAuths.length > 0) {
    console.log(`Deleting ${existingAuths.length} existing auth identity for ${email}...`)
    await authModuleService.deleteAuthIdentities(existingAuths.map((a: any) => a.id))
  }

  // Register auth identity via auth module service using emailpass provider
  const authIdentity = await authModuleService.register("emailpass", {
    body: {
      email,
      password,
    }
  })

  console.log(`✅ Registered auth identity: ${authIdentity.authIdentity!.id}`)

  // Find or create customer entity
  const customers = await customerModuleService.listCustomers({ email })
  let customer
  if (customers.length > 0) {
    customer = customers[0]
  } else {
    customer = await customerModuleService.createCustomers({
      email,
      first_name: "Test",
      last_name: "Customer",
      has_account: true,
    })
  }

  // Link auth identity to customer
  await authModuleService.updateAuthIdentities([{
    id: authIdentity.authIdentity!.id,
    app_metadata: {
      customer_id: customer.id
    }
  }])

  console.log(`🔗 Linked auth identity to customer: ${customer.id}`)
  console.log(`\n🎉 Customer Credentials set successfully!`)
  console.log(`📧 Email: ${email}`)
  console.log(`🔑 Password: ${password}`)
}
