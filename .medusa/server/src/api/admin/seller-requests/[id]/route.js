"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.PATCH = PATCH;
const sellers_1 = require("../../../../modules/sellers");
exports.AUTHENTICATE = true;
async function PATCH(req, res) {
    const svc = req.scope.resolve(sellers_1.SELLER_MODULE);
    const { id } = req.params;
    const body = req.body;
    const request = await svc.updateSellerRequests({ id }, body);
    // Auto-provision Seller on approval (minimal)
    try {
        if (body?.status === "approved") {
            // fetch updated request to ensure we have latest fields
            const [reqs] = await svc.listAndCountSellerRequests({ id }, { take: 1 });
            const r = reqs?.[0];
            if (r) {
                const email = (r.email || "").trim();
                const name = (r.seller_name || email || "").trim();
                if (email) {
                    const [existing] = await svc.listAndCountSellers({ email }, { take: 1 });
                    if (!existing?.length) {
                        await svc.createSellers({ name, email, phone: r.phone || null, status: "active", metadata: { source: "seller_request", request_id: r.id } });
                    }
                }
            }
        }
    }
    catch (e) {
        // don't block admin action; log
        req.scope.resolve("logger").warn("seller auto-provision failed: " + e.message);
    }
    res.json({ request });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3NlbGxlci1yZXF1ZXN0cy9baWRdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUtBLHNCQTZCQztBQWpDRCx5REFBMkQ7QUFFOUMsUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBRXpCLEtBQUssVUFBVSxLQUFLLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNqRSxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyx1QkFBYSxDQUFRLENBQUE7SUFDbkQsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDekIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQVcsQ0FBQTtJQUM1QixNQUFNLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBRTVELDhDQUE4QztJQUM5QyxJQUFJLENBQUM7UUFDSCxJQUFJLElBQUksRUFBRSxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDaEMsd0RBQXdEO1lBQ3hELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDeEUsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDbkIsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDTixNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7Z0JBQ3BDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7Z0JBQ2xELElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1YsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtvQkFDeEUsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQzt3QkFDdEIsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7b0JBQzlJLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDWCxnQ0FBZ0M7UUFDaEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxHQUFJLENBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUMzRixDQUFDO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDdkIsQ0FBQyJ9