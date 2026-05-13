"use strict";
/**
 * Odoo Integration Module
 * Handles synchronization of products and inventory from Odoo ERP to MedusaJS
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODOO_SYNC_MODULE = void 0;
const utils_1 = require("@medusajs/framework/utils");
const service_1 = __importDefault(require("./service"));
exports.ODOO_SYNC_MODULE = "odoo-sync";
exports.default = (0, utils_1.Module)(exports.ODOO_SYNC_MODULE, {
    service: service_1.default,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9vZG9vLXN5bmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgscURBQWtEO0FBQ2xELHdEQUF1QztBQUUxQixRQUFBLGdCQUFnQixHQUFHLFdBQVcsQ0FBQTtBQUUzQyxrQkFBZSxJQUFBLGNBQU0sRUFBQyx3QkFBZ0IsRUFBRTtJQUN0QyxPQUFPLEVBQUUsaUJBQWU7Q0FDekIsQ0FBQyxDQUFBIn0=