"use strict";
/**
 * Setup Complete Category Hierarchy
 * Based on the client's final category list
 *
 * Run with: npx medusa exec ./src/scripts/setup-complete-categories.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupCompleteCategories;
const core_flows_1 = require("@medusajs/medusa/core-flows");
// =============================================================================
// COMPLETE CATEGORY TREE - Based on Client's Requirements
// =============================================================================
const CATEGORY_TREE = [
    // 1️⃣ MOBILE & TABLET
    {
        name: "Mobile & Tablet",
        handle: "mobile-tablet",
        nameAr: "موبايل وتابلت",
        children: [
            // Mobiles Section
            {
                name: "Mobiles",
                handle: "mobiles",
                nameAr: "الهواتف المحمولة",
                children: [
                    { name: "iPhone", handle: "iphone", nameAr: "آيفون" },
                    { name: "Samsung", handle: "samsung-mobiles", nameAr: "سامسونج" },
                    { name: "Asus ROG", handle: "asus-rog", nameAr: "أسوس روج" },
                    { name: "One Plus", handle: "one-plus", nameAr: "ون بلس" },
                    { name: "Nothing Technology", handle: "nothing-technology", nameAr: "ناثينج تكنولوجي" },
                    { name: "Vivo", handle: "vivo", nameAr: "فيفو" },
                    { name: "Oppo", handle: "oppo", nameAr: "أوبو" },
                ]
            },
            // Tablets Section
            {
                name: "Tablets",
                handle: "tablets",
                nameAr: "التابلت",
                children: [
                    { name: "Lenovo", handle: "lenovo-tablets", nameAr: "لينوفو" },
                    { name: "Amazon", handle: "amazon-tablets", nameAr: "أمازون" },
                    { name: "Apple", handle: "apple-tablets", nameAr: "أبل" },
                    { name: "Green Lion", handle: "green-lion-tablets", nameAr: "جرين ليون" },
                    { name: "Huawei", handle: "huawei-tablets", nameAr: "هواوي" },
                    { name: "Samsung", handle: "samsung-tablets", nameAr: "سامسونج" },
                ]
            },
            // Mobile Accessories Section
            {
                name: "Mobile Accessories",
                handle: "mobile-accessories",
                nameAr: "اكسسوارات الهاتف",
                children: [
                    { name: "Lanyard", handle: "lanyard", nameAr: "حبل الهاتف" },
                    { name: "Mobile Cases", handle: "mobile-cases", nameAr: "كفرات الهاتف" },
                    { name: "Screen Protectors", handle: "screen-protectors", nameAr: "واقي الشاشة" },
                    { name: "OTG Adapter", handle: "otg-adapter", nameAr: "محول OTG" },
                    { name: "Mobile Charger", handle: "mobile-charger", nameAr: "شاحن الهاتف" },
                    { name: "Holder", handle: "mobile-holder", nameAr: "حامل الهاتف" },
                    { name: "Screen Cleaners", handle: "screen-cleaners", nameAr: "منظف الشاشة" },
                    { name: "Phone Cooler", handle: "phone-cooler", nameAr: "مبرد الهاتف" },
                    { name: "Charging Cables", handle: "charging-cables", nameAr: "كيبلات الشحن" },
                    { name: "IQOS Cases", handle: "iqos-cases", nameAr: "كفرات آيكوس" },
                    { name: "Lenses", handle: "mobile-lenses", nameAr: "عدسات" },
                    { name: "Lens Protectors", handle: "lens-protectors", nameAr: "واقي العدسة" },
                    { name: "UV Phone Steriliser Boxes", handle: "uv-phone-steriliser-boxes", nameAr: "صندوق تعقيم الهاتف" },
                    { name: "Holders, Grips & Stands", handle: "holders-grips-stands", nameAr: "حوامل ومقابض" },
                    { name: "Smart Tag", handle: "smart-tag", nameAr: "سمارت تاج" },
                    { name: "Styluses, Universal Pens & Accessories", handle: "styluses-pens", nameAr: "أقلام ذكية" },
                ]
            },
            // Tablet Accessories Section
            {
                name: "Tablet Accessories",
                handle: "tablet-accessories",
                nameAr: "اكسسوارات التابلت",
                children: [
                    { name: "Tablet Cases", handle: "tablet-cases", nameAr: "كفرات التابلت" },
                    { name: "Tablet Screen Protector", handle: "tablet-screen-protector", nameAr: "واقي شاشة التابلت" },
                    { name: "Tablet Stands", handle: "tablet-stands", nameAr: "حامل التابلت" },
                    { name: "Tablet Keyboards", handle: "tablet-keyboards", nameAr: "لوحة مفاتيح التابلت" },
                ]
            },
            // Power Banks Section
            {
                name: "Power Banks",
                handle: "power-banks",
                nameAr: "باور بانك",
                children: [
                    { name: "Under 10K mAh", handle: "power-banks-under-10k", nameAr: "أقل من 10000 مللي أمبير" },
                    { name: "10-20K mAh", handle: "power-banks-10-20k", nameAr: "10000-20000 مللي أمبير" },
                    { name: "21-30K mAh", handle: "power-banks-21-30k", nameAr: "21000-30000 مللي أمبير" },
                    { name: "Over 31000mAh", handle: "power-banks-over-31k", nameAr: "أكثر من 31000 مللي أمبير" },
                    { name: "Power Station", handle: "power-station", nameAr: "محطة طاقة" },
                ]
            },
        ]
    },
    // 2️⃣ HEALTH & BEAUTY
    {
        name: "Health & Beauty",
        handle: "health-beauty",
        nameAr: "الصحة والجمال",
        children: [
            // Beauty & Cosmetics
            {
                name: "Beauty & Cosmetics",
                handle: "beauty-cosmetics",
                nameAr: "التجميل ومستحضرات التجميل",
                children: [
                    { name: "Make-Up Organizer", handle: "makeup-organizer", nameAr: "منظم المكياج" },
                    { name: "Makeup Mirrors", handle: "makeup-mirrors", nameAr: "مرايا المكياج" },
                    { name: "Fragrances & Perfumes", handle: "fragrances-perfumes", nameAr: "العطور" },
                    { name: "Manicure & Pedicure", handle: "manicure-pedicure", nameAr: "مانيكير وباديكير" },
                ]
            },
            // Hair Styling
            {
                name: "Hair Styling",
                handle: "hair-styling",
                nameAr: "تصفيف الشعر",
            },
            // Shavers & Hair Removal
            {
                name: "Shavers & Hair Removal",
                handle: "shavers-hair-removal",
                nameAr: "الحلاقة وإزالة الشعر",
                children: [
                    { name: "Shavers and Trimmers", handle: "shavers-trimmers", nameAr: "ماكينات الحلاقة" },
                    { name: "Hair Remover", handle: "hair-remover", nameAr: "مزيل الشعر" },
                ]
            },
            // Health
            {
                name: "Health",
                handle: "health",
                nameAr: "الصحة",
                children: [
                    { name: "Ring", handle: "health-ring", nameAr: "خاتم صحي" },
                    { name: "Medical Care", handle: "medical-care", nameAr: "الرعاية الطبية" },
                    { name: "Face Masks & Shields", handle: "face-masks-shields", nameAr: "كمامات ودروع الوجه" },
                    { name: "Massage & Relaxation", handle: "massage-relaxation", nameAr: "المساج والاسترخاء" },
                    { name: "Baby Care", handle: "baby-care", nameAr: "رعاية الأطفال" },
                    { name: "Health & Skin Care", handle: "health-skin-care", nameAr: "العناية بالبشرة" },
                    { name: "Dental Care", handle: "dental-care", nameAr: "العناية بالأسنان" },
                ]
            },
            // Fitness
            {
                name: "Fitness",
                handle: "fitness",
                nameAr: "اللياقة البدنية",
                children: [
                    { name: "Health & Fitness Equipments", handle: "fitness-equipments", nameAr: "معدات اللياقة" },
                    { name: "Smart Body Scales", handle: "smart-body-scales", nameAr: "الميزان الذكي" },
                ]
            },
        ]
    },
    // 3️⃣ ELECTRONICS
    {
        name: "Electronics",
        handle: "electronics",
        nameAr: "الإلكترونيات",
        children: [
            // Watches
            {
                name: "Watches",
                handle: "watches",
                nameAr: "الساعات",
                children: [
                    { name: "Kids' Smart Watches", handle: "kids-smart-watches", nameAr: "ساعات الأطفال الذكية" },
                    { name: "Smart Bands", handle: "smart-bands", nameAr: "السوار الذكي" },
                    { name: "Smart Watches", handle: "smart-watches", nameAr: "الساعات الذكية" },
                ]
            },
            // Watch Accessories
            {
                name: "Watch Accessories",
                handle: "watch-accessories",
                nameAr: "اكسسوارات الساعات",
                children: [
                    { name: "Bands & Straps", handle: "watch-bands-straps", nameAr: "أحزمة الساعات" },
                    { name: "Screen Protectors", handle: "watch-screen-protectors", nameAr: "واقي شاشة الساعة" },
                    { name: "Cases & Covers", handle: "watch-cases-covers", nameAr: "كفرات الساعة" },
                    { name: "Smart Watch Chargers", handle: "smart-watch-chargers", nameAr: "شواحن الساعات الذكية" },
                ]
            },
            // Speakers & Accessories
            {
                name: "Speakers & Accessories",
                handle: "speakers-accessories",
                nameAr: "السماعات والاكسسوارات",
                children: [
                    { name: "Bluetooth Speakers", handle: "bluetooth-speakers", nameAr: "سماعات بلوتوث" },
                    { name: "AUX Cables", handle: "aux-cables", nameAr: "كيبلات AUX" },
                    { name: "Speaker Cases & Covers", handle: "speaker-cases-covers", nameAr: "كفرات السماعات" },
                    { name: "Home Speakers & Soundbars", handle: "home-speakers-soundbars", nameAr: "سماعات المنزل وساوند بار" },
                ]
            },
            // Earphones & Headphones
            {
                name: "Earphones & Headphones",
                handle: "earphones-headphones",
                nameAr: "السماعات",
                children: [
                    { name: "Kids' Headphones", handle: "kids-headphones", nameAr: "سماعات الأطفال" },
                    { name: "On-Ear Headphones", handle: "on-ear-headphones", nameAr: "سماعات أذن" },
                    { name: "Open-Ear Headphones", handle: "open-ear-headphones", nameAr: "سماعات مفتوحة" },
                    { name: "Over-Ear Headphones", handle: "over-ear-headphones", nameAr: "سماعات فوق الأذن" },
                    { name: "Earbuds", handle: "earbuds", nameAr: "سماعات لاسلكية" },
                    { name: "Earbuds Accessories", handle: "earbuds-accessories", nameAr: "اكسسوارات السماعات اللاسلكية" },
                    { name: "Earphones", handle: "earphones", nameAr: "سماعات أذن سلكية" },
                    { name: "Microphones", handle: "microphones", nameAr: "مايكروفونات" },
                ]
            },
            // Cameras
            {
                name: "Cameras",
                handle: "cameras",
                nameAr: "الكاميرات",
                children: [
                    { name: "Digital Cameras", handle: "digital-cameras", nameAr: "كاميرات رقمية" },
                    { name: "DSLR Cameras", handle: "dslr-cameras", nameAr: "كاميرات DSLR" },
                    { name: "Mirrorless Cameras", handle: "mirrorless-cameras", nameAr: "كاميرات ميرورليس" },
                    { name: "Action Cameras", handle: "action-cameras", nameAr: "كاميرات الأكشن" },
                    { name: "Security Cameras", handle: "security-cameras", nameAr: "كاميرات المراقبة" },
                    { name: "Drones", handle: "drones", nameAr: "طائرات درون" },
                    { name: "Binoculars", handle: "binoculars", nameAr: "منظار" },
                    { name: "Tripods", handle: "tripods", nameAr: "حوامل ثلاثية" },
                    { name: "Accessories", handle: "camera-accessories", nameAr: "اكسسوارات الكاميرا" },
                    { name: "Gimbals", handle: "gimbals", nameAr: "جيمبال" },
                    { name: "Instant Photo Printers", handle: "instant-photo-printers", nameAr: "طابعات الصور الفورية" },
                ]
            },
            // Printers & Scanners
            {
                name: "Printers & Scanners",
                handle: "printers-scanners",
                nameAr: "الطابعات والماسحات",
                children: [
                    { name: "Printers", handle: "printers", nameAr: "طابعات" },
                    { name: "Scanners", handle: "scanners", nameAr: "ماسحات ضوئية" },
                    { name: "Printer Cartridges & Inks", handle: "printer-cartridges-inks", nameAr: "حبر الطابعة" },
                ]
            },
            // Televisions
            {
                name: "Televisions",
                handle: "televisions",
                nameAr: "التلفزيونات",
            },
            // Powerology
            {
                name: "Powerology",
                handle: "powerology",
                nameAr: "باورولوجي",
            },
            // Others
            {
                name: "Others",
                handle: "electronics-others",
                nameAr: "أخرى",
            },
            // Glasses & Accessories
            {
                name: "Glasses & Accessories",
                handle: "glasses-accessories",
                nameAr: "النظارات والاكسسوارات",
            },
            // Streaming Devices
            {
                name: "Streaming Devices",
                handle: "streaming-devices",
                nameAr: "أجهزة البث",
            },
            // Projectors
            {
                name: "Projectors",
                handle: "projectors",
                nameAr: "البروجكتور",
            },
        ]
    },
    // 4️⃣ HOME & KITCHEN
    {
        name: "Home & Kitchen",
        handle: "home-kitchen",
        nameAr: "المنزل والمطبخ",
        children: [
            // Home Section
            {
                name: "Home",
                handle: "home",
                nameAr: "المنزل",
                children: [
                    { name: "Electric Mosquito Killers", handle: "electric-mosquito-killers", nameAr: "قاتل البعوض الكهربائي" },
                    { name: "Refrigerators", handle: "refrigerators", nameAr: "الثلاجات" },
                    { name: "Portable Fridges", handle: "portable-fridges", nameAr: "ثلاجات محمولة" },
                    { name: "Mini Fridges", handle: "mini-fridges", nameAr: "ثلاجات صغيرة" },
                    { name: "Ice Makers", handle: "ice-makers", nameAr: "صانعة الثلج" },
                ]
            },
            // Cleaning
            {
                name: "Cleaning",
                handle: "cleaning",
                nameAr: "التنظيف",
                children: [
                    { name: "Washers & Dryers", handle: "washers-dryers", nameAr: "الغسالات والمجففات" },
                    { name: "Vacuum and Cleaners", handle: "vacuum-cleaners", nameAr: "المكانس الكهربائية" },
                    { name: "Jet Fan & Blower", handle: "jet-fan-blower", nameAr: "منفاخ الهواء" },
                    { name: "Irons & Steamers", handle: "irons-steamers", nameAr: "المكواة والبخار" },
                ]
            },
            // Bakhour (Aroma)
            {
                name: "Bakhour",
                handle: "bakhour",
                nameAr: "البخور",
                children: [
                    { name: "Aroma Diffusers", handle: "aroma-diffusers", nameAr: "موزع العطر" },
                ]
            },
            // Air Conditioning
            {
                name: "Air Conditioning",
                handle: "air-conditioning",
                nameAr: "تكييف الهواء",
                children: [
                    { name: "Portable Fan", handle: "portable-fan", nameAr: "مراوح محمولة" },
                    { name: "Air Coolers", handle: "air-coolers", nameAr: "مبردات الهواء" },
                    { name: "Air Purifiers", handle: "air-purifiers", nameAr: "منقي الهواء" },
                ]
            },
            // Smart Home
            {
                name: "Smart Home",
                handle: "smart-home",
                nameAr: "المنزل الذكي",
            },
            // Pet Supplies
            {
                name: "Pet Supplies",
                handle: "pet-supplies",
                nameAr: "مستلزمات الحيوانات",
            },
            // Lightings
            {
                name: "Lightings",
                handle: "lightings",
                nameAr: "الإضاءة",
            },
            // Tools
            {
                name: "Tools",
                handle: "tools",
                nameAr: "الأدوات",
            },
            // Kitchen Section
            {
                name: "Kitchen",
                handle: "kitchen",
                nameAr: "المطبخ",
                children: [
                    { name: "Kitchen Appliances", handle: "kitchen-appliances", nameAr: "أجهزة المطبخ" },
                    { name: "Grill & Toaster", handle: "grill-toaster", nameAr: "الشواية والتوستر" },
                    { name: "Water Dispenser", handle: "water-dispenser", nameAr: "موزع المياه" },
                    { name: "Blenders, Juicers & Mixers", handle: "blenders-juicers-mixers", nameAr: "الخلاطات والعصارات" },
                    { name: "Food Weighing Scales", handle: "food-weighing-scales", nameAr: "ميزان الطعام" },
                    { name: "Choppers", handle: "choppers", nameAr: "المفرمة" },
                    { name: "Electric Pressure Cooker", handle: "electric-pressure-cooker", nameAr: "قدر الضغط الكهربائي" },
                    { name: "Thermal Mugs & Bottles", handle: "thermal-mugs-bottles", nameAr: "أكواب وزجاجات حرارية" },
                    { name: "Kettle", handle: "kettle", nameAr: "الغلاية" },
                    { name: "Air Fryers", handle: "air-fryers", nameAr: "المقلاة الهوائية" },
                    { name: "Vacuum Sealers", handle: "vacuum-sealers", nameAr: "جهاز تفريغ الهواء" },
                ]
            },
            // Coffee, Tea & Espresso
            {
                name: "Coffee, Tea & Espresso",
                handle: "coffee-tea-espresso",
                nameAr: "القهوة والشاي",
                children: [
                    { name: "Espresso Machines", handle: "espresso-machines", nameAr: "ماكينات الإسبريسو" },
                    { name: "Coffee Brewers", handle: "coffee-brewers", nameAr: "صانعة القهوة" },
                    { name: "Portable Coffee Maker", handle: "portable-coffee-maker", nameAr: "صانعة قهوة محمولة" },
                    { name: "Grinder", handle: "grinder", nameAr: "مطحنة القهوة" },
                    { name: "Milk Frother", handle: "milk-frother", nameAr: "خفاقة الحليب" },
                    { name: "Equipment", handle: "coffee-equipment", nameAr: "معدات القهوة" },
                ]
            },
            // Office
            {
                name: "Office",
                handle: "office",
                nameAr: "المكتب",
                children: [
                    { name: "Presenter", handle: "presenter", nameAr: "جهاز العرض" },
                    { name: "Smart Sockets", handle: "smart-sockets", nameAr: "مقابس ذكية" },
                    { name: "Extension Power Sockets", handle: "extension-power-sockets", nameAr: "وصلات كهربائية" },
                    { name: "Batteries", handle: "batteries", nameAr: "البطاريات" },
                    { name: "Stationery", handle: "stationery", nameAr: "الأدوات المكتبية" },
                ]
            },
        ]
    },
    // 5️⃣ FASHION
    {
        name: "Fashion",
        handle: "fashion",
        nameAr: "الأزياء",
        children: [
            // Luggages & Accessories
            {
                name: "Luggages & Accessories",
                handle: "luggages-accessories",
                nameAr: "الحقائب والاكسسوارات",
                children: [
                    { name: "Luggage", handle: "luggage", nameAr: "حقائب السفر" },
                    { name: "Travel Accessories", handle: "travel-accessories", nameAr: "اكسسوارات السفر" },
                ]
            },
            // Bags
            {
                name: "Bags",
                handle: "bags",
                nameAr: "الحقائب",
                children: [
                    { name: "Backpacks", handle: "backpacks", nameAr: "حقائب الظهر" },
                    { name: "Bags & Wallets", handle: "bags-wallets", nameAr: "حقائب ومحافظ" },
                ]
            },
        ]
    },
    // 6️⃣ OFFROAD
    {
        name: "Offroad",
        handle: "offroad",
        nameAr: "الرحلات البرية",
        children: [
            // Camping Essentials
            {
                name: "Camping Essentials",
                handle: "camping-essentials",
                nameAr: "أساسيات التخييم",
                children: [
                    { name: "Chair & Table", handle: "chair-table", nameAr: "كراسي وطاولات" },
                    { name: "Bidet", handle: "bidet", nameAr: "بيديه" },
                    { name: "Other Camping Accessories", handle: "other-camping-accessories", nameAr: "اكسسوارات التخييم الأخرى" },
                ]
            },
            // Sleeping Gear & Shelter
            {
                name: "Sleeping Gear & Shelter",
                handle: "sleeping-gear-shelter",
                nameAr: "معدات النوم والمأوى",
                children: [
                    { name: "Mattress", handle: "mattress", nameAr: "فراش" },
                    { name: "Tent", handle: "tent", nameAr: "خيمة" },
                ]
            },
            // Communication & Power Solutions
            {
                name: "Communication & Power Solutions",
                handle: "communication-power-solutions",
                nameAr: "الاتصالات والطاقة",
                children: [
                    { name: "Radio Communication Devices", handle: "radio-communication-devices", nameAr: "أجهزة اللاسلكي" },
                    { name: "Power Generators", handle: "power-generators", nameAr: "مولدات الطاقة" },
                ]
            },
            // Camp Cooking & Lighting
            {
                name: "Camp Cooking & Lighting",
                handle: "camp-cooking-lighting",
                nameAr: "الطبخ والإضاءة",
                children: [
                    { name: "Lights", handle: "camp-lights", nameAr: "إضاءة التخييم" },
                    { name: "Stove & Grill", handle: "stove-grill", nameAr: "الموقد والشواية" },
                ]
            },
        ]
    },
    // 7️⃣ COMPUTERS & GAMING
    {
        name: "Computers & Gaming",
        handle: "computers-gaming",
        nameAr: "الكمبيوتر والألعاب",
        children: [
            // Laptops
            {
                name: "Laptops",
                handle: "laptops",
                nameAr: "اللابتوب",
                children: [
                    { name: "MSI", handle: "msi-laptops", nameAr: "إم إس آي" },
                    { name: "Asus", handle: "asus-laptops", nameAr: "أسوس" },
                    { name: "Microsoft", handle: "microsoft-laptops", nameAr: "مايكروسوفت" },
                    { name: "Dell", handle: "dell-laptops", nameAr: "ديل" },
                    { name: "HP", handle: "hp-laptops", nameAr: "إتش بي" },
                    { name: "Lenovo", handle: "lenovo-laptops", nameAr: "لينوفو" },
                    { name: "Macbook", handle: "macbook", nameAr: "ماك بوك" },
                ]
            },
            // Laptops Accessories
            {
                name: "Laptops Accessories",
                handle: "laptops-accessories",
                nameAr: "اكسسوارات اللابتوب",
                children: [
                    { name: "Cooling Pad", handle: "cooling-pad", nameAr: "قاعدة تبريد" },
                    { name: "Laptop Cases & Covers", handle: "laptop-cases-covers", nameAr: "كفرات اللابتوب" },
                    { name: "Laptop Bags & Sleeves", handle: "laptop-bags-sleeves", nameAr: "حقائب اللابتوب" },
                    { name: "Laptop Stands", handle: "laptop-stands", nameAr: "حامل اللابتوب" },
                    { name: "Laptop Screen Protectors", handle: "laptop-screen-protectors", nameAr: "واقي شاشة اللابتوب" },
                ]
            },
            // Computer Accessories
            {
                name: "Computer Accessories",
                handle: "computer-accessories",
                nameAr: "اكسسوارات الكمبيوتر",
                children: [
                    { name: "Monitors", handle: "monitors", nameAr: "الشاشات" },
                    { name: "Cleaning", handle: "computer-cleaning", nameAr: "التنظيف" },
                ]
            },
            // Mouse & Keyboards
            {
                name: "Mouse & Keyboards",
                handle: "mouse-keyboards",
                nameAr: "الماوس ولوحة المفاتيح",
                children: [
                    { name: "Mouse & Keyboard Combos", handle: "mouse-keyboard-combos", nameAr: "كومبو ماوس ولوحة مفاتيح" },
                    { name: "Mouse", handle: "mouse", nameAr: "ماوس" },
                    { name: "Keyboards", handle: "keyboards", nameAr: "لوحة المفاتيح" },
                    { name: "Mouse Pad", handle: "mouse-pad", nameAr: "لوحة الماوس" },
                ]
            },
            // USB & Connectivity
            {
                name: "USB Hubs",
                handle: "usb-hubs",
                nameAr: "موزع USB",
            },
            {
                name: "HDMI Cables",
                handle: "hdmi-cables",
                nameAr: "كيبلات HDMI",
            },
            {
                name: "Memory Card Readers",
                handle: "memory-card-readers",
                nameAr: "قارئ بطاقة الذاكرة",
            },
            {
                name: "Webcams",
                handle: "webcams",
                nameAr: "كاميرا الويب",
            },
            // Storage
            {
                name: "Storage",
                handle: "storage",
                nameAr: "التخزين",
                children: [
                    { name: "External SSD", handle: "external-ssd", nameAr: "SSD خارجي" },
                    { name: "USB Flash Drives", handle: "usb-flash-drives", nameAr: "فلاش ميموري" },
                ]
            },
            // Networking
            {
                name: "Networking",
                handle: "networking",
                nameAr: "الشبكات",
                children: [
                    { name: "Wireless Routers", handle: "wireless-routers", nameAr: "راوتر لاسلكي" },
                    { name: "Wireless Adapters", handle: "wireless-adapters", nameAr: "محول لاسلكي" },
                    { name: "Routers", handle: "routers", nameAr: "راوتر" },
                ]
            },
            // Gaming Devices
            {
                name: "Gaming Devices",
                handle: "gaming-devices",
                nameAr: "أجهزة الألعاب",
                children: [
                    { name: "Laptops & Desktops", handle: "gaming-laptops-desktops", nameAr: "لابتوبات وديسكتوب الألعاب" },
                ]
            },
            // Consoles
            {
                name: "Consoles",
                handle: "consoles",
                nameAr: "أجهزة الألعاب",
                children: [
                    { name: "Gaming Consoles", handle: "gaming-consoles", nameAr: "كونسول الألعاب" },
                    { name: "Xbox", handle: "xbox", nameAr: "إكس بوكس" },
                    { name: "PlayStation", handle: "playstation", nameAr: "بلايستيشن" },
                ]
            },
            // Gaming Accessories
            {
                name: "Gaming Accessories",
                handle: "gaming-accessories",
                nameAr: "اكسسوارات الألعاب",
                children: [
                    { name: "Joysticks", handle: "joysticks", nameAr: "عصا التحكم" },
                    { name: "Gaming Keyboard & Mouse Combos", handle: "gaming-keyboard-mouse-combos", nameAr: "كومبو لوحة مفاتيح وماوس الألعاب" },
                    { name: "Gaming Speaker", handle: "gaming-speaker", nameAr: "سماعات الألعاب" },
                    { name: "Gaming Keyboards", handle: "gaming-keyboards", nameAr: "لوحة مفاتيح الألعاب" },
                    { name: "Gaming Headphones", handle: "gaming-headphones", nameAr: "سماعات رأس الألعاب" },
                    { name: "Gaming Mouse", handle: "gaming-mouse", nameAr: "ماوس الألعاب" },
                    { name: "Gaming Chairs", handle: "gaming-chairs", nameAr: "كراسي الألعاب" },
                ]
            },
        ]
    },
    // 8️⃣ TOYS, GAMES & KIDS
    {
        name: "Toys, Games & Kids",
        handle: "toys-games-kids",
        nameAr: "الألعاب والأطفال",
        children: [
            // Toys
            {
                name: "Toys",
                handle: "toys",
                nameAr: "الألعاب",
                children: [
                    { name: "Water Pools", handle: "water-pools", nameAr: "أحواض السباحة" },
                    { name: "Walkie Talkies", handle: "walkie-talkies", nameAr: "أجهزة اللاسلكي للأطفال" },
                ]
            },
            // Cycling
            {
                name: "Cycling",
                handle: "cycling",
                nameAr: "الدراجات",
                children: [
                    { name: "Electric Bicycle", handle: "electric-bicycle", nameAr: "دراجة كهربائية" },
                    { name: "Electric Scooters", handle: "electric-scooters", nameAr: "سكوتر كهربائي" },
                    { name: "Electric Scooter Accessories", handle: "electric-scooter-accessories", nameAr: "اكسسوارات السكوتر الكهربائي" },
                ]
            },
        ]
    },
    // 9️⃣ AUTOMOTIVES
    {
        name: "Automotives",
        handle: "automotives",
        nameAr: "السيارات",
        children: [
            // Car Electronics
            {
                name: "Car Electronics",
                handle: "car-electronics",
                nameAr: "إلكترونيات السيارة",
                children: [
                    { name: "Car Chargers & Transmitters", handle: "car-chargers-transmitters", nameAr: "شواحن ومرسلات السيارة" },
                    { name: "Camera & Sensor", handle: "car-camera-sensor", nameAr: "كاميرا ومستشعر السيارة" },
                    { name: "Jump Starters", handle: "jump-starters", nameAr: "بادئ تشغيل السيارة" },
                    { name: "Tire Gauge", handle: "tire-gauge", nameAr: "مقياس ضغط الإطارات" },
                    { name: "Car Multimedia", handle: "car-multimedia", nameAr: "شاشات السيارة" },
                    { name: "Mobile Mounts & Chargers", handle: "mobile-mounts-chargers", nameAr: "حوامل وشواحن الهاتف" },
                ]
            },
            // Car Interior
            {
                name: "Car Interior",
                handle: "car-interior",
                nameAr: "داخلية السيارة",
                children: [
                    { name: "Interior Care", handle: "interior-care", nameAr: "العناية الداخلية" },
                    { name: "Car Organizers", handle: "car-organizers", nameAr: "منظمات السيارة" },
                ]
            },
            // Car Exterior
            {
                name: "Car Exterior",
                handle: "car-exterior",
                nameAr: "خارجية السيارة",
                children: [
                    { name: "Compressor & Inflators", handle: "compressor-inflators", nameAr: "الكمبريسور والنافخات" },
                    { name: "Car Wash", handle: "car-wash", nameAr: "غسيل السيارة" },
                    { name: "Other Exterior", handle: "other-exterior", nameAr: "اكسسوارات خارجية أخرى" },
                ]
            },
        ]
    },
    // 🔥 HOT DEALS (Special Category)
    {
        name: "Hot Deals",
        handle: "hot-deals",
        nameAr: "عروض ساخنة",
    },
];
async function setupCompleteCategories({ container }) {
    const logger = container.resolve("logger");
    const query = container.resolve("query");
    logger.info("🔧 Setting up complete category hierarchy based on client requirements...\n");
    // Helper to find category by handle
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
    // Helper function to create or update category
    async function createOrUpdateCategory(data, parentCategoryId = null, rank = 0) {
        try {
            const existing = await findCategoryByHandle(data.handle);
            let categoryId;
            if (existing) {
                // Update existing category
                try {
                    await (0, core_flows_1.updateProductCategoriesWorkflow)(container).run({
                        input: {
                            selector: { id: existing.id },
                            update: {
                                name: data.name,
                                parent_category_id: parentCategoryId,
                                rank: rank,
                                is_active: true,
                                is_internal: false,
                                metadata: { name_ar: data.nameAr || null },
                            },
                        },
                    });
                    logger.info(`  ✓ Updated: ${data.name}`);
                }
                catch (e) {
                    // Ignore update errors
                }
                categoryId = existing.id;
            }
            else {
                // Create new category
                const { result } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
                    input: {
                        product_categories: [{
                                name: data.name,
                                handle: data.handle,
                                parent_category_id: parentCategoryId,
                                rank: rank,
                                is_active: true,
                                is_internal: false,
                                metadata: { name_ar: data.nameAr || null },
                            }]
                    }
                });
                categoryId = result[0].id;
                logger.info(`  ✓ Created: ${data.name}`);
            }
            // Recursively create children
            if (data.children && data.children.length > 0) {
                let childRank = 0;
                for (const child of data.children) {
                    await createOrUpdateCategory(child, categoryId, childRank);
                    childRank++;
                }
            }
            return categoryId;
        }
        catch (error) {
            logger.error(`  ✗ Error with ${data.name}: ${error.message}`);
            return "";
        }
    }
    try {
        // Process all categories
        logger.info("📁 Creating category hierarchy...\n");
        let mainRank = 0;
        for (const category of CATEGORY_TREE) {
            logger.info(`\n📦 Processing: ${category.name}`);
            await createOrUpdateCategory(category, null, mainRank);
            mainRank++;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtY29tcGxldGUtY2F0ZWdvcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3NldHVwLWNvbXBsZXRlLWNhdGVnb3JpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOztBQXlzQkgsMENBOEdDO0FBcHpCRCw0REFBZ0o7QUFVaEosZ0ZBQWdGO0FBQ2hGLDBEQUEwRDtBQUMxRCxnRkFBZ0Y7QUFDaEYsTUFBTSxhQUFhLEdBQW1CO0lBQ3BDLHNCQUFzQjtJQUN0QjtRQUNFLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsTUFBTSxFQUFFLGVBQWU7UUFDdkIsTUFBTSxFQUFFLGVBQWU7UUFDdkIsUUFBUSxFQUFFO1lBQ1Isa0JBQWtCO1lBQ2xCO2dCQUNFLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsa0JBQWtCO2dCQUMxQixRQUFRLEVBQUU7b0JBQ1IsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtvQkFDckQsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO29CQUNqRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFO29CQUM1RCxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO29CQUMxRCxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFO29CQUN2RixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFF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