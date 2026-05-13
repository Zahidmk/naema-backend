"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const utils_1 = require("@medusajs/framework/utils");
async function default_1({ container }) {
    console.log('📊 Checking current database counts...\n');
    // Get services
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    try {
        // Count products
        const [products, productCount] = await productModuleService.listAndCountProducts();
        console.log(`📦 Total Products: ${productCount}`);
        // Count variants  
        const [variants, variantCount] = await productModuleService.listAndCountProductVariants();
        console.log(`📋 Total Variants: ${variantCount}`);
        // Sample some recent products
        const recentProducts = await productModuleService.listProducts({}, { take: 5, order: { created_at: 'DESC' } });
        console.log('\n🆕 Recent Products:');
        recentProducts.forEach((product, i) => {
            console.log(`  ${i + 1}. ${product.title} (${product.handle})`);
        });
        console.log('\n✅ Database counts retrieved successfully!');
    }
    catch (error) {
        console.error('❌ Error getting counts:', error.message);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stY291bnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvY2hlY2stY291bnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsNEJBNEJDO0FBOUJELHFEQUFtRDtBQUVwQyxLQUFLLG9CQUFXLEVBQUUsU0FBUyxFQUFZO0lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQTtJQUV2RCxlQUFlO0lBQ2YsTUFBTSxvQkFBb0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUUvRCxJQUFJLENBQUM7UUFDSCxpQkFBaUI7UUFDakIsTUFBTSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsR0FBRyxNQUFNLG9CQUFvQixDQUFDLG9CQUFvQixFQUFFLENBQUE7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsWUFBWSxFQUFFLENBQUMsQ0FBQTtRQUVqRCxtQkFBbUI7UUFDbkIsTUFBTSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsR0FBRyxNQUFNLG9CQUFvQixDQUFDLDJCQUEyQixFQUFFLENBQUE7UUFDekYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsWUFBWSxFQUFFLENBQUMsQ0FBQTtRQUVqRCw4QkFBOEI7UUFDOUIsTUFBTSxjQUFjLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRTlHLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtRQUNwQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBWSxFQUFFLENBQVMsRUFBRSxFQUFFO1lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxLQUFLLEtBQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7UUFDakUsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUE7SUFFNUQsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDekQsQ0FBQztBQUNILENBQUMifQ==