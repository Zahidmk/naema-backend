import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createApiKeysWorkflow, linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"

export default async function setupPubKeyAndSalesChannel({ container }: ExecArgs) {
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const apiKeyModuleService = container.resolve(Modules.API_KEY)

  console.log("=== Setting Up Publishable Key & Sales Channel Links ===")

  // 1. Fetch sales channels
  const salesChannels = await salesChannelModuleService.listSalesChannels({})
  console.log(`Found ${salesChannels.length} Sales Channels:`)
  salesChannels.forEach((sc: any) => console.log(` - ${sc.name} (${sc.id})`))

  if (!salesChannels.length) {
    console.error("❌ No sales channels found in database!")
    return
  }

  // 2. Create publishable key
  const { result: apiKeys } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Webshop Storefront Key",
          type: "publishable",
          created_by: "system",
        },
      ],
    },
  })

  const key = apiKeys?.[0]
  if (!key || !key.token) {
    console.error("❌ Failed to create publishable API key")
    return
  }

  console.log(`\n✅ Created Publishable API Key: ${key.token}`)

  // 3. Link key to ALL sales channels
  const channelIds = salesChannels.map((sc: any) => sc.id)
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: key.id,
      add: channelIds,
    },
  })

  console.log(`🔗 Successfully linked Publishable Key to ${channelIds.length} Sales Channel(s)!`)

  // 4. Write to frontend .env.local
  const frontendEnvPath = path.join(__dirname, "..", "..", "..", "naema-frontend", ".env.local")
  const envContent = `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000\nNEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}\n`
  fs.writeFileSync(frontendEnvPath, envContent)
  console.log(`\n✅ Updated ${frontendEnvPath} with new Publishable Key!`)
}
