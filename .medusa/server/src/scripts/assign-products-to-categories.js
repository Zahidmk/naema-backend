"use strict";
/**
 * Assign Products to Categories and Brands
 * Based on product names and Odoo data
 *
 * Run with: npx medusa exec ./src/scripts/assign-products-to-categories.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = assignProductsToCategories;
// Category mapping rules based on product name keywords
const CATEGORY_RULES = [
    // Phones - most specific first
    { keywords: ['iphone 17', 'iphone17'], category: 'smart-phones' },
    { keywords: ['iphone 16', 'iphone16'], category: 'smart-phones' },
    { keywords: ['iphone 15', 'iphone15'], category: 'smart-phones' },
    { keywords: ['iphone 14', 'iphone14'], category: 'smart-phones' },
    { keywords: ['iphone'], category: 'smart-phones' },
    { keywords: ['samsung galaxy s', 'galaxy s24', 'galaxy s25', 'galaxy s23'], category: 'smart-phones' },
    { keywords: ['pixel'], category: 'smart-phones' },
    { keywords: ['xiaomi', 'redmi', 'poco'], category: 'smart-phones' },
    { keywords: ['oneplus'], category: 'smart-phones' },
    // AirPods and TWS - check before headphones
    { keywords: ['airpods pro', 'airpods 3', 'airpods 4'], category: 'tws-earbuds' },
    { keywords: ['airpods max'], category: 'headphones' },
    { keywords: ['airpods'], category: 'tws-earbuds' },
    { keywords: ['earbuds', 'tws', 'buds pro', 'buds2', 'galaxy buds'], category: 'tws-earbuds' },
    // Headphones
    { keywords: ['headphone', 'headset', 'over-ear', 'on-ear'], category: 'headphones' },
    // Laptops
    { keywords: ['macbook'], category: 'laptops' },
    { keywords: ['laptop', 'notebook'], category: 'laptops' },
    // Tablets
    { keywords: ['ipad'], category: 'tablet' },
    { keywords: ['tab s', 'galaxy tab'], category: 'tablet' },
    { keywords: ['surface pro'], category: 'tablet' },
    // Smart Watches
    { keywords: ['apple watch'], category: 'smart-watches' },
    { keywords: ['galaxy watch'], category: 'smart-watches' },
    { keywords: ['smartwatch', 'smart watch'], category: 'smart-watches' },
    // Power Banks - specific first
    { keywords: ['magsafe battery', 'magsafe power bank'], category: 'powerbank-magsafe' },
    { keywords: ['power station'], category: 'power-station' },
    { keywords: ['power generator', 'solar generator'], category: 'power-generator' },
    { keywords: ['power bank', 'powerbank', 'portable charger'], category: 'power-banks' },
    // Chargers
    { keywords: ['car charger'], category: 'car-charger' },
    { keywords: ['wireless charger', 'magsafe charger', 'charging pad'], category: 'wireless-charger' },
    { keywords: ['wall charger', 'home charger', 'usb charger', 'power adapter', 'gan charger', 'charging adapter', 'pd charger'], category: 'home-charger' },
    { keywords: ['charger'], category: 'charger' },
    // Cables - specific first
    { keywords: ['braided cable', 'nylon cable'], category: 'braided-cable' },
    { keywords: ['hdmi'], category: 'hdmi-cable' },
    { keywords: ['aux cable', 'audio cable', '3.5mm cable'], category: 'aux-cable' },
    { keywords: ['lightning cable', 'usb-c cable', 'type-c cable', 'charging cable', 'cable'], category: 'cable' },
    // Cases - specific first
    { keywords: ['iphone 14 case', 'case iphone 14'], category: 'case-iphone-14' },
    { keywords: ['iphone 15 case', 'case iphone 15'], category: 'case-iphone-15' },
    { keywords: ['iphone 16 case', 'case iphone 16'], category: 'case-iphone-16' },
    { keywords: ['iphone 17 case', 'case iphone 17'], category: 'case-iphone-17' },
    { keywords: ['airpods case'], category: 'case-apple-airpods' },
    { keywords: ['samsung case', 'galaxy case'], category: 'case-samsung' },
    { keywords: ['case', 'cover'], category: 'case' },
    // Screen Guards
    { keywords: ['screen protector', 'tempered glass', 'screen guard'], category: 'screen-guard' },
    // Gaming
    { keywords: ['ps5', 'playstation', 'xbox', 'nintendo', 'switch'], category: 'gaming-console' },
    { keywords: ['gaming headset'], category: 'gaming-headset' },
    { keywords: ['gaming keyboard', 'mechanical keyboard'], category: 'gaming-keyboard' },
    { keywords: ['gaming mouse'], category: 'gaming-mouse' },
    { keywords: ['gaming chair'], category: 'gaming-chair' },
    { keywords: ['gaming'], category: 'gaming' },
    // Computer Accessories
    { keywords: ['keyboard'], category: 'computer-keyboard' },
    { keywords: ['mouse'], category: 'computer-mouse' },
    { keywords: ['monitor', 'display'], category: 'computer-monitor' },
    { keywords: ['router', 'wifi'], category: 'computer-router' },
    { keywords: ['laptop bag', 'backpack'], category: 'computer-bag' },
    // Speakers
    { keywords: ['speaker', 'soundbar', 'homepod'], category: 'speaker' },
    // Holders and Stands
    { keywords: ['car mount', 'car holder'], category: 'car-mount' },
    { keywords: ['desk stand', 'phone stand', 'tablet stand'], category: 'desktop-stand' },
    { keywords: ['tripod'], category: 'tripod' },
    { keywords: ['gimbal', 'stabilizer'], category: 'gimbal' },
    // Hub
    { keywords: ['hub', 'docking station', 'dongle'], category: 'hub' },
    // Camera
    { keywords: ['camera', 'gopro', 'webcam'], category: 'camera' },
    // Smart Tag
    { keywords: ['airtag', 'smart tag', 'tracker'], category: 'smart-tag' },
    // Watch Band
    { keywords: ['watch band', 'watch strap', 'sport band'], category: 'watch-band' },
    // Pencil
    { keywords: ['apple pencil', 'stylus'], category: 'pencil' },
];
// Brand mapping rules
const BRAND_RULES = [
    { keywords: ['iphone', 'ipad', 'macbook', 'airpods', 'apple watch', 'apple pencil', 'airtag', 'magsafe', 'homepod'], brand: 'Apple' },
    { keywords: ['samsung', 'galaxy'], brand: 'Samsung' },
    { keywords: ['sony', 'playstation', 'ps5'], brand: 'Sony' },
    { keywords: ['xiaomi', 'redmi', 'poco'], brand: 'Xiaomi' },
    { keywords: ['porodo'], brand: 'Porodo' },
    { keywords: ['powerology'], brand: 'Powerology' },
    { keywords: ['anker'], brand: 'Anker' },
    { keywords: ['jbl'], brand: 'JBL' },
    { keywords: ['bose'], brand: 'Bose' },
    { keywords: ['marshall'], brand: 'Marshall' },
    { keywords: ['harman', 'kardon'], brand: 'Harman Kardon' },
    { keywords: ['google', 'pixel'], brand: 'Google' },
    { keywords: ['lenovo', 'thinkpad'], brand: 'Lenovo' },
    { keywords: ['logitech'], brand: 'Logitech' },
    { keywords: ['razer'], brand: 'Razer' },
    { keywords: ['beats'], brand: 'Beats' },
];
async function assignProductsToCategories({ container }) {
    const logger = container.resolve("logger");
    const pgConnection = container.resolve("__pg_connection__");
    logger.info("🔄 Assigning products to categories based on product names (raw SQL, all products)...\n");
    try {
        // Fetch ALL published products using raw SQL — no limit issues
        const productsResult = await pgConnection.raw(`
      SELECT p.id, p.title,
             COALESCE(
               json_agg(pcp.product_category_id) FILTER (WHERE pcp.product_category_id IS NOT NULL),
               '[]'
             ) AS existing_category_ids
      FROM product p
      LEFT JOIN product_category_product pcp ON pcp.product_id = p.id
      WHERE p.status = 'published' AND p.deleted_at IS NULL
      GROUP BY p.id, p.title
      ORDER BY p.title
    `);
        const products = productsResult.rows || [];
        logger.info(`📦 Found ${products.length} products to process\n`);
        // Fetch all categories
        const catsResult = await pgConnection.raw(`
      SELECT id, handle FROM product_category WHERE deleted_at IS NULL
    `);
        const categoryMap = new Map();
        for (const cat of catsResult.rows) {
            categoryMap.set(cat.handle, cat.id);
        }
        logger.info(`📁 Found ${catsResult.rows.length} categories\n`);
        let assignedCount = 0;
        let skippedCount = 0;
        let alreadyCount = 0;
        // Process each product
        for (const product of products) {
            const title = (product.title || '').toLowerCase();
            const existingCategoryIds = new Set(product.existing_category_ids || []);
            // Find matching categories
            const matchedCategoryIds = [];
            const matchedCategoryNames = [];
            for (const rule of CATEGORY_RULES) {
                for (const keyword of rule.keywords) {
                    if (title.includes(keyword.toLowerCase())) {
                        const catId = categoryMap.get(rule.category);
                        if (catId && !existingCategoryIds.has(catId) && !matchedCategoryIds.includes(catId)) {
                            matchedCategoryIds.push(catId);
                            matchedCategoryNames.push(rule.category);
                        }
                        break;
                    }
                }
            }
            if (matchedCategoryIds.length > 0) {
                // Insert new category assignments using raw SQL (ignore duplicates)
                for (const catId of matchedCategoryIds) {
                    await pgConnection.raw(`
            INSERT INTO product_category_product (product_id, product_category_id)
            VALUES (?, ?)
            ON CONFLICT DO NOTHING
          `, [product.id, catId]);
                }
                assignedCount++;
                logger.info(`✓ ${product.title}`);
                logger.info(`  → Categories: ${matchedCategoryNames.join(', ')}`);
            }
            else if (existingCategoryIds.size === 0) {
                skippedCount++;
            }
            else {
                alreadyCount++;
            }
        }
        logger.info(`\n✅ Category assignment complete!`);
        logger.info(`   Products updated: ${assignedCount}`);
        logger.info(`   Products skipped (no match): ${skippedCount}`);
        logger.info(`   Products already categorized: ${alreadyCount}`);
    }
    catch (error) {
        logger.error(`❌ Error: ${error.message}`);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWduLXByb2R1Y3RzLXRvLWNhdGVnb3JpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9hc3NpZ24tcHJvZHVjdHMtdG8tY2F0ZWdvcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7O0dBS0c7O0FBa0lILDZDQXVGQztBQXJORCx3REFBd0Q7QUFDeEQsTUFBTSxjQUFjLEdBQStDO0lBQ2pFLCtCQUErQjtJQUMvQixFQUFFLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFO0lBQ2pFLEVBQUUsUUFBUSxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUU7SUFDakUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRTtJQUNqRSxFQUFFLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFO0lBQ2pFLEVBQUUsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRTtJQUNsRCxFQUFFLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRTtJQUN0RyxFQUFFLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUU7SUFDakQsRUFBRSxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUU7SUFDbkUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFO0lBRW5ELDRDQUE0QztJQUM1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