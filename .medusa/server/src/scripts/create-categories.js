"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createCategories;
const core_flows_1 = require("@medusajs/medusa/core-flows");
async function createCategories({ container }) {
    const logger = container.resolve("logger");
    logger.info("Creating product categories...");
    const categoryNames = [
        "Smart Phones",
        "Power Banks",
        "Smart Watches",
        "Headphones",
        "Gaming",
        "Laptops",
        "Hot Deals",
        "Mobile & Tablet",
        "Computers & Gaming",
        "Electronics",
        "Home & Kitchen",
        "Fashion",
        "Health & Beauty",
        "Automotives",
        "Toys, Games & Kids",
    ];
    try {
        const { result } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
            input: {
                product_categories: categoryNames.map((name) => ({ name, is_active: true }))
            }
        });
        logger.info(`Created ${Array.isArray(result) ? result.length : 0} categories.`);
    }
    catch (err) {
        if (err instanceof Error) {
            logger.error('Failed to create categories:', err);
        }
        else {
            logger.error('Failed to create categories:', new Error(String(err)));
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWNhdGVnb3JpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jcmVhdGUtY2F0ZWdvcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLG1DQXNDQztBQXhDRCw0REFBNkU7QUFFOUQsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3BFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0lBRTdDLE1BQU0sYUFBYSxHQUFHO1FBQ3BCLGNBQWM7UUFDZCxhQUFhO1FBQ2IsZUFBZTtRQUNmLFlBQVk7UUFDWixRQUFRO1FBQ1IsU0FBUztRQUNULFdBQVc7UUFDWCxpQkFBaUI7UUFDakIsb0JBQW9CO1FBQ3BCLGFBQWE7UUFDYixnQkFBZ0I7UUFDaEIsU0FBUztRQUNULGlCQUFpQjtRQUNqQixhQUFhO1FBQ2Isb0JBQW9CO0tBQ3JCLENBQUE7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLDRDQUErQixFQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUN0RSxLQUFLLEVBQUU7Z0JBQ0wsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUM3RTtTQUNGLENBQUMsQ0FBQTtRQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQ2pGLENBQUM7SUFBQyxPQUFPLEdBQVksRUFBRSxDQUFDO1FBQ3RCLElBQUksR0FBRyxZQUFZLEtBQUssRUFBRSxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbkQsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdEUsQ0FBQztRQUNELE1BQU0sR0FBRyxDQUFBO0lBQ1gsQ0FBQztBQUNILENBQUMifQ==