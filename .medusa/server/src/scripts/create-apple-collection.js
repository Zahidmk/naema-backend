"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createAppleCollection;
const utils_1 = require("@medusajs/framework/utils");
async function createAppleCollection({ container }) {
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    console.log("Creating Apple collection...");
    try {
        // Check if collection already exists
        const existingCollections = await productService.listProductCollections({
            handle: "apple"
        });
        if (existingCollections.length > 0) {
            console.log("Apple collection already exists:", existingCollections[0].id);
            return;
        }
        // Create the Apple collection
        const collection = await productService.createProductCollections({
            title: "Apple",
            handle: "apple",
            metadata: {
                brand: "Apple",
                featured: true,
                description: "Apple products - Pioneering Technology"
            }
        });
        console.log("✅ Apple collection created successfully!");
        console.log("Collection ID:", collection.id);
        console.log("Collection Handle:", collection.handle);
        console.log("");
        console.log("📝 Next steps:");
        console.log("1. Go to Medusa Admin → Products → Collections");
        console.log("2. Find the 'Apple' collection");
        console.log("3. Add Apple products to this collection");
        console.log("4. The products will appear in the 'PIONEERING TECHNOLOGY' section on the homepage");
    }
    catch (error) {
        console.error("Error creating Apple collection:", error.message);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWFwcGxlLWNvbGxlY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jcmVhdGUtYXBwbGUtY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHdDQXdDQztBQTFDRCxxREFBbUQ7QUFFcEMsS0FBSyxVQUFVLHFCQUFxQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3pFLE1BQU0sY0FBYyxHQUEwQixTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUVoRixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUE7SUFFM0MsSUFBSSxDQUFDO1FBQ0gscUNBQXFDO1FBQ3JDLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxjQUFjLENBQUMsc0JBQXNCLENBQUM7WUFDdEUsTUFBTSxFQUFFLE9BQU87U0FDaEIsQ0FBQyxDQUFBO1FBRUYsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUMxRSxPQUFNO1FBQ1IsQ0FBQztRQUVELDhCQUE4QjtRQUM5QixNQUFNLFVBQVUsR0FBRyxNQUFNLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQztZQUMvRCxLQUFLLEVBQUUsT0FBTztZQUNkLE1BQU0sRUFBRSxPQUFPO1lBQ2YsUUFBUSxFQUFFO2dCQUNSLEtBQUssRUFBRSxPQUFPO2dCQUNkLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFdBQVcsRUFBRSx3Q0FBd0M7YUFDdEQ7U0FDRixDQUFDLENBQUE7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUE7UUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGdEQUFnRCxDQUFDLENBQUE7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO1FBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQTtRQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLG9GQUFvRixDQUFDLENBQUE7SUFFbkcsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDbEUsQ0FBQztBQUNILENBQUMifQ==