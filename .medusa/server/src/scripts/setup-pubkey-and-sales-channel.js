"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupPubKeyAndSalesChannel;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function setupPubKeyAndSalesChannel({ container }) {
    const salesChannelModuleService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const apiKeyModuleService = container.resolve(utils_1.Modules.API_KEY);
    console.log("=== Setting Up Publishable Key & Sales Channel Links ===");
    // 1. Fetch sales channels
    const salesChannels = await salesChannelModuleService.listSalesChannels({});
    console.log(`Found ${salesChannels.length} Sales Channels:`);
    salesChannels.forEach((sc) => console.log(` - ${sc.name} (${sc.id})`));
    if (!salesChannels.length) {
        console.error("❌ No sales channels found in database!");
        return;
    }
    // 2. Create publishable key
    const { result: apiKeys } = await (0, core_flows_1.createApiKeysWorkflow)(container).run({
        input: {
            api_keys: [
                {
                    title: "Webshop Storefront Key",
                    type: "publishable",
                    created_by: "system",
                },
            ],
        },
    });
    const key = apiKeys?.[0];
    if (!key || !key.token) {
        console.error("❌ Failed to create publishable API key");
        return;
    }
    console.log(`\n✅ Created Publishable API Key: ${key.token}`);
    // 3. Link key to ALL sales channels
    const channelIds = salesChannels.map((sc) => sc.id);
    await (0, core_flows_1.linkSalesChannelsToApiKeyWorkflow)(container).run({
        input: {
            id: key.id,
            add: channelIds,
        },
    });
    console.log(`🔗 Successfully linked Publishable Key to ${channelIds.length} Sales Channel(s)!`);
    // 4. Write to frontend .env.local
    const frontendEnvPath = path_1.default.join(__dirname, "..", "..", "..", "naema-frontend", ".env.local");
    const envContent = `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000\nNEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}\n`;
    fs_1.default.writeFileSync(frontendEnvPath, envContent);
    console.log(`\n✅ Updated ${frontendEnvPath} with new Publishable Key!`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtcHVia2V5LWFuZC1zYWxlcy1jaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc2V0dXAtcHVia2V5LWFuZC1zYWxlcy1jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBTUEsNkNBcURDO0FBMURELHFEQUFtRDtBQUNuRCw0REFBc0c7QUFDdEcsNENBQW1CO0FBQ25CLGdEQUF1QjtBQUVSLEtBQUssVUFBVSwwQkFBMEIsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUM5RSxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzFFLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFFOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFBO0lBRXZFLDBCQUEwQjtJQUMxQixNQUFNLGFBQWEsR0FBRyxNQUFNLHlCQUF5QixDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxhQUFhLENBQUMsTUFBTSxrQkFBa0IsQ0FBQyxDQUFBO0lBQzVELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFM0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUE7UUFDdkQsT0FBTTtJQUNSLENBQUM7SUFFRCw0QkFBNEI7SUFDNUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLElBQUEsa0NBQXFCLEVBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3JFLEtBQUssRUFBRTtZQUNMLFFBQVEsRUFBRTtnQkFDUjtvQkFDRSxLQUFLLEVBQUUsd0JBQXdCO29CQUMvQixJQUFJLEVBQUUsYUFBYTtvQkFDbkIsVUFBVSxFQUFFLFFBQVE7aUJBQ3JCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQTtJQUVGLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3hCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO1FBQ3ZELE9BQU07SUFDUixDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7SUFFNUQsb0NBQW9DO0lBQ3BDLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN4RCxNQUFNLElBQUEsOENBQWlDLEVBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3JELEtBQUssRUFBRTtZQUNMLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtZQUNWLEdBQUcsRUFBRSxVQUFVO1NBQ2hCO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsVUFBVSxDQUFDLE1BQU0sb0JBQW9CLENBQUMsQ0FBQTtJQUUvRixrQ0FBa0M7SUFDbEMsTUFBTSxlQUFlLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLENBQUE7SUFDOUYsTUFBTSxVQUFVLEdBQUcsNEZBQTRGLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQTtJQUM1SCxZQUFFLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsZUFBZSw0QkFBNEIsQ0FBQyxDQUFBO0FBQ3pFLENBQUMifQ==