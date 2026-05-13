/**
 * Setup Full Category Hierarchy
 * Based on Product Category Excel from External ERP
 * 
 * Run with: npx medusa exec ./src/scripts/setup-full-categories.ts
 */

import { ExecArgs } from "@medusajs/framework/types";
import { createProductCategoriesWorkflow, updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

// Category structure based on Excel file
// Only including "All / Saleable" categories (actual products)
interface CategoryItem {
  name: string;
  handle: string;
  nameAr?: string;
  children?: CategoryItem[];
}

const CATEGORY_TREE: CategoryItem[] = [
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

export default async function setupFullCategories({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const query = container.resolve("query");

  logger.info("🔧 Setting up full category hierarchy from Excel data...");

  // Helper to check if category exists
  async function findCategoryByHandle(handle: string): Promise<any | null> {
    try {
      const { data } = await query.graph({
        entity: "product_category",
        fields: ["id", "name", "handle", "parent_category_id"],
        filters: { handle },
      });
      return data && data.length > 0 ? data[0] : null;
    } catch {
      return null;
    }
  }

  // Helper function to create category with proper metadata
  async function createOrUpdateCategory(
    data: CategoryItem,
    parentCategoryId: string | null = null
  ): Promise<string> {
    try {
      // Check if category exists
      const existing = await findCategoryByHandle(data.handle);

      let categoryId: string;

      if (existing) {
        // Update existing category with parent if needed
        if (parentCategoryId && existing.parent_category_id !== parentCategoryId) {
          try {
            await updateProductCategoriesWorkflow(container).run({
              input: {
                selector: { id: existing.id },
                update: {
                  parent_category_id: parentCategoryId,
                  metadata: { name_ar: data.nameAr || null },
                },
              },
            });
            logger.info(`  ✓ Updated parent: ${data.name} (${data.handle})`);
          } catch (e) {
            // Ignore update errors
          }
        }
        categoryId = existing.id;
        logger.info(`  ✓ Exists: ${data.name} (${data.handle})`);
      } else {
        // Create new category
        const { result } = await createProductCategoriesWorkflow(container).run({
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
    } catch (error: any) {
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

  } catch (error: any) {
    logger.error(`❌ Failed to setup categories: ${error.message}`);
    throw error;
  }
}
