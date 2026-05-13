"use strict";
/**
 * Force Delete and Recreate All Categories
 * Uses direct database queries to ensure clean slate
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = recreateCategories;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
// Complete category tree
const CATEGORIES = [
    // Mobile & Tablet
    { name: "Mobile & Tablet", handle: "mobile-tablet", parent: null },
    { name: "Mobiles", handle: "mobiles", parent: "mobile-tablet" },
    { name: "iPhone", handle: "iphone", parent: "mobiles" },
    { name: "Samsung", handle: "samsung-mobiles", parent: "mobiles" },
    { name: "Asus ROG", handle: "asus-rog", parent: "mobiles" },
    { name: "One Plus", handle: "one-plus", parent: "mobiles" },
    { name: "Nothing Technology", handle: "nothing-technology", parent: "mobiles" },
    { name: "Vivo", handle: "vivo", parent: "mobiles" },
    { name: "Oppo", handle: "oppo", parent: "mobiles" },
    { name: "Tablets", handle: "tablets", parent: "mobile-tablet" },
    { name: "Lenovo", handle: "lenovo-tablets", parent: "tablets" },
    { name: "Amazon", handle: "amazon-tablets", parent: "tablets" },
    { name: "Apple", handle: "apple-tablets", parent: "tablets" },
    { name: "Green Lion", handle: "green-lion-tablets", parent: "tablets" },
    { name: "Huawei", handle: "huawei-tablets", parent: "tablets" },
    { name: "Samsung", handle: "samsung-tablets", parent: "tablets" },
    { name: "Mobile Accessories", handle: "mobile-accessories", parent: "mobile-tablet" },
    { name: "Lanyard", handle: "lanyard", parent: "mobile-accessories" },
    { name: "Mobile Cases", handle: "mobile-cases", parent: "mobile-accessories" },
    { name: "Screen Protectors", handle: "screen-protectors", parent: "mobile-accessories" },
    { name: "OTG Adapter", handle: "otg-adapter", parent: "mobile-accessories" },
    { name: "Mobile Charger", handle: "mobile-charger", parent: "mobile-accessories" },
    { name: "Holder", handle: "mobile-holder", parent: "mobile-accessories" },
    { name: "Screen Cleaners", handle: "screen-cleaners", parent: "mobile-accessories" },
    { name: "Phone Cooler", handle: "phone-cooler", parent: "mobile-accessories" },
    { name: "Charging Cables", handle: "charging-cables", parent: "mobile-accessories" },
    { name: "IQOS Cases", handle: "iqos-cases", parent: "mobile-accessories" },
    { name: "Lenses", handle: "mobile-lenses", parent: "mobile-accessories" },
    { name: "Lens Protectors", handle: "lens-protectors", parent: "mobile-accessories" },
    { name: "UV Phone Steriliser Boxes", handle: "uv-phone-steriliser-boxes", parent: "mobile-accessories" },
    { name: "Holders, Grips & Stands", handle: "holders-grips-stands", parent: "mobile-accessories" },
    { name: "Smart Tag", handle: "smart-tag", parent: "mobile-accessories" },
    { name: "Styluses & Pens", handle: "styluses-pens", parent: "mobile-accessories" },
    { name: "Tablet Accessories", handle: "tablet-accessories", parent: "mobile-tablet" },
    { name: "Tablet Cases", handle: "tablet-cases", parent: "tablet-accessories" },
    { name: "Tablet Screen Protector", handle: "tablet-screen-protector", parent: "tablet-accessories" },
    { name: "Tablet Stands", handle: "tablet-stands", parent: "tablet-accessories" },
    { name: "Tablet Keyboards", handle: "tablet-keyboards", parent: "tablet-accessories" },
    { name: "Power Banks", handle: "power-banks", parent: "mobile-tablet" },
    { name: "Under 10K mAh", handle: "power-banks-under-10k", parent: "power-banks" },
    { name: "10-20K mAh", handle: "power-banks-10-20k", parent: "power-banks" },
    { name: "21-30K mAh", handle: "power-banks-21-30k", parent: "power-banks" },
    { name: "Over 31000mAh", handle: "power-banks-over-31k", parent: "power-banks" },
    { name: "Power Station", handle: "power-station", parent: "mobile-tablet" },
    // Health & Beauty
    { name: "Health & Beauty", handle: "health-beauty", parent: null },
    { name: "Beauty & Cosmetics", handle: "beauty-cosmetics", parent: "health-beauty" },
    { name: "Make-Up Organizer", handle: "makeup-organizer", parent: "beauty-cosmetics" },
    { name: "Makeup Mirrors", handle: "makeup-mirrors", parent: "beauty-cosmetics" },
    { name: "Fragrances & Perfumes", handle: "fragrances-perfumes", parent: "beauty-cosmetics" },
    { name: "Manicure & Pedicure", handle: "manicure-pedicure", parent: "beauty-cosmetics" },
    { name: "Hair Styling", handle: "hair-styling", parent: "beauty-cosmetics" },
    { name: "Shavers & Hair Removal", handle: "shavers-hair-removal", parent: "health-beauty" },
    { name: "Shavers and Trimmers", handle: "shavers-trimmers", parent: "shavers-hair-removal" },
    { name: "Hair Remover", handle: "hair-remover", parent: "shavers-hair-removal" },
    { name: "Health", handle: "health", parent: "health-beauty" },
    { name: "Ring", handle: "health-ring", parent: "health" },
    { name: "Medical Care", handle: "medical-care", parent: "health" },
    { name: "Face Masks & Shields", handle: "face-masks-shields", parent: "health" },
    { name: "Massage & Relaxation", handle: "massage-relaxation", parent: "health" },
    { name: "Baby Care", handle: "baby-care", parent: "health" },
    { name: "Health & Skin Care", handle: "health-skin-care", parent: "health" },
    { name: "Dental Care", handle: "dental-care", parent: "health" },
    { name: "Fitness", handle: "fitness", parent: "health-beauty" },
    { name: "Health & Fitness Equipments", handle: "fitness-equipments", parent: "fitness" },
    { name: "Smart Body Scales", handle: "smart-body-scales", parent: "fitness" },
    // Electronics
    { name: "Electronics", handle: "electronics", parent: null },
    { name: "Watches", handle: "watches", parent: "electronics" },
    { name: "Kids' Smart Watches", handle: "kids-smart-watches", parent: "watches" },
    { name: "Smart Bands", handle: "smart-bands", parent: "watches" },
    { name: "Smart Watches", handle: "smart-watches", parent: "watches" },
    { name: "Watch Accessories", handle: "watch-accessories", parent: "electronics" },
    { name: "Bands & Straps", handle: "bands-straps", parent: "watch-accessories" },
    { name: "Watch Screen Protectors", handle: "watch-screen-protectors", parent: "watch-accessories" },
    { name: "Cases & Covers", handle: "watch-cases-covers", parent: "watch-accessories" },
    { name: "Smart Watch Chargers", handle: "smart-watch-chargers", parent: "watch-accessories" },
    { name: "Speakers & Accessories", handle: "speakers-accessories", parent: "electronics" },
    { name: "Bluetooth Speakers", handle: "bluetooth-speakers", parent: "speakers-accessories" },
    { name: "AUX Cables", handle: "aux-cables", parent: "speakers-accessories" },
    { name: "Speaker Cases & Covers", handle: "speaker-cases-covers", parent: "speakers-accessories" },
    { name: "Home Speakers & Soundbars", handle: "home-speakers-soundbars", parent: "speakers-accessories" },
    { name: "Earphones & Headphones", handle: "earphones-headphones", parent: "electronics" },
    { name: "Kids' Headphones", handle: "kids-headphones", parent: "earphones-headphones" },
    { name: "On-Ear Headphones", handle: "on-ear-headphones", parent: "earphones-headphones" },
    { name: "Open-Ear Headphones", handle: "open-ear-headphones", parent: "earphones-headphones" },
    { name: "Over-Ear Headphones", handle: "over-ear-headphones", parent: "earphones-headphones" },
    { name: "Earbuds", handle: "earbuds", parent: "earphones-headphones" },
    { name: "Earbuds Accessories", handle: "earbuds-accessories", parent: "earphones-headphones" },
    { name: "Earphones", handle: "earphones", parent: "earphones-headphones" },
    { name: "Microphones", handle: "microphones", parent: "earphones-headphones" },
    { name: "Cameras", handle: "cameras", parent: "electronics" },
    { name: "Digital Cameras", handle: "digital-cameras", parent: "cameras" },
    { name: "DSLR Cameras", handle: "dslr-cameras", parent: "cameras" },
    { name: "Mirrorless Cameras", handle: "mirrorless-cameras", parent: "cameras" },
    { name: "Action Cameras", handle: "action-cameras", parent: "cameras" },
    { name: "Security Cameras", handle: "security-cameras", parent: "cameras" },
    { name: "Drones", handle: "drones", parent: "cameras" },
    { name: "Binoculars", handle: "binoculars", parent: "cameras" },
    { name: "Tripods", handle: "tripods", parent: "cameras" },
    { name: "Camera Accessories", handle: "camera-accessories", parent: "cameras" },
    { name: "Gimbals", handle: "gimbals", parent: "cameras" },
    { name: "Instant Photo Printers", handle: "instant-photo-printers", parent: "cameras" },
    { name: "Printers & Scanners", handle: "printers-scanners", parent: "electronics" },
    { name: "Printers", handle: "printers", parent: "printers-scanners" },
    { name: "Scanners", handle: "scanners", parent: "printers-scanners" },
    { name: "Printer Cartridges & Inks", handle: "printer-cartridges-inks", parent: "printers-scanners" },
    { name: "Televisions", handle: "televisions", parent: "electronics" },
    { name: "Powerology", handle: "powerology", parent: "electronics" },
    { name: "Others", handle: "electronics-others", parent: "electronics" },
    { name: "Glasses & Accessories", handle: "glasses-accessories", parent: "electronics" },
    { name: "Streaming Devices", handle: "streaming-devices", parent: "electronics" },
    { name: "Projectors", handle: "projectors", parent: "electronics" },
    // Home & Kitchen
    { name: "Home & Kitchen", handle: "home-kitchen", parent: null },
    { name: "Home", handle: "home", parent: "home-kitchen" },
    { name: "Electric Mosquito Killers", handle: "electric-mosquito-killers", parent: "home" },
    { name: "Refrigerators", handle: "refrigerators", parent: "home" },
    { name: "Portable Fridges", handle: "portable-fridges", parent: "refrigerators" },
    { name: "Mini Fridges", handle: "mini-fridges", parent: "refrigerators" },
    { name: "Ice Makers", handle: "ice-makers", parent: "refrigerators" },
    { name: "Cleaning", handle: "cleaning", parent: "home" },
    { name: "Washers & Dryers", handle: "washers-dryers", parent: "cleaning" },
    { name: "Vacuum and Cleaners", handle: "vacuum-cleaners", parent: "cleaning" },
    { name: "Jet Fan & Blower", handle: "jet-fan-blower", parent: "cleaning" },
    { name: "Irons & Steamers", handle: "irons-steamers", parent: "cleaning" },
    { name: "Bakhour", handle: "bakhour", parent: "home" },
    { name: "Aroma Diffusers", handle: "aroma-diffusers", parent: "home" },
    { name: "Air Conditioning", handle: "air-conditioning", parent: "home" },
    { name: "Portable Fan", handle: "portable-fan", parent: "air-conditioning" },
    { name: "Air Coolers", handle: "air-coolers", parent: "air-conditioning" },
    { name: "Air Purifiers", handle: "air-purifiers", parent: "air-conditioning" },
    { name: "Smart Home", handle: "smart-home", parent: "home" },
    { name: "Pet Supplies", handle: "pet-supplies", parent: "home" },
    { name: "Lightings", handle: "lightings", parent: "home" },
    { name: "Tools", handle: "tools", parent: "home" },
    { name: "Kitchen", handle: "kitchen", parent: "home-kitchen" },
    { name: "Kitchen Appliances", handle: "kitchen-appliances", parent: "kitchen" },
    { name: "Grill & Toaster", handle: "grill-toaster", parent: "kitchen-appliances" },
    { name: "Water Dispenser", handle: "water-dispenser", parent: "kitchen-appliances" },
    { name: "Blenders, Juicers & Mixers", handle: "blenders-juicers-mixers", parent: "kitchen-appliances" },
    { name: "Food Weighing Scales", handle: "food-weighing-scales", parent: "kitchen-appliances" },
    { name: "Choppers", handle: "choppers", parent: "kitchen-appliances" },
    { name: "Electric Pressure Cooker", handle: "electric-pressure-cooker", parent: "kitchen-appliances" },
    { name: "Thermal Mugs & Bottles", handle: "thermal-mugs-bottles", parent: "kitchen-appliances" },
    { name: "Kettle", handle: "kettle", parent: "kitchen-appliances" },
    { name: "Air Fryers", handle: "air-fryers", parent: "kitchen-appliances" },
    { name: "Vacuum Sealers", handle: "vacuum-sealers", parent: "kitchen-appliances" },
    { name: "Coffee, Tea & Espresso", handle: "coffee-tea-espresso", parent: "kitchen" },
    { name: "Espresso Machines", handle: "espresso-machines", parent: "coffee-tea-espresso" },
    { name: "Coffee Brewers", handle: "coffee-brewers", parent: "coffee-tea-espresso" },
    { name: "Portable Coffee Maker", handle: "portable-coffee-maker", parent: "coffee-tea-espresso" },
    { name: "Grinder", handle: "grinder", parent: "coffee-tea-espresso" },
    { name: "Milk Frother", handle: "milk-frother", parent: "coffee-tea-espresso" },
    { name: "Equipment", handle: "coffee-equipment", parent: "coffee-tea-espresso" },
    { name: "Office", handle: "office", parent: "home-kitchen" },
    { name: "Presenter", handle: "presenter", parent: "office" },
    { name: "Smart Sockets", handle: "smart-sockets", parent: "office" },
    { name: "Extension Power Sockets", handle: "extension-power-sockets", parent: "office" },
    { name: "Batteries", handle: "batteries", parent: "office" },
    { name: "Stationery", handle: "stationery", parent: "office" },
    // Fashion
    { name: "Fashion", handle: "fashion", parent: null },
    { name: "Luggages & Accessories", handle: "luggages-accessories", parent: "fashion" },
    { name: "Luggage", handle: "luggage", parent: "luggages-accessories" },
    { name: "Travel Accessories", handle: "travel-accessories", parent: "luggages-accessories" },
    { name: "Bags", handle: "bags", parent: "fashion" },
    { name: "Backpacks", handle: "backpacks", parent: "bags" },
    { name: "Bags & Wallets", handle: "bags-wallets", parent: "bags" },
    // Offroad
    { name: "Offroad", handle: "offroad", parent: null },
    { name: "Camping Essentials", handle: "camping-essentials", parent: "offroad" },
    { name: "Chair & Table", handle: "chair-table", parent: "camping-essentials" },
    { name: "Bidet", handle: "bidet", parent: "camping-essentials" },
    { name: "Other Camping Accessories", handle: "other-camping-accessories", parent: "camping-essentials" },
    { name: "Sleeping Gear & Shelter", handle: "sleeping-gear-shelter", parent: "offroad" },
    { name: "Mattress", handle: "mattress", parent: "sleeping-gear-shelter" },
    { name: "Tent", handle: "tent", parent: "sleeping-gear-shelter" },
    { name: "Communication & Power Solutions", handle: "communication-power-solutions", parent: "offroad" },
    { name: "Radio Communication Devices", handle: "radio-communication-devices", parent: "communication-power-solutions" },
    { name: "Power Generators", handle: "power-generators", parent: "communication-power-solutions" },
    { name: "Camp Cooking & Lighting", handle: "camp-cooking-lighting", parent: "offroad" },
    { name: "Lights", handle: "camping-lights", parent: "camp-cooking-lighting" },
    { name: "Stove & Grill", handle: "stove-grill", parent: "camp-cooking-lighting" },
    // Computers & Gaming
    { name: "Computers & Gaming", handle: "computers-gaming", parent: null },
    { name: "Laptops", handle: "laptops", parent: "computers-gaming" },
    { name: "MSI", handle: "msi-laptops", parent: "laptops" },
    { name: "Asus", handle: "asus-laptops", parent: "laptops" },
    { name: "Microsoft", handle: "microsoft-laptops", parent: "laptops" },
    { name: "Dell", handle: "dell-laptops", parent: "laptops" },
    { name: "HP", handle: "hp-laptops", parent: "laptops" },
    { name: "Lenovo", handle: "lenovo-laptops", parent: "laptops" },
    { name: "Macbook", handle: "macbook", parent: "laptops" },
    { name: "Laptops Accessories", handle: "laptops-accessories", parent: "computers-gaming" },
    { name: "Cooling Pad", handle: "cooling-pad", parent: "laptops-accessories" },
    { name: "Laptop Cases & Covers", handle: "laptop-cases-covers", parent: "laptops-accessories" },
    { name: "Laptop Bags & Sleeves", handle: "laptop-bags-sleeves", parent: "laptops-accessories" },
    { name: "Laptop Stands", handle: "laptop-stands", parent: "laptops-accessories" },
    { name: "Laptop Screen Protectors", handle: "laptop-screen-protectors", parent: "laptops-accessories" },
    { name: "Computer Accessories", handle: "computer-accessories", parent: "computers-gaming" },
    { name: "Monitors", handle: "monitors", parent: "computer-accessories" },
    { name: "Cleaning", handle: "computer-cleaning", parent: "computer-accessories" },
    { name: "Mouse & Keyboards", handle: "mouse-keyboards", parent: "computer-accessories" },
    { name: "Mouse & Keyboard Combos", handle: "mouse-keyboard-combos", parent: "mouse-keyboards" },
    { name: "Mouse", handle: "mouse", parent: "mouse-keyboards" },
    { name: "Keyboards", handle: "keyboards", parent: "mouse-keyboards" },
    { name: "Mouse Pad", handle: "mouse-pad", parent: "mouse-keyboards" },
    { name: "USB Hubs", handle: "usb-hubs", parent: "computer-accessories" },
    { name: "HDMI Cables", handle: "hdmi-cables", parent: "computer-accessories" },
    { name: "Memory Card Readers", handle: "memory-card-readers", parent: "computer-accessories" },
    { name: "Webcams", handle: "webcams", parent: "computer-accessories" },
    { name: "Storage", handle: "storage", parent: "computers-gaming" },
    { name: "External SSD", handle: "external-ssd", parent: "storage" },
    { name: "USB Flash Drives", handle: "usb-flash-drives", parent: "storage" },
    { name: "Networking", handle: "networking", parent: "computers-gaming" },
    { name: "Wireless Routers", handle: "wireless-routers", parent: "networking" },
    { name: "Wireless Adapters", handle: "wireless-adapters", parent: "networking" },
    { name: "Routers", handle: "routers", parent: "networking" },
    { name: "Gaming Devices", handle: "gaming-devices", parent: "computers-gaming" },
    { name: "Laptops & Desktops", handle: "gaming-laptops-desktops", parent: "gaming-devices" },
    { name: "Consoles", handle: "consoles", parent: "gaming-devices" },
    { name: "Gaming Consoles", handle: "gaming-consoles", parent: "consoles" },
    { name: "Xbox", handle: "xbox", parent: "consoles" },
    { name: "PlayStation", handle: "playstation", parent: "consoles" },
    { name: "Gaming Accessories", handle: "gaming-accessories", parent: "gaming-devices" },
    { name: "Joysticks", handle: "joysticks", parent: "gaming-accessories" },
    { name: "Gaming Keyboard & Mouse Combos", handle: "gaming-keyboard-mouse-combos", parent: "gaming-accessories" },
    { name: "Gaming Speaker", handle: "gaming-speaker", parent: "gaming-accessories" },
    { name: "Gaming Keyboards", handle: "gaming-keyboards", parent: "gaming-accessories" },
    { name: "Gaming Headphones", handle: "gaming-headphones", parent: "gaming-accessories" },
    { name: "Gaming Mouse", handle: "gaming-mouse", parent: "gaming-accessories" },
    { name: "Gaming Chairs", handle: "gaming-chairs", parent: "gaming-accessories" },
    // Toys, Games & Kids
    { name: "Toys, Games & Kids", handle: "toys-games-kids", parent: null },
    { name: "Toys", handle: "toys", parent: "toys-games-kids" },
    { name: "Water Pools", handle: "water-pools", parent: "toys" },
    { name: "Walkie Talkies", handle: "walkie-talkies", parent: "toys" },
    { name: "Cycling", handle: "cycling", parent: "toys-games-kids" },
    { name: "Electric Bicycle", handle: "electric-bicycle", parent: "cycling" },
    { name: "Electric Scooters", handle: "electric-scooters", parent: "cycling" },
    { name: "Electric Scooter Accessories", handle: "electric-scooter-accessories", parent: "cycling" },
    // Automotives
    { name: "Automotives", handle: "automotives", parent: null },
    { name: "Car Electronics", handle: "car-electronics", parent: "automotives" },
    { name: "Car Chargers & Transmitters", handle: "car-chargers-transmitters", parent: "car-electronics" },
    { name: "Camera & Sensor", handle: "car-camera-sensor", parent: "car-electronics" },
    { name: "Jump Starters", handle: "jump-starters", parent: "car-electronics" },
    { name: "Tire Gauge", handle: "tire-gauge", parent: "car-electronics" },
    { name: "Car Multimedia", handle: "car-multimedia", parent: "car-electronics" },
    { name: "Mobile Mounts & Chargers", handle: "mobile-mounts-chargers", parent: "car-electronics" },
    { name: "Car Interior", handle: "car-interior", parent: "automotives" },
    { name: "Interior Care", handle: "interior-care", parent: "car-interior" },
    { name: "Car Organizers", handle: "car-organizers", parent: "car-interior" },
    { name: "Car Exterior", handle: "car-exterior", parent: "automotives" },
    { name: "Compressor & Inflators", handle: "compressor-inflators", parent: "car-exterior" },
    { name: "Car Wash", handle: "car-wash", parent: "car-exterior" },
    { name: "Other Exterior", handle: "other-exterior", parent: "car-exterior" },
    // Hot Deals
    { name: "Hot Deals", handle: "hot-deals", parent: null },
];
async function recreateCategories({ container }) {
    const productCategoryService = container.resolve(utils_1.Modules.PRODUCT);
    const logger = container.resolve("logger");
    logger.info("🚀 Recreating all categories...\n");
    // Store handle to ID mapping
    const handleToId = {};
    try {
        // First, delete all existing categories
        logger.info("Step 1: Deleting all existing categories...\n");
        let allCategories = await productCategoryService.listProductCategories({}, { take: 1000 });
        while (allCategories.length > 0) {
            const ids = allCategories.map(c => c.id);
            for (const id of ids) {
                try {
                    await productCategoryService.deleteProductCategories([id]);
                }
                catch (e) {
                    // Ignore
                }
            }
            allCategories = await productCategoryService.listProductCategories({}, { take: 1000 });
            logger.info(`  Remaining: ${allCategories.length}`);
        }
        logger.info("  ✓ All categories deleted\n");
        // Step 2: Create categories in order (parents first)
        logger.info("Step 2: Creating new categories...\n");
        // First pass: create all root categories
        for (const cat of CATEGORIES.filter(c => c.parent === null)) {
            try {
                const { result } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
                    input: {
                        product_categories: [{
                                name: cat.name,
                                handle: cat.handle,
                                is_active: true,
                                is_internal: false,
                            }]
                    }
                });
                handleToId[cat.handle] = result[0].id;
                logger.info(`  ✓ Created: ${cat.name}`);
            }
            catch (e) {
                logger.warn(`  ⚠️ Failed: ${cat.name} - ${e.message}`);
            }
        }
        // Multiple passes for children (to handle nested categories)
        for (let pass = 0; pass < 5; pass++) {
            for (const cat of CATEGORIES.filter(c => c.parent !== null)) {
                if (handleToId[cat.handle])
                    continue; // Already created
                const parentId = handleToId[cat.parent];
                if (!parentId)
                    continue; // Parent not created yet
                try {
                    const { result } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
                        input: {
                            product_categories: [{
                                    name: cat.name,
                                    handle: cat.handle,
                                    parent_category_id: parentId,
                                    is_active: true,
                                    is_internal: false,
                                }]
                        }
                    });
                    handleToId[cat.handle] = result[0].id;
                    logger.info(`  ✓ Created: ${cat.name}`);
                }
                catch (e) {
                    // Will retry in next pass
                }
            }
        }
        // Count results
        const finalCount = Object.keys(handleToId).length;
        logger.info(`\n✅ Done! Created ${finalCount} categories.`);
        // List main categories
        const mainCats = CATEGORIES.filter(c => c.parent === null);
        logger.info(`\nMain categories (${mainCats.length}):`);
        mainCats.forEach(c => {
            logger.info(`  - ${c.name} (${c.handle})`);
        });
    }
    catch (error) {
        logger.error("Failed:", error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjcmVhdGUtY2F0ZWdvcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3JlY3JlYXRlLWNhdGVnb3JpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUF3UkgscUNBK0ZDO0FBcFhELHFEQUFvRDtBQUNwRCw0REFBOEU7QUFFOUUseUJBQXlCO0FBQ3pCLE1BQU0sVUFBVSxHQUFHO0lBQ2pCLGtCQUFrQjtJQUNsQixFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDbEUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRTtJQUMvRCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO0lBQ3ZELEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRTtJQUNqRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO0lBQzNELEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUU7SUFDM0QsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUU7SUFDL0UsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRTtJQUNuRCxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO0lBQ25ELEVB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