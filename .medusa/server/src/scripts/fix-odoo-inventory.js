"use strict";
/**
 * Fix Odoo Products Inventory
 *
 * This script disables inventory management for products that were imported
 * from Odoo without proper inventory levels set.
 *
 * Run with: npx medusa exec ./src/scripts/fix-odoo-inventory.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fixOdooInventory;
const utils_1 = require("@medusajs/framework/utils");
async function fixOdooInventory({ container }) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    console.log("🔍 Finding variants with inventory management enabled...");
    // Get all product variants with manage_inventory = true
    const { data: variants } = await query.graph({
        entity: "product_variant",
        fields: ["id", "title", "manage_inventory", "product_id", "product.id", "product.title"],
        filters: {
            manage_inventory: true
        }
    });
    console.log(`Found ${variants.length} variants with manage_inventory=true`);
    if (variants.length === 0) {
        console.log("No variants need fixing!");
        return;
    }
    let fixedCount = 0;
    for (const variant of variants) {
        try {
            // Use the product service to update the variant through product update
            // In Medusa v2, we need to update through the product
            const productId = variant.product_id || variant.product?.id;
            if (!productId) {
                console.error(`❌ No product ID for variant ${variant.id}`);
                continue;
            }
            // Update the product's variants
            await productService.updateProducts(productId, {
                variants: [{
                        id: variant.id,
                        manage_inventory: false
                    }]
            });
            fixedCount++;
            console.log(`✅ Fixed: ${variant.product?.title || 'Unknown'} - ${variant.title}`);
        }
        catch (error) {
            console.error(`❌ Failed to fix variant ${variant.id}: ${error.message}`);
        }
    }
    console.log(`\n🎉 Fixed ${fixedCount}/${variants.length} variants`);
    console.log("Products should now be addable to cart without inventory errors");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LW9kb28taW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvZml4LW9kb28taW52ZW50b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7OztHQU9HOztBQUtILG1DQW9EQztBQXRERCxxREFBOEU7QUFFL0QsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3BFLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEUsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFRLENBQUE7SUFFaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFBO0lBRXZFLHdEQUF3RDtJQUN4RCxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMzQyxNQUFNLEVBQUUsaUJBQWlCO1FBQ3pCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7UUFDeEYsT0FBTyxFQUFFO1lBQ1AsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QjtLQUNGLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxRQUFRLENBQUMsTUFBTSxzQ0FBc0MsQ0FBQyxDQUFBO0lBRTNFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUE7UUFDdkMsT0FBTTtJQUNSLENBQUM7SUFFRCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUE7SUFFbEIsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUM7WUFDSCx1RUFBdUU7WUFDdkUsc0RBQXNEO1lBQ3RELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUE7WUFFM0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUMxRCxTQUFRO1lBQ1YsQ0FBQztZQUVELGdDQUFnQztZQUNoQyxNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO2dCQUM3QyxRQUFRLEVBQUUsQ0FBQzt3QkFDVCxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7d0JBQ2QsZ0JBQWdCLEVBQUUsS0FBSztxQkFDeEIsQ0FBQzthQUNILENBQUMsQ0FBQTtZQUVGLFVBQVUsRUFBRSxDQUFBO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLFNBQVMsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUNuRixDQUFDO1FBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztZQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixPQUFPLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQzFFLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLFVBQVUsSUFBSSxRQUFRLENBQUMsTUFBTSxXQUFXLENBQUMsQ0FBQTtJQUNuRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlFQUFpRSxDQUFDLENBQUE7QUFDaEYsQ0FBQyJ9