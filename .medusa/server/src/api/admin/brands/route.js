"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = void 0;
exports.GET = GET;
exports.POST = POST;
const brands_1 = require("../../../modules/brands");
exports.AUTHENTICATE = true;
async function GET(req, res) {
    try {
        const brandService = req.scope.resolve(brands_1.BRAND_MODULE);
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const [brands, count] = await brandService.listAndCountBrands({}, {
            skip: offset,
            take: limit,
            order: { display_order: "ASC", name: "ASC" },
        });
        res.json({ brands, count, limit, offset });
    }
    catch (e) {
        console.error('Admin brand list error:', e);
        res.status(500).json({ message: e?.message || 'Failed to list brands' });
    }
}
async function POST(req, res) {
    try {
        const brandService = req.scope.resolve(brands_1.BRAND_MODULE);
        const body = (req.body || {});
        if (!body?.name)
            return res.status(400).json({ message: 'name is required' });
        // Ensure slug is present — MikroORM schema requires it. Generate from name when missing.
        const makeSlug = (v) => v
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const slug = body.slug && body.slug !== '' ? body.slug : makeSlug(body.name);
        const logoUrl = body.logo ?? body.logo_url ?? null;
        const bannerUrl = body.banner ?? body.banner_url ?? null;
        const [created] = await brandService.createBrands([{
                name: body.name,
                slug,
                description: body.description ?? null,
                logo_url: logoUrl,
                banner_url: bannerUrl,
                is_active: body.is_active ?? true,
                is_special: body.is_special ?? false,
                display_order: body.display_order ?? 0,
            }]);
        res.json({ brand: created });
    }
    catch (e) {
        console.error('Admin brand create error:', e);
        res.status(500).json({ message: e?.message || 'Failed to create brand' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2JyYW5kcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFNQSxrQkFvQkM7QUFFRCxvQkFvQ0M7QUEvREQsb0RBQXNEO0FBR3pDLFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUV6QixLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQWUscUJBQVksQ0FBQyxDQUFBO1FBQ2xFLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUN2RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXhELE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQzNELEVBQUUsRUFDRjtZQUNFLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLEtBQUs7WUFDWCxLQUFLLEVBQUUsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7U0FDN0MsQ0FDRixDQUFBO1FBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDNUMsQ0FBQztJQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUMzQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLHVCQUF1QixFQUFFLENBQUMsQ0FBQTtJQUMxRSxDQUFDO0FBQ0gsQ0FBQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBZSxxQkFBWSxDQUFDLENBQUE7UUFDbEUsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBUSxDQUFBO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSTtZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO1FBRTdFLHlGQUF5RjtRQUN6RixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQzdCLENBQUM7YUFDRSxRQUFRLEVBQUU7YUFDVixXQUFXLEVBQUU7YUFDYixJQUFJLEVBQUU7YUFDTixPQUFPLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQzthQUMzQixPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRTVCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFNUUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQTtRQUNsRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFBO1FBRXhELE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDakQsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLElBQUk7Z0JBQ0osV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSTtnQkFDckMsUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJO2dCQUNqQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsSUFBSSxLQUFLO2dCQUNwQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDO2FBQ3ZDLENBQUMsQ0FBQyxDQUFBO1FBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzlCLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sSUFBSSx3QkFBd0IsRUFBRSxDQUFDLENBQUE7SUFDM0UsQ0FBQztBQUNILENBQUMifQ==