"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const warranty_1 = __importDefault(require("./models/warranty"));
const warranty_claim_1 = __importDefault(require("./models/warranty_claim"));
class WarrantyService extends (0, utils_1.MedusaService)({ Warranty: warranty_1.default, WarrantyClaim: warranty_claim_1.default }) {
    async registerWarranty(data) {
        const start = data.start_date ?? new Date();
        const months = data.duration_months ?? 12;
        const end = new Date(start);
        end.setMonth(end.getMonth() + months);
        return this.createWarranties({
            product_id: data.product_id,
            order_id: data.order_id ?? null,
            order_item_id: data.order_item_id ?? null,
            customer_email: data.customer_email,
            type: data.type ?? "manufacturer",
            duration_months: months,
            start_date: start,
            end_date: end,
            status: "active",
            terms: data.terms ?? null,
            metadata: data.metadata ?? null,
        });
    }
    async submitClaim(data) {
        return this.createWarrantyClaims({
            warranty_id: data.warranty_id,
            customer_email: data.customer_email,
            issue_description: data.issue_description,
            status: "submitted",
            metadata: data.metadata ?? null,
        });
    }
}
exports.default = WarrantyService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3dhcnJhbnR5L3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBeUQ7QUFDekQsaUVBQXdDO0FBQ3hDLDZFQUFtRDtBQUVuRCxNQUFNLGVBQWdCLFNBQVEsSUFBQSxxQkFBYSxFQUFDLEVBQUUsUUFBUSxFQUFSLGtCQUFRLEVBQUUsYUFBYSxFQUFiLHdCQUFhLEVBQUUsQ0FBQztJQUN0RSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFVdEI7UUFDQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUE7UUFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUE7UUFDekMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDM0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUE7UUFDckMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDM0IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUk7WUFDL0IsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSTtZQUN6QyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksY0FBYztZQUNqQyxlQUFlLEVBQUUsTUFBTTtZQUN2QixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsR0FBRztZQUNiLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUk7WUFDekIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSTtTQUNoQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUtqQjtRQUNDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDO1lBQy9CLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtZQUN6QyxNQUFNLEVBQUUsV0FBVztZQUNuQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJO1NBQ2hDLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRjtBQUVELGtCQUFlLGVBQWUsQ0FBQSJ9