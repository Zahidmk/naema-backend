"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const warranty_1 = require("../../../../modules/warranty");
// GET /store/warranty/:id
async function GET(req, res) {
    const svc = req.scope.resolve(warranty_1.WARRANTY_MODULE);
    const { id } = req.params;
    const [items] = await svc.listAndCountWarranties({ id }, { take: 1 });
    if (!items?.length)
        return res.status(404).json({ message: "warranty not found" });
    res.json({ warranty: items[0] });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3dhcnJhbnR5L1tpZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFNQztBQVRELDJEQUE4RDtBQUU5RCwwQkFBMEI7QUFDbkIsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQVEsQ0FBQTtJQUNyRCxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQTtJQUN6QixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsc0JBQXNCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3JFLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTTtRQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFBO0lBQ2xGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNsQyxDQUFDIn0=