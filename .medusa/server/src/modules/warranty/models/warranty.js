"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
// Basic warranty info recorded per customer/product/order
const Warranty = utils_1.model.define("warranty", {
    id: utils_1.model.id().primaryKey(),
    product_id: utils_1.model.text(),
    order_id: utils_1.model.text().nullable(),
    order_item_id: utils_1.model.text().nullable(),
    customer_email: utils_1.model.text(),
    type: utils_1.model.text().default("manufacturer"), // manufacturer | seller | extended
    duration_months: utils_1.model.number().default(12),
    start_date: utils_1.model.dateTime(),
    end_date: utils_1.model.dateTime().nullable(),
    status: utils_1.model.text().default("active"), // active | expired | void
    terms: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
});
exports.default = Warranty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FycmFudHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy93YXJyYW50eS9tb2RlbHMvd2FycmFudHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsMERBQTBEO0FBQzFELE1BQU0sUUFBUSxHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO0lBQ3hDLEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzNCLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3hCLFFBQVEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2pDLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3RDLGNBQWMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQzVCLElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLG1DQUFtQztJQUMvRSxlQUFlLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDM0MsVUFBVSxFQUFFLGFBQUssQ0FBQyxRQUFRLEVBQUU7SUFDNUIsUUFBUSxFQUFFLGFBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDckMsTUFBTSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsMEJBQTBCO0lBQ2xFLEtBQUssRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzlCLFFBQVEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0NBQ2xDLENBQUMsQ0FBQTtBQUVGLGtCQUFlLFFBQVEsQ0FBQSJ9