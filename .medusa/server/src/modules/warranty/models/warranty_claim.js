"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const WarrantyClaim = utils_1.model.define("warranty_claim", {
    id: utils_1.model.id().primaryKey(),
    warranty_id: utils_1.model.text(),
    customer_email: utils_1.model.text(),
    issue_description: utils_1.model.text(),
    status: utils_1.model.text().default("submitted"), // submitted | in_review | approved | rejected | completed
    admin_notes: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
});
exports.default = WarrantyClaim;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FycmFudHlfY2xhaW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy93YXJyYW50eS9tb2RlbHMvd2FycmFudHlfY2xhaW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsTUFBTSxhQUFhLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtJQUNuRCxFQUFFLEVBQUUsYUFBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsRUFBRTtJQUMzQixXQUFXLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUN6QixjQUFjLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUM1QixpQkFBaUIsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQy9CLE1BQU0sRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLDBEQUEwRDtJQUNyRyxXQUFXLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNwQyxRQUFRLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNsQyxDQUFDLENBQUE7QUFFRixrQkFBZSxhQUFhLENBQUEifQ==