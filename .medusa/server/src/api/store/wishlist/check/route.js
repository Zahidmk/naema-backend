"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
const wishlist_1 = require("../../../../modules/wishlist");
exports.AUTHENTICATE = true;
/**
 * GET /store/wishlist/check?product_id={product_id}
 *
 * Efficiently checks if a single product is in the authenticated customer's wishlist.
 * Returns O(1) result — does NOT fetch the entire wishlist.
 * Use this on Product Detail pages to show/hide the heart icon.
 *
 * Headers:
 *   Authorization: Bearer {customer_token}
 *
 * Query params:
 *   product_id  - required  (e.g. prod_01ABC123)
 *
 * Response 200:
 * {
 *   "is_wishlisted": true,
 *   "item_id": "witem_01ABC123"   // null if not wishlisted
 * }
 */
async function GET(req, res) {
    const customer_id = req.auth_context?.actor_id;
    if (!customer_id) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
    const { product_id } = req.query;
    if (!product_id) {
        return res.status(400).json({ message: "product_id query param is required" });
    }
    const wishlistService = req.scope.resolve(wishlist_1.WISHLIST_MODULE);
    // Resolve the customer's wishlist (no create — read-only)
    const [wishlist] = await wishlistService.listWishlists({ customer_id });
    if (!wishlist) {
        return res.json({ is_wishlisted: false, item_id: null });
    }
    // Query ONLY for this specific product — no full list scan
    const [item] = await wishlistService.listWishlistItems({
        wishlist_id: wishlist.id,
        product_id,
    });
    return res.json({
        is_wishlisted: !!item,
        item_id: item?.id ?? null,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3dpc2hsaXN0L2NoZWNrL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXlCQSxrQkE2QkM7QUFyREQsMkRBQThEO0FBR2pELFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUVoQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzVFLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFBO0lBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBRUQsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFnQyxDQUFBO0lBQzNELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLENBQUMsQ0FBQTtJQUNoRixDQUFDO0lBRUQsTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBb0IsQ0FBQTtJQUU3RSwwREFBMEQ7SUFDMUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDdkUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUMxRCxDQUFDO0lBRUQsMkRBQTJEO0lBQzNELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQztRQUNyRCxXQUFXLEVBQUUsUUFBUSxDQUFDLEVBQUU7UUFDeEIsVUFBVTtLQUNYLENBQUMsQ0FBQTtJQUVGLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztRQUNkLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSTtRQUNyQixPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxJQUFJO0tBQzFCLENBQUMsQ0FBQTtBQUNKLENBQUMifQ==