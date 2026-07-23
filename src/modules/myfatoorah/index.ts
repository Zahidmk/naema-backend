import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { MyFatoorahProviderService } from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [MyFatoorahProviderService],
})
