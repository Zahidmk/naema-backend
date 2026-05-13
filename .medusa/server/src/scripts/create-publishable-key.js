"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createPublishableKey;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function createPublishableKey({ container }) {
    const salesChannelModuleService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    console.log("🔐 Creating publishable API key and linking to Default Sales Channel (if present)...");
    const { result: apiKeys } = await (0, core_flows_1.createApiKeysWorkflow)(container).run({
        input: {
            api_keys: [
                {
                    title: "Webshop Frontend",
                    type: "publishable",
                    created_by: "",
                },
            ],
        },
    });
    const key = apiKeys?.[0];
    if (!key) {
        console.error("❌ Failed to create publishable API key");
        return;
    }
    // token is only available on creation
    if (key.token) {
        console.log(`✅ Publishable key created. Save this token now:`);
        console.log(`PUBLISHABLE_KEY=${key.token}`);
        // Persist key to backend .env and frontend .env.local for local development
        try {
            const repoRoot = process.cwd();
            const backendEnv = path_1.default.join(repoRoot, '..', '.env'); // medusa root .env
            const backendLine = `MEDUSA_PUBLISHABLE_KEY=${key.token}\n`;
            try {
                fs_1.default.appendFileSync(backendEnv, backendLine);
            }
            catch { /* ignore write errors */ }
            const frontendEnv = path_1.default.join(repoRoot, '..', '..', 'frontend', 'markasouq-web', '.env.local');
            const frontLine = `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}\n`;
            try {
                fs_1.default.appendFileSync(frontendEnv, frontLine);
            }
            catch { /* ignore write errors */ }
        }
        catch (err) {
            console.warn('Failed to persist publishable key to .env files:', err);
        }
    }
    else {
        console.log(`ℹ️ Key created with id ${key.id}, but token not returned.`);
    }
    // Link to Default Sales Channel if exists
    const channels = await salesChannelModuleService.listSalesChannels({ name: "Default Sales Channel" });
    if (channels.length) {
        await (0, core_flows_1.linkSalesChannelsToApiKeyWorkflow)(container).run({
            input: {
                id: key.id,
                add: [channels[0].id],
            },
        });
        console.log(`🔗 Linked key to sales channel: ${channels[0].name}`);
    }
    else {
        console.log("ℹ️ No Default Sales Channel found to link. You can link it later in Admin.");
    }
    console.log("✅ Done.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXB1Ymxpc2hhYmxlLWtleS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2NyZWF0ZS1wdWJsaXNoYWJsZS1rZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFNQSx1Q0EyREM7QUFoRUQscURBQW1EO0FBQ25ELDREQUFzRztBQUN0Ryw0Q0FBbUI7QUFDbkIsZ0RBQXVCO0FBRVIsS0FBSyxVQUFVLG9CQUFvQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3hFLE1BQU0seUJBQXlCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzRkFBc0YsQ0FBQyxDQUFBO0lBRW5HLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxJQUFBLGtDQUFxQixFQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNyRSxLQUFLLEVBQUU7WUFDTCxRQUFRLEVBQUU7Z0JBQ1I7b0JBQ0UsS0FBSyxFQUFFLGtCQUFrQjtvQkFDekIsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLFVBQVUsRUFBRSxFQUFFO2lCQUNmO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQTtJQUVGLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3hCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtRQUN2RCxPQUFNO0lBQ1IsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELENBQUMsQ0FBQTtRQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUMzQyw0RUFBNEU7UUFDNUUsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQzlCLE1BQU0sVUFBVSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQSxDQUFDLG1CQUFtQjtZQUN4RSxNQUFNLFdBQVcsR0FBRywwQkFBMEIsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFBO1lBQzNELElBQUksQ0FBQztnQkFBQyxZQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQTtZQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBRXRGLE1BQU0sV0FBVyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUM5RixNQUFNLFNBQVMsR0FBRyxzQ0FBc0MsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFBO1lBQ3JFLElBQUksQ0FBQztnQkFBQyxZQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQTtZQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxrREFBa0QsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN2RSxDQUFDO0lBQ0gsQ0FBQztTQUFNLENBQUM7UUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixHQUFHLENBQUMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFBO0lBQzFFLENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsTUFBTSxRQUFRLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBRSxDQUFDLENBQUE7SUFDckcsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDcEIsTUFBTSxJQUFBLDhDQUFpQyxFQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUNyRCxLQUFLLEVBQUU7Z0JBQ0wsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNWLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDdEI7U0FDRixDQUFDLENBQUE7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUNwRSxDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEVBQTRFLENBQUMsQ0FBQTtJQUMzRixDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUN4QixDQUFDIn0=