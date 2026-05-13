"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.POST = POST;
const wishlist_1 = require("../../../../modules/wishlist");
exports.AUTHENTICATE = true;
// POST /store/wishlist/items  Body: { product_id, variant_id? } requires authenticated customer
async function POST(req, res) {
    const wishlistService = req.scope.resolve(wishlist_1.WISHLIST_MODULE);
    const body = req.body;
    // MedusaJS 2.x uses auth_context.actor_id for authenticated customer
    const customer_id = req.auth_context?.actor_id;
    if (!customer_id) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
    if (!body.product_id) {
        return res.status(400).json({ message: "product_id required" });
    }
    const item = await wishlistService.addItem(customer_id, body.product_id, body.variant_id);
    res.json({ item });
}
// DELETE moved to items/[id]/route.ts for proper dynamic param routing.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3dpc2hsaXN0L2l0ZW1zL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU9BLG9CQWFDO0FBbkJELDJEQUE4RDtBQUdqRCxRQUFBLFlBQVksR0FBRyxJQUFJLENBQUE7QUFFaEMsZ0dBQWdHO0FBQ3pGLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBK0IsRUFBRSxHQUFtQjtJQUM3RSxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFvQixDQUFBO0lBQzdFLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFvRCxDQUFBO0lBQ3JFLHFFQUFxRTtJQUNyRSxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQTtJQUM5QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUNELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDckIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxDQUFDLENBQUE7SUFDakUsQ0FBQztJQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDekYsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDcEIsQ0FBQztBQUVELHdFQUF3RSJ9