"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const wishlist_1 = __importDefault(require("./models/wishlist"));
const wishlist_item_1 = __importDefault(require("./models/wishlist-item"));
class WishlistService extends (0, utils_1.MedusaService)({
    Wishlist: wishlist_1.default,
    WishlistItem: wishlist_item_1.default,
}) {
    async getOrCreateWishlist(customer_id) {
        const [existing] = await this.listWishlists({ customer_id });
        if (existing)
            return existing;
        return this.createWishlists({ customer_id });
    }
    async listItemsForCustomer(customer_id) {
        const [existing] = await this.listWishlists({ customer_id });
        if (!existing)
            return [];
        return this.listWishlistItems({ wishlist_id: existing.id });
    }
    async addItem(customer_id, product_id, variant_id) {
        const wishlist = await this.getOrCreateWishlist(customer_id);
        const existingItems = await this.listWishlistItems({ wishlist_id: wishlist.id, product_id, variant_id });
        if (existingItems.length)
            return existingItems[0];
        return this.createWishlistItems({ wishlist_id: wishlist.id, product_id, variant_id });
    }
    async removeItem(item_id) {
        await this.deleteWishlistItems(item_id);
        return { id: item_id, deleted: true };
    }
}
exports.default = WishlistService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3dpc2hsaXN0L3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBeUQ7QUFDekQsaUVBQXdDO0FBQ3hDLDJFQUFpRDtBQUVqRCxNQUFNLGVBQWdCLFNBQVEsSUFBQSxxQkFBYSxFQUFDO0lBQzFDLFFBQVEsRUFBUixrQkFBUTtJQUNSLFlBQVksRUFBWix1QkFBWTtDQUNiLENBQUM7SUFDQSxLQUFLLENBQUMsbUJBQW1CLENBQUMsV0FBbUI7UUFDM0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7UUFDNUQsSUFBSSxRQUFRO1lBQUUsT0FBTyxRQUFRLENBQUE7UUFDN0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxDQUFDO0lBRUQsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFdBQW1CO1FBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO1FBQzVELElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDeEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBbUIsRUFBRSxVQUFrQixFQUFFLFVBQW1CO1FBQ3hFLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQzVELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7UUFDeEcsSUFBSSxhQUFhLENBQUMsTUFBTTtZQUFFLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDdkYsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZTtRQUM5QixNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN2QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDdkMsQ0FBQztDQUNGO0FBRUQsa0JBQWUsZUFBZSxDQUFBIn0=