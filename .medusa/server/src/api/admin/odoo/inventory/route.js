"use strict";
/**
 * Odoo Inventory Admin API
 * Endpoints for fetching and syncing inventory from Odoo
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const service_1 = __importDefault(require("../../../../modules/odoo-sync/service"));
const odooService = new service_1.default();
/**
 * GET /admin/odoo/inventory
 * Fetch inventory/stock levels from Odoo
 */
async function GET(req, res) {
    try {
        if (!odooService.isConfigured()) {
            res.status(400).json({
                success: false,
                error: "Odoo is not configured. Please set environment variables.",
            });
            return;
        }
        const inventory = await odooService.fetchInventory();
        // Group inventory by product
        const inventoryByProduct = inventory.reduce((acc, quant) => {
            const productId = quant.product_id[0];
            const productName = quant.product_id[1];
            if (!acc[productId]) {
                acc[productId] = {
                    product_id: productId,
                    product_name: productName,
                    total_quantity: 0,
                    reserved_quantity: 0,
                    available_quantity: 0,
                    locations: [],
                };
            }
            acc[productId].total_quantity += quant.quantity;
            acc[productId].reserved_quantity += quant.reserved_quantity;
            acc[productId].available_quantity +=
                quant.quantity - quant.reserved_quantity;
            acc[productId].locations.push({
                location_id: quant.location_id[0],
                location_name: quant.location_id[1],
                quantity: quant.quantity,
                reserved: quant.reserved_quantity,
            });
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                inventory: Object.values(inventoryByProduct),
                raw_inventory: inventory,
                count: inventory.length,
                product_count: Object.keys(inventoryByProduct).length,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29kb28vaW52ZW50b3J5L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7O0FBV0gsa0JBNERDO0FBcEVELG9GQUFtRTtBQUVuRSxNQUFNLFdBQVcsR0FBRyxJQUFJLGlCQUFlLEVBQUUsQ0FBQTtBQUV6Qzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUN2QixHQUFrQixFQUNsQixHQUFtQjtJQUVuQixJQUFJLENBQUM7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7WUFDaEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSwyREFBMkQ7YUFDbkUsQ0FBQyxDQUFBO1lBQ0YsT0FBTTtRQUNSLENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUVwRCw2QkFBNkI7UUFDN0IsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pELE1BQU0sU0FBUyxHQUFJLEtBQUssQ0FBQyxVQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzlDLE1BQU0sV0FBVyxHQUFJLEtBQUssQ0FBQyxVQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRWhELElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDcEIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHO29CQUNmLFVBQVUsRUFBRSxTQUFTO29CQUNyQixZQUFZLEVBQUUsV0FBVztvQkFDekIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGlCQUFpQixFQUFFLENBQUM7b0JBQ3BCLGtCQUFrQixFQUFFLENBQUM7b0JBQ3JCLFNBQVMsRUFBRSxFQUFFO2lCQUNkLENBQUE7WUFDSCxDQUFDO1lBRUQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFBO1lBQy9DLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUE7WUFDM0QsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGtCQUFrQjtnQkFDL0IsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUE7WUFDMUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQzVCLFdBQVcsRUFBRyxLQUFLLENBQUMsV0FBbUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLGFBQWEsRUFBRyxLQUFLLENBQUMsV0FBbUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFDeEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxpQkFBaUI7YUFDbEMsQ0FBQyxDQUFBO1lBRUYsT0FBTyxHQUFHLENBQUE7UUFDWixDQUFDLEVBQUUsRUFBeUIsQ0FBQyxDQUFBO1FBRTdCLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUksRUFBRTtnQkFDSixTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztnQkFDNUMsYUFBYSxFQUFFLFNBQVM7Z0JBQ3hCLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTTtnQkFDdkIsYUFBYSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxNQUFNO2FBQ3REO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU87U0FDckIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMifQ==