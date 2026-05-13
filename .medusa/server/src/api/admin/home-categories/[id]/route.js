"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.PATCH = PATCH;
const utils_1 = require("@medusajs/framework/utils");
exports.AUTHENTICATE = true;
async function updateCategory(productService, id, data) {
    const candidates = ["updateProductCategories", "updateProductCategory", "updateCategories", "update"];
    for (const method of candidates) {
        if (typeof productService?.[method] === "function") {
            if (method.endsWith("s")) {
                return await productService[method]([{ id, ...data }]);
            }
            return await productService[method](id, data);
        }
    }
    throw new Error("No category update method found on product service");
}
async function PATCH(req, res) {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: "Category id is required" });
        const body = (req.body || {});
        const productService = req.scope.resolve(utils_1.Modules.PRODUCT);
        let existing = null;
        try {
            if (typeof productService.retrieveProductCategory === "function") {
                existing = await productService.retrieveProductCategory(id);
            }
            else if (typeof productService.retrieveCategory === "function") {
                existing = await productService.retrieveCategory(id);
            }
        }
        catch {
            existing = null;
        }
        const metadata = {
            ...(existing?.metadata || {}),
            ...(body.metadata || {}),
        };
        if (typeof body.home_enabled === "boolean") {
            metadata.home_enabled = body.home_enabled;
        }
        if (body.home_order !== undefined && body.home_order !== null && body.home_order !== "") {
            metadata.home_order = Number(body.home_order);
        }
        if (body.discount !== undefined && body.discount !== null && body.discount !== "") {
            metadata.discount = Number(body.discount);
        }
        const payload = { metadata };
        const updated = await updateCategory(productService, id, payload);
        res.json({ category: updated });
    }
    catch (e) {
        res.status(500).json({ message: e?.message || "Failed to update home category" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2hvbWUtY2F0ZWdvcmllcy9baWRdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWtCQSxzQkF5Q0M7QUExREQscURBQW1EO0FBRXRDLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUVoQyxLQUFLLFVBQVUsY0FBYyxDQUFDLGNBQW1CLEVBQUUsRUFBVSxFQUFFLElBQXlCO0lBQ3RGLE1BQU0sVUFBVSxHQUFHLENBQUMseUJBQXlCLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDckcsS0FBSyxNQUFNLE1BQU0sSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNoQyxJQUFJLE9BQU8sY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDbkQsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLE9BQU8sTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUN4RCxDQUFDO1lBQ0QsT0FBTyxNQUFNLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDL0MsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUE7QUFDdkUsQ0FBQztBQUVNLEtBQUssVUFBVSxLQUFLLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNqRSxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQTtRQUN4QixJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsQ0FBQyxDQUFBO1FBRTVFLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQVEsQ0FBQTtRQUNwQyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFRLENBQUE7UUFFaEUsSUFBSSxRQUFRLEdBQVEsSUFBSSxDQUFBO1FBQ3hCLElBQUksQ0FBQztZQUNILElBQUksT0FBTyxjQUFjLENBQUMsdUJBQXVCLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ2pFLFFBQVEsR0FBRyxNQUFNLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUM3RCxDQUFDO2lCQUFNLElBQUksT0FBTyxjQUFjLENBQUMsZ0JBQWdCLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ2pFLFFBQVEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN0RCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNQLFFBQVEsR0FBRyxJQUFJLENBQUE7UUFDakIsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHO1lBQ2YsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLElBQUksRUFBRSxDQUFDO1lBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztTQUN6QixDQUFBO1FBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDM0MsUUFBUSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFBO1FBQzNDLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDeEYsUUFBUSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQy9DLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDbEYsUUFBUSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzNDLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBd0IsRUFBRSxRQUFRLEVBQUUsQ0FBQTtRQUVqRCxNQUFNLE9BQU8sR0FBRyxNQUFNLGNBQWMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQ2pFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLGdDQUFnQyxFQUFFLENBQUMsQ0FBQTtJQUNuRixDQUFDO0FBQ0gsQ0FBQyJ9