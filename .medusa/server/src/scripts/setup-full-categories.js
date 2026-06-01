"use strict";
/**
 * Setup Full Category Hierarchy
 * Based on Product Category Excel from External ERP
 *
 * Run with: npx medusa exec ./src/scripts/setup-full-categories.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupFullCategories;
const core_flows_1 = require("@medusajs/medusa/core-flows");
const CATEGORY_TREE = [
    // === CABLE Category ===
    {
        name: "Cable",
        handle: "cable",
        nameAr: "كيبلات",
        children: [
            { name: "Aux Cable", handle: "aux-cable", nameAr: "كيبل أوكس" },
            {
                name: "Braided",
                handle: "braided-cable",
                nameAr: "مضفر",
                children: [
                    { name: "A to Lightning", handle: "braided-a-to-lightning", nameAr: "A إلى لايتننق" },
                    { name: "A to Micro", handle: "braided-a-to-micro", nameAr: "A إلى مايكرو" },
                    { name: "A to Type C", handle: "braided-a-to-type-c", nameAr: "A إلى تايب سي" },
                    { name: "All in One Cable", handle: "braided-all-in-one", nameAr: "الكل في واحد" },
                    { name: "C to C", handle: "braided-c-to-c", nameAr: "سي إلى سي" },
                    { name: "C to Lightning", handle: "braided-c-to-lightning", nameAr: "سي إلى لايتننق" },
                ]
            },
            { name: "HDMI", handle: "hdmi-cable", nameAr: "اتش دي ام اي" },
            {
                name: "PVC",
                handle: "pvc-cable",
                nameAr: "بي في سي",
                children: [
                    { name: "A to Lightning", handle: "pvc-a-to-lightning", nameAr: "A إلى لايتننق" },
                    { name: "A to Micro", handle: "pvc-a-to-micro", nameAr: "A إلى مايكرو" },
                    { name: "A to Type C", handle: "pvc-a-to-type-c", nameAr: "A إلى تايب سي" },
                    { name: "All in One Cable", handle: "pvc-all-in-one", nameAr: "الكل في واحد" },
                    { name: "C to C", handle: "pvc-c-to-c", nameAr: "سي إلى سي" },
                    { name: "C to Lightning", handle: "pvc-c-to-lightning", nameAr: "سي إلى لايتننق" },
                ]
            },
        ]
    },
    // === CASE Category ===
    {
        name: "Case",
        handle: "case",
        nameAr: "كفرات",
        children: [
            {
                name: "Apple",
                handle: "case-apple",
                nameAr: "أبل",
                children: [
                    { name: "Airpods", handle: "case-apple-airpods", nameAr: "ايربودز" },
                    { name: "iPhone 14", handle: "case-iphone-14", nameAr: "آيفون 14" },
                    { name: "iPhone 15", handle: "case-iphone-15", nameAr: "آيفون 15" },
                    { name: "iPhone 16", handle: "case-iphone-16", nameAr: "آيفون 16" },
                    { name: "iPhone 17", handle: "case-iphone-17", nameAr: "آيفون 17" },
                ]
            },
            { name: "Samsung", handle: "case-samsung", nameAr: "سامسونج" },
        ]
    },
    // === CHARGER Category ===
    {
        name: "Charger",
        handle: "charger",
        nameAr: "شواحن",
        children: [
            {
                name: "Car Charger",
                handle: "car-charger",
                nameAr: "شاحن سيارة",
                children: [
                    { name: "PD", handle: "car-charger-pd", nameAr: "بي دي" },
                    { name: "PD QC", handle: "car-charger-pd-qc", nameAr: "بي دي كيو سي" },
                    { name: "USB A", handle: "car-charger-usb-a", nameAr: "يو اس بي ايه" },
                ]
            },
            {
                name: "Home Charger",
                handle: "home-charger",
                nameAr: "شاحن منزلي",
                children: [
                    { name: "PD", handle: "home-charger-pd", nameAr: "بي دي" },
                    { name: "PD QC", handle: "home-charger-pd-qc", nameAr: "بي دي كيو سي" },
                    { name: "USB A", handle: "home-charger-usb-a", nameAr: "يو اس بي ايه" },
                ]
            },
            { name: "Universal Charger", handle: "universal-charger", nameAr: "شاحن عالمي" },
            { name: "Wireless Charger", handle: "wireless-charger", nameAr: "شاحن لاسلكي" },
        ]
    },
    // === COMPUTER Category ===
    {
        name: "Computer",
        handle: "computer",
        nameAr: "كمبيوتر",
        children: [
            { name: "Bag", handle: "computer-bag", nameAr: "حقيبة" },
            { name: "Combo", handle: "computer-combo", nameAr: "كومبو" },
            { name: "Keyboard", handle: "computer-keyboard", nameAr: "لوحة مفاتيح" },
            { name: "Monitor", handle: "computer-monitor", nameAr: "شاشة" },
            { name: "Mouse", handle: "computer-mouse", nameAr: "ماوس" },
            { name: "Router", handle: "computer-router", nameAr: "راوتر" },
            { name: "Screens", handle: "computer-screens", nameAr: "شاشات" },
        ]
    },
    // === EARPHONE Category ===
    {
        name: "Earphone",
        handle: "earphone",
        nameAr: "سماعات أذن",
        children: [
            { name: "3.5MM", handle: "earphone-3-5mm", nameAr: "3.5 ملم" },
            { name: "Lightning", handle: "earphone-lightning", nameAr: "لايتننق" },
            { name: "Type C", handle: "earphone-type-c", nameAr: "تايب سي" },
        ]
    },
    // === GAMING Category ===
    {
        name: "Gaming",
        handle: "gaming",
        nameAr: "ألعاب",
        children: [
            { name: "Chair", handle: "gaming-chair", nameAr: "كرسي" },
            { name: "Charger", handle: "gaming-charger", nameAr: "شاحن" },
            { name: "Console", handle: "gaming-console", nameAr: "كونسول" },
            { name: "Headset", handle: "gaming-headset", nameAr: "سماعة رأس" },
            { name: "Keyboard", handle: "gaming-keyboard", nameAr: "لوحة مفاتيح" },
            { name: "Mic", handle: "gaming-mic", nameAr: "مايك" },
            { name: "Monitor", handle: "gaming-monitor", nameAr: "شاشة" },
            { name: "Mouse", handle: "gaming-mouse", nameAr: "ماوس" },
            { name: "Speaker", handle: "gaming-speaker", nameAr: "سبيكر" },
        ]
    },
    // === HANDSFREE Category ===
    {
        name: "Handsfree",
        handle: "handsfree",
        nameAr: "هاندز فري",
        children: [
            { name: "BT Earphone", handle: "bt-earphone", nameAr: "سماعة بلوتوث" },
            { name: "Headset", handle: "handsfree-headset", nameAr: "سماعة رأس" },
            { name: "Mic", handle: "handsfree-mic", nameAr: "مايك" },
            { name: "TWS and Ear Buds", handle: "tws-earbuds", nameAr: "تي دبليو اس وايربودز" },
        ]
    },
    // === HOLDER, STAND AND STABILIZER ===
    {
        name: "Holder, Stand and Stabilizer",
        handle: "holder-stand-stabilizer",
        nameAr: "حوامل وستاندات",
        children: [
            { name: "Car Mount", handle: "car-mount", nameAr: "حامل سيارة" },
            { name: "Desktop Stand", handle: "desktop-stand", nameAr: "حامل مكتبي" },
            { name: "Gimbal", handle: "gimbal", nameAr: "جيمبل" },
            { name: "TV Stand", handle: "tv-stand", nameAr: "حامل تلفزيون" },
            { name: "Tripod", handle: "tripod", nameAr: "ترايبود" },
        ]
    },
    // === LIFESTYLE Category ===
    {
        name: "LifeStyle",
        handle: "lifestyle",
        nameAr: "لايف ستايل",
        children: [
            { name: "Bag", handle: "lifestyle-bag", nameAr: "حقيبة" },
            { name: "Beauty", handle: "beauty", nameAr: "جمال" },
            { name: "Camping", handle: "camping", nameAr: "تخييم" },
            { name: "Coffee", handle: "coffee", nameAr: "قهوة" },
            { name: "Home Appliance", handle: "home-appliance", nameAr: "أجهزة منزلية" },
        ]
    },
    // === POWER BANK Category ===
    {
        name: "Power Bank",
        handle: "power-banks",
        nameAr: "باور بانك",
        children: [
            { name: "Magsafe", handle: "powerbank-magsafe", nameAr: "ماغ سيف" },
            { name: "Power Generator", handle: "power-generator", nameAr: "مولد طاقة" },
            { name: "Power Station", handle: "power-station", nameAr: "محطة طاقة" },
        ]
    },
    // === PROJECTOR Category ===
    {
        name: "Projector",
        handle: "projector",
        nameAr: "بروجكتور",
        children: [
            { name: "Projector Screen", handle: "projector-screen", nameAr: "شاشة بروجكتور" },
            { name: "Projector Stand", handle: "projector-stand", nameAr: "حامل بروجكتور" },
        ]
    },
    // === SCREEN GUARD Category ===
    {
        name: "Screen Guard",
        handle: "screen-guard",
        nameAr: "واقي شاشة",
        children: [
            {
                name: "Apple",
                handle: "screen-guard-apple",
                nameAr: "أبل",
                children: [
                    { name: "iPad", handle: "screen-guard-ipad", nameAr: "آيباد" },
                    { name: "iPhone 14", handle: "screen-guard-iphone-14", nameAr: "آيفون 14" },
                    { name: "iPhone 15", handle: "screen-guard-iphone-15", nameAr: "آيفون 15" },
                    { name: "iPhone 16", handle: "screen-guard-iphone-16", nameAr: "آيفون 16" },
                    { name: "iPhone 17", handle: "screen-guard-iphone-17", nameAr: "آيفون 17" },
                ]
            },
            {
                name: "Samsung",
                handle: "screen-guard-samsung",
                nameAr: "سامسونج",
                children: [
                    { name: "S24", handle: "screen-guard-s24", nameAr: "اس 24" },
                    { name: "S25", handle: "screen-guard-s25", nameAr: "اس 25" },
                    { name: "S26", handle: "screen-guard-s26", nameAr: "اس 26" },
                ]
            },
        ]
    },
    // === TABLET Category ===
    {
        name: "Tablet",
        handle: "tablet",
        nameAr: "تابلت",
        children: [
            { name: "Keyboard", handle: "tablet-keyboard", nameAr: "لوحة مفاتيح تابلت" },
        ]
    },
    // === Simple categories (no children) ===
    { name: "Aroma", handle: "aroma", nameAr: "عطور" },
    { name: "Battery", handle: "battery", nameAr: "بطاريات" },
    { name: "Camera", handle: "camera", nameAr: "كاميرا" },
    { name: "FM Transmitter", handle: "fm-transmitter", nameAr: "اف ام ترانسميتر" },
    { name: "Film", handle: "film", nameAr: "أفلام" },
    { name: "Hub", handle: "hub", nameAr: "هب" },
    { name: "Office Furniture", handle: "office-furniture", nameAr: "أثاث مكتبي" },
    { name: "Other", handle: "other", nameAr: "أخرى" },
    { name: "Pencil", handle: "pencil", nameAr: "قلم" },
    { name: "Power Socket", handle: "power-socket", nameAr: "مقبس كهرباء" },
    { name: "Services", handle: "services", nameAr: "خدمات" },
    { name: "Smart Tag", handle: "smart-tag", nameAr: "سمارت تاغ" },
    { name: "Smart Watch", handle: "smart-watches", nameAr: "ساعة ذكية" },
    { name: "Software", handle: "software", nameAr: "برامج" },
    { name: "Spare Parts", handle: "spare-parts", nameAr: "قطع غيار" },
    { name: "Speaker", handle: "speaker", nameAr: "سبيكر" },
    { name: "Voice Translator & Wireless Devices", handle: "voice-translator-wireless", nameAr: "مترجم صوتي وأجهزة لاسلكية" },
    { name: "Watch Band", handle: "watch-band", nameAr: "سوار ساعة" },
    // Keep existing main categories
    { name: "Smart Phones", handle: "smart-phones", nameAr: "الهواتف الذكية" },
    { name: "Laptops", handle: "laptops", nameAr: "لابتوبات" },
    { name: "Headphones", handle: "headphones", nameAr: "سماعات الرأس" },
    { name: "Hot Deals", handle: "hot-deals", nameAr: "عروض ساخنة" },
    { name: "Electronics", handle: "electronics", nameAr: "إلكترونيات" },
    { name: "Computers & Gaming", handle: "computers-gaming", nameAr: "كمبيوترات وألعاب" },
    { name: "Mobile & Tablet", handle: "mobile-tablet", nameAr: "موبايل وتابلت" },
];
async function setupFullCategories({ container }) {
    const logger = container.resolve("logger");
    const query = container.resolve("query");
    logger.info("🔧 Setting up full category hierarchy from Excel data...");
    // Helper to check if category exists
    async function findCategoryByHandle(handle) {
        try {
            const { data } = await query.graph({
                entity: "product_category",
                fields: ["id", "name", "handle", "parent_category_id"],
                filters: { handle },
            });
            return data && data.length > 0 ? data[0] : null;
        }
        catch {
            return null;
        }
    }
    // Helper function to create category with proper metadata
    async function createOrUpdateCategory(data, parentCategoryId = null) {
        try {
            // Check if category exists
            const existing = await findCategoryByHandle(data.handle);
            let categoryId;
            if (existing) {
                // Update existing category with parent if needed
                if (parentCategoryId && existing.parent_category_id !== parentCategoryId) {
                    try {
                        await (0, core_flows_1.updateProductCategoriesWorkflow)(container).run({
                            input: {
                                selector: { id: existing.id },
                                update: {
                                    parent_category_id: parentCategoryId,
                                    metadata: { name_ar: data.nameAr || null },
                                },
                            },
                        });
                        logger.info(`  ✓ Updated parent: ${data.name} (${data.handle})`);
                    }
                    catch (e) {
                        // Ignore update errors
                    }
                }
                categoryId = existing.id;
                logger.info(`  ✓ Exists: ${data.name} (${data.handle})`);
            }
            else {
                // Create new category
                const { result } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
                    input: {
                        product_categories: [{
                                name: data.name,
                                handle: data.handle,
                                parent_category_id: parentCategoryId,
                                is_active: true,
                                is_internal: false,
                                metadata: { name_ar: data.nameAr || null },
                            }]
                    }
                });
                categoryId = result[0].id;
                logger.info(`  ✓ Created: ${data.name} (${data.handle})`);
            }
            // Recursively create children
            if (data.children && data.children.length > 0) {
                for (const child of data.children) {
                    await createOrUpdateCategory(child, categoryId);
                }
            }
            return categoryId;
        }
        catch (error) {
            logger.error(`  ✗ Error with ${data.name}: ${error.message}`);
            // Continue with other categories
            return "";
        }
    }
    try {
        // Process all categories from the full hierarchy
        logger.info("\n📁 Creating category hierarchy...\n");
        for (const category of CATEGORY_TREE) {
            await createOrUpdateCategory(category);
        }
        // Count total categories
        const { data: allCategories } = await query.graph({
            entity: "product_category",
            fields: ["id"],
        });
        logger.info(`\n✅ Category setup complete!`);
        logger.info(`   Total categories: ${allCategories?.length || 0}`);
    }
    catch (error) {
        logger.error(`❌ Failed to setup categories: ${error.message}`);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtZnVsbC1jYXRlZ29yaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc2V0dXAtZnVsbC1jYXRlZ29yaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7R0FLRzs7QUE4Ukgsc0NBeUdDO0FBcFlELDREQUErRztBQVcvRyxNQUFNLGFBQWEsR0FBbUI7SUFDcEMseUJBQXlCO0lBQ3pCO1FBQ0UsSUFBSSxFQUFFLE9BQU87UUFDYixNQUFNLEVBQUUsT0FBTztRQUNmLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLFFBQVEsRUFBRTtZQUNSLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7WUFDL0Q7Z0JBQ0UsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFFLGVBQWU7Z0JBQ3ZCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLFFBQVEsRUFBRTtvQkFDUixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRTtvQkFDckYsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFO29CQUM1RSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUU7b0JBQy9FLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFO29CQUNsRixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7b0JBQ2pFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLEVB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