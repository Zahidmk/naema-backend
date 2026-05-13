"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.DELETE = DELETE;
const wishlist_1 = require("../../../../../modules/wishlist");
exports.AUTHENTICATE = true;
// DELETE /store/wishlist/items/:id requires authenticated customer
async function DELETE(req, res) {
    const wishlistService = req.scope.resolve(wishlist_1.WISHLIST_MODULE);
    // MedusaJS 2.x uses auth_context.actor_id for authenticated customer
    const customer_id = req.auth_context?.actor_id;
    if (!customer_id) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "item id required" });
    }
    // (Optional) Could validate the item belongs to this customer before delete.
    const result = await wishlistService.removeItem(id);
    res.json(result);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3dpc2hsaXN0L2l0ZW1zL1tpZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBT0Esd0JBY0M7QUFwQkQsOERBQWlFO0FBR3BELFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUVoQyxtRUFBbUU7QUFDNUQsS0FBSyxVQUFVLE1BQU0sQ0FBQyxHQUErQixFQUFFLEdBQW1CO0lBQy9FLE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQW9CLENBQUE7SUFDN0UscUVBQXFFO0lBQ3JFLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFBO0lBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBQ0QsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDekIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ1IsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUE7SUFDOUQsQ0FBQztJQUNELDZFQUE2RTtJQUM3RSxNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQWUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDbkQsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsQixDQUFDIn0=