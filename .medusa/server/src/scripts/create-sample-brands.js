"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedBrands;
const brands_1 = require("../modules/brands");
async function seedBrands({ container }) {
    const brandService = container.resolve(brands_1.BRAND_MODULE);
    const data = [
        {
            name: "Nike",
            slug: "nike",
            description: "Nike, Inc.",
            logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
            is_active: true,
            display_order: 1,
        },
        {
            name: "Adidas",
            slug: "adidas",
            description: "Adidas AG",
            logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
            is_active: true,
            display_order: 2,
        },
    ];
    for (const b of data) {
        try {
            await brandService.createBrands(b);
            console.log(`Created brand ${b.name}`);
        }
        catch (e) {
            if (e?.message?.includes("duplicate key") || e?.message?.includes("exists")) {
                console.log(`Brand ${b.name} already exists`);
            }
            else {
                console.error(`Failed to create ${b.name}:`, e?.message || e);
            }
        }
    }
    console.log("Done.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNhbXBsZS1icmFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jcmVhdGUtc2FtcGxlLWJyYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLDZCQW9DQztBQXZDRCw4Q0FBZ0Q7QUFHakMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUM5RCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQVEsQ0FBQTtJQUUzRCxNQUFNLElBQUksR0FBRztRQUNYO1lBQ0UsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsTUFBTTtZQUNaLFdBQVcsRUFBRSxZQUFZO1lBQ3pCLFFBQVEsRUFBRSxtRUFBbUU7WUFDN0UsU0FBUyxFQUFFLElBQUk7WUFDZixhQUFhLEVBQUUsQ0FBQztTQUNqQjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFFBQVE7WUFDZCxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFFBQVEsRUFBRSxxRUFBcUU7WUFDL0UsU0FBUyxFQUFFLElBQUk7WUFDZixhQUFhLEVBQUUsQ0FBQztTQUNqQjtLQUNGLENBQUE7SUFFRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQztZQUNILE1BQU0sWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUN4QyxDQUFDO1FBQUMsT0FBTyxDQUFLLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLENBQUE7WUFDL0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO1lBQy9ELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDdEIsQ0FBQyJ9