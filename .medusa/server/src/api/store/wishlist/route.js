"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
const wishlist_1 = require("../../../modules/wishlist");
const utils_1 = require("@medusajs/framework/utils");
// Enable auth now. Remove dev fallbacks.
exports.AUTHENTICATE = true;
// GET /store/wishlist  -> requires authenticated customer
async function GET(req, res) {
    const wishlistService = req.scope.resolve(wishlist_1.WISHLIST_MODULE);
    // MedusaJS 2.x uses auth_context.actor_id for authenticated customer
    const customer_id = req.auth_context?.actor_id;
    if (!customer_id) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
    const items = await wishlistService.listItemsForCustomer(customer_id);
    let products = [];
    if (items.length) {
        const productIds = items.map((i) => i.product_id);
        const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
        products = await productService.listProducts({ id: productIds });
    }
    res.json({ customer_id, items, products });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3dpc2hsaXN0L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVNBLGtCQWVDO0FBdkJELHdEQUEyRDtBQUUzRCxxREFBbUQ7QUFFbkQseUNBQXlDO0FBQzVCLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUVoQywwREFBMEQ7QUFDbkQsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQzVFLE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQW9CLENBQUE7SUFDN0UscUVBQXFFO0lBQ3JFLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFBO0lBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxlQUFlLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDckUsSUFBSSxRQUFRLEdBQVUsRUFBRSxDQUFBO0lBQ3hCLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2pCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN0RCxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDekQsUUFBUSxHQUFHLE1BQU0sY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO0lBQ2xFLENBQUM7SUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQzVDLENBQUMifQ==