"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const post_1 = __importDefault(require("./models/post"));
/**
 * Blog Module Service
 * Handles CRUD operations for blog posts
 */
class BlogService extends (0, utils_1.MedusaService)({
    BlogPost: post_1.default,
}) {
}
exports.default = BlogService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2Jsb2cvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUF5RDtBQUN6RCx5REFBb0M7QUFFcEM7OztHQUdHO0FBQ0gsTUFBTSxXQUFZLFNBQVEsSUFBQSxxQkFBYSxFQUFDO0lBQ3BDLFFBQVEsRUFBUixjQUFRO0NBQ1gsQ0FBQztDQUVEO0FBRUQsa0JBQWUsV0FBVyxDQUFBIn0=