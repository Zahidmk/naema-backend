"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const SellerProductLink = utils_1.model.define("seller_product_link", {
    id: utils_1.model.id().primaryKey(),
    seller_id: utils_1.model.text(),
    product_id: utils_1.model.text(),
    display_order: utils_1.model.number().default(0),
    metadata: utils_1.model.json().nullable(),
});
exports.default = SellerProductLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsbGVyX3Byb2R1Y3RfbGluay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3NlbGxlcnMvbW9kZWxzL3NlbGxlcl9wcm9kdWN0X2xpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBa0Q7QUFFbEQsTUFBTSxpQkFBaUIsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFO0lBQzVELEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzNCLFNBQVMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3ZCLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3hCLGFBQWEsRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4QyxRQUFRLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNsQyxDQUFDLENBQUM7QUFFSCxrQkFBZSxpQkFBaUIsQ0FBQyJ9