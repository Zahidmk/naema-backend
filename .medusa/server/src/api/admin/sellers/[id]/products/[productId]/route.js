"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.DELETE = DELETE;
const sellers_1 = require("../../../../../../modules/sellers");
exports.AUTHENTICATE = true;
async function DELETE(req, res) {
    const svc = req.scope.resolve(sellers_1.SELLER_MODULE);
    const { id, productId } = req.params;
    await svc.removeProductFromSeller(id, productId);
    res.status(204).send();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3NlbGxlcnMvW2lkXS9wcm9kdWN0cy9bcHJvZHVjdElkXS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSx3QkFLQztBQVRELCtEQUFpRTtBQUVwRCxRQUFBLFlBQVksR0FBRyxJQUFJLENBQUE7QUFFekIsS0FBSyxVQUFVLE1BQU0sQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2xFLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHVCQUFhLENBQVEsQ0FBQTtJQUNuRCxNQUFNLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDcEMsTUFBTSxHQUFHLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ2hELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDeEIsQ0FBQyJ9