"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const Wishlist = utils_1.model.define("wishlist", {
    id: utils_1.model.id().primaryKey(),
    customer_id: utils_1.model.text(),
});
exports.default = Wishlist;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lzaGxpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy93aXNobGlzdC9tb2RlbHMvd2lzaGxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsTUFBTSxRQUFRLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7SUFDeEMsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsV0FBVyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7Q0FDMUIsQ0FBQyxDQUFBO0FBRUYsa0JBQWUsUUFBUSxDQUFBIn0=