"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const sellers_1 = require("../../../../modules/sellers");
async function GET(req, res) {
    const svc = req.scope.resolve(sellers_1.SELLER_MODULE);
    const { id } = req.params;
    const [items] = await svc.listAndCountSellers({ id, status: "approved" }, { take: 1 });
    const seller = items?.[0] || null;
    // Optionally fetch product links
    const links = await svc.listSellerProductLinks({ seller_id: id });
    res.json({ seller, product_links: links });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3NlbGxlcnMvW2lkXS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQVFDO0FBVkQseURBQTJEO0FBRXBELEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyx1QkFBYSxDQUFRLENBQUE7SUFDbkQsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3RGLE1BQU0sTUFBTSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQTtJQUNqQyxpQ0FBaUM7SUFDakMsTUFBTSxLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsc0JBQXNCLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNqRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0FBQzVDLENBQUMifQ==