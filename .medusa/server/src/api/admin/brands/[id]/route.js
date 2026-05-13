"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.PUT = PUT;
exports.DELETE = DELETE;
const brands_1 = require("../../../../modules/brands");
// Admin endpoints should require authentication
exports.AUTHENTICATE = true;
/**
 * GET /admin/brands/:id
 * Get a single brand by ID
 */
async function GET(req, res) {
    try {
        const brandModuleService = req.scope.resolve(brands_1.BRAND_MODULE);
        const brand = await brandModuleService.retrieveBrand(req.params.id);
        if (!brand)
            return res.status(404).json({ message: 'Brand not found' });
        res.json({ brand });
    }
    catch (e) {
        console.error('Admin brand GET error:', e);
        res.status(500).json({ message: e?.message || 'Failed to retrieve brand' });
    }
}
/**
 * PUT /admin/brands/:id
 * Update a brand
 */
async function PUT(req, res) {
    try {
        const brandModuleService = req.scope.resolve(brands_1.BRAND_MODULE);
        const body = (req.body || {});
        // Normalize fields: accept `logo` (from admin UI) as `logo_url` expected by the service
        const updates = { ...body };
        if (body.logo && !body.logo_url)
            updates.logo_url = body.logo;
        if (body.banner && !body.banner_url)
            updates.banner_url = body.banner;
        const brand = await brandModuleService.updateBrands({ id: req.params.id }, updates);
        res.json({ brand });
    }
    catch (e) {
        console.error('Admin brand PUT error:', e);
        res.status(500).json({ message: e?.message || 'Failed to update brand' });
    }
}
/**
 * DELETE /admin/brands/:id
 * Delete (soft or hard depending on service) a brand
 */
async function DELETE(req, res) {
    try {
        const brandModuleService = req.scope.resolve(brands_1.BRAND_MODULE);
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'id is required' });
        const existing = await brandModuleService.retrieveBrand(id).catch(() => null);
        if (!existing)
            return res.status(404).json({ message: 'Brand not found' });
        // Prefer soft delete if available, otherwise fallback to deleteBrands
        if (typeof brandModuleService.softDeleteBrands === 'function') {
            await brandModuleService.softDeleteBrands([id]);
        }
        else if (typeof brandModuleService.deleteBrands === 'function') {
            await brandModuleService.deleteBrands({ id });
        }
        else {
            // As a last resort, call a generic delete method if present
            const maybeAny = brandModuleService;
            if (typeof maybeAny.delete === 'function') {
                await maybeAny.delete(id);
            }
        }
        // Return 204 No Content for consistency with other admin deletes
        res.status(204).send();
    }
    catch (e) {
        console.error('Admin brand DELETE error:', e);
        res.status(500).json({ message: e?.message || 'Failed to delete brand' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2JyYW5kcy9baWRdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVdBLGtCQWFDO0FBTUQsa0JBa0JDO0FBTUQsd0JBK0JDO0FBcEZELHVEQUF5RDtBQUd6RCxnREFBZ0Q7QUFDbkMsUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBRWhDOzs7R0FHRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQ3ZCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLElBQUksQ0FBQztRQUNILE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQWUscUJBQVksQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sS0FBSyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDbkUsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtRQUN2RSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUNyQixDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLElBQUksMEJBQTBCLEVBQUUsQ0FBQyxDQUFBO0lBQzdFLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBZSxxQkFBWSxDQUFDLENBQUE7UUFDeEUsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBUSxDQUFBO1FBQ3BDLHdGQUF3RjtRQUN4RixNQUFNLE9BQU8sR0FBUSxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUE7UUFDaEMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDN0QsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7UUFFckUsTUFBTSxLQUFLLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNuRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUNyQixDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLElBQUksd0JBQXdCLEVBQUUsQ0FBQyxDQUFBO0lBQzNFLENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLE1BQU0sQ0FDMUIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBZSxxQkFBWSxDQUFDLENBQUE7UUFDeEUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUE7UUFDeEIsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtRQUVuRSxNQUFNLFFBQVEsR0FBRyxNQUFNLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDN0UsSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtRQUUxRSxzRUFBc0U7UUFDdEUsSUFBSSxPQUFPLGtCQUFrQixDQUFDLGdCQUFnQixLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQzlELE1BQU0sa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ2pELENBQUM7YUFBTSxJQUFJLE9BQU8sa0JBQWtCLENBQUMsWUFBWSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ2pFLE1BQU0sa0JBQWtCLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMvQyxDQUFDO2FBQU0sQ0FBQztZQUNOLDREQUE0RDtZQUM1RCxNQUFNLFFBQVEsR0FBRyxrQkFBMkUsQ0FBQTtZQUM1RixJQUFJLE9BQU8sUUFBUSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzNCLENBQUM7UUFDSCxDQUFDO1FBRUQsaUVBQWlFO1FBQ2pFLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDeEIsQ0FBQztJQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM3QyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLHdCQUF3QixFQUFFLENBQUMsQ0FBQTtJQUMzRSxDQUFDO0FBQ0gsQ0FBQyJ9