"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const seller_1 = __importDefault(require("./models/seller"));
const seller_request_1 = __importDefault(require("./models/seller_request"));
const seller_product_link_1 = __importDefault(require("./models/seller_product_link"));
class SellerService extends (0, utils_1.MedusaService)({ Seller: seller_1.default, SellerRequest: seller_request_1.default, SellerProductLink: seller_product_link_1.default }) {
    async addProductToSeller(seller_id, product_id, display_order = 0) {
        const existing = await this.listSellerProductLinks({ seller_id, product_id });
        if (existing.length)
            return existing[0];
        return this.createSellerProductLinks({ seller_id, product_id, display_order });
    }
    async removeProductFromSeller(seller_id, product_id) {
        const [links] = await this.listAndCountSellerProductLinks({ seller_id, product_id }, { take: 1 });
        if (links?.length) {
            await this.deleteSellerProductLinks({ id: links[0].id });
        }
    }
}
exports.default = SellerService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3NlbGxlcnMvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUF5RDtBQUN6RCw2REFBb0M7QUFDcEMsNkVBQW1EO0FBQ25ELHVGQUE0RDtBQUU1RCxNQUFNLGFBQWMsU0FBUSxJQUFBLHFCQUFhLEVBQUMsRUFBRSxNQUFNLEVBQU4sZ0JBQU0sRUFBRSxhQUFhLEVBQWIsd0JBQWEsRUFBRSxpQkFBaUIsRUFBakIsNkJBQWlCLEVBQUUsQ0FBQztJQUNyRixLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBaUIsRUFBRSxVQUFrQixFQUFFLGFBQWEsR0FBRyxDQUFDO1FBQy9FLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7UUFDN0UsSUFBSSxRQUFRLENBQUMsTUFBTTtZQUFFLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFBO0lBQ2hGLENBQUM7SUFFRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsU0FBaUIsRUFBRSxVQUFrQjtRQUNqRSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsOEJBQThCLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNqRyxJQUFJLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNsQixNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMxRCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBRUQsa0JBQWUsYUFBYSxDQUFBIn0=