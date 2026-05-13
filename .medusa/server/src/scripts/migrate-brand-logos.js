"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = migrateBrandLogos;
const brands_1 = require("../modules/brands");
async function migrateBrandLogos({ container }) {
    console.log("Starting brand logo migration: copy 'logo' -> 'logo_url' where missing");
    const brandService = container.resolve(brands_1.BRAND_MODULE);
    const [brands] = await brandService.listAndCountBrands({}, { take: 1000 });
    let updated = 0;
    for (const b of brands) {
        try {
            if ((!b.logo_url || b.logo_url === null) && b.logo) {
                await brandService.updateBrands({ id: b.id }, { logo_url: b.logo });
                updated++;
                console.log(`Updated brand ${b.id} (${b.name})`);
            }
        }
        catch (e) {
            console.error(`Failed to update brand ${b.id}:`, e?.message || e);
        }
    }
    console.log(`Migration complete. Updated ${updated} brands.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0ZS1icmFuZC1sb2dvcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21pZ3JhdGUtYnJhbmQtbG9nb3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxvQ0FtQkM7QUFyQkQsOENBQWdEO0FBRWpDLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLHdFQUF3RSxDQUFDLENBQUE7SUFDckYsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFRLENBQUE7SUFFM0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQzFFLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQTtJQUNmLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDO1lBQ0gsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtnQkFDbkUsT0FBTyxFQUFFLENBQUE7Z0JBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQTtZQUNsRCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7WUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDbkUsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixPQUFPLFVBQVUsQ0FBQyxDQUFBO0FBQy9ELENBQUMifQ==