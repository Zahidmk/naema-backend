"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedHomepageContent;
const utils_1 = require("@medusajs/framework/utils");
const brands_1 = require("../modules/brands");
const media_1 = require("../modules/media");
// Sample product images from Unsplash (free to use)
const PRODUCT_IMAGES = {
    phones: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop",
    ],
    laptops: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    ],
    headphones: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
    ],
    watches: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
    ],
    powerbanks: [
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=400&fit=crop",
    ],
    cameras: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400&h=400&fit=crop",
    ],
    gaming: [
        "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400&h=400&fit=crop",
    ],
    accessories: [
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400&h=400&fit=crop",
    ],
};
// Brand logos (using local images from public/brands folder)
const BRAND_DATA = [
    { name: "Apple", slug: "apple", logo_url: "/brands/apple.svg" },
    { name: "Samsung", slug: "samsung", logo_url: "/brands/belkin.svg" },
    { name: "Sony", slug: "sony", logo_url: "/brands/guess.svg" },
    { name: "Xiaomi", slug: "xiaomi", logo_url: "/brands/lacoste.svg" },
    { name: "JBL", slug: "jbl", logo_url: "/brands/lepresso.svg" },
    { name: "Bose", slug: "bose", logo_url: "/brands/poroda.svg" },
    { name: "Anker", slug: "anker", logo_url: "/brands/us-polo.svg" },
    { name: "Logitech", slug: "logitech", logo_url: "/brands/apple-white.avif" },
];
// Hero banner images
const BANNER_DATA = [
    {
        title: "New iPhone 17 Pro",
        subtitle: "Experience the future of mobile technology",
        image_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&h=500&fit=crop",
        link: "/categories/smart-phones",
    },
    {
        title: "Gaming Setup Sale",
        subtitle: "Up to 50% off on gaming accessories",
        image_url: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=1200&h=500&fit=crop",
        link: "/categories/gaming",
    },
    {
        title: "Premium Headphones",
        subtitle: "Immerse yourself in sound",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=500&fit=crop",
        link: "/categories/headphones",
    },
    {
        title: "Smart Watches Collection",
        subtitle: "Stay connected, stay stylish",
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=500&fit=crop",
        link: "/categories/smart-watches",
    },
];
// Product definitions for different collections
const APPLE_PRODUCTS = [
    { title: "iPhone 17 Pro Max 256GB", handle: "iphone-17-pro-max", price: 1199, category: "phones" },
    { title: "iPhone 17 Pro 128GB", handle: "iphone-17-pro", price: 999, category: "phones" },
    { title: "MacBook Pro 14-inch M4", handle: "macbook-pro-14", price: 1999, category: "laptops" },
    { title: "MacBook Air 13-inch M3", handle: "macbook-air-13", price: 1099, category: "laptops" },
    { title: "AirPods Pro 3rd Gen", handle: "airpods-pro-3", price: 249, category: "headphones" },
    { title: "Apple Watch Ultra 3", handle: "apple-watch-ultra-3", price: 799, category: "watches" },
    { title: "iPad Pro 12.9-inch M4", handle: "ipad-pro-12", price: 1099, category: "laptops" },
    { title: "AirPods Max", handle: "airpods-max", price: 549, category: "headphones" },
];
const HOT_DEALS_PRODUCTS = [
    { title: "Samsung Galaxy S24 Ultra", handle: "samsung-s24-ultra", price: 899, originalPrice: 1199, category: "phones" },
    { title: "Sony WH-1000XM5 Headphones", handle: "sony-wh1000xm5", price: 279, originalPrice: 399, category: "headphones" },
    { title: "JBL Flip 6 Speaker", handle: "jbl-flip-6", price: 99, originalPrice: 149, category: "accessories" },
    { title: "Logitech G Pro X Gaming Headset", handle: "logitech-gpro-x", price: 149, originalPrice: 199, category: "gaming" },
    { title: "Anker PowerCore 26800mAh", handle: "anker-powercore-26800", price: 49, originalPrice: 79, category: "powerbanks" },
    { title: "Samsung Galaxy Watch 6", handle: "samsung-watch-6", price: 249, originalPrice: 349, category: "watches" },
];
const POWERBANK_PRODUCTS = [
    { title: "Anker PowerCore 20000mAh", handle: "anker-powercore-20000", price: 39, category: "powerbanks" },
    { title: "Xiaomi Power Bank 3 Pro", handle: "xiaomi-pb3-pro", price: 49, category: "powerbanks" },
    { title: "Samsung 25W Wireless Power Bank", handle: "samsung-wireless-pb", price: 59, category: "powerbanks" },
    { title: "Baseus 65W Power Bank 30000mAh", handle: "baseus-65w-30000", price: 79, category: "powerbanks" },
    { title: "Anker 737 PowerCore 24K", handle: "anker-737-24k", price: 99, category: "powerbanks" },
    { title: "UGREEN 145W Power Bank", handle: "ugreen-145w", price: 89, category: "powerbanks" },
];
// Video content for media gallery
const VIDEO_DATA = [
    {
        title: "iPhone 17 Pro Unboxing",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=400&fit=crop",
        type: "video",
    },
    {
        title: "Best Gaming Setup 2026",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=300&h=400&fit=crop",
        type: "video",
    },
    {
        title: "Headphones Comparison",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=400&fit=crop",
        type: "video",
    },
    {
        title: "Smart Watch Review",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=400&fit=crop",
        type: "video",
    },
];
async function seedHomepageContent({ container }) {
    const productService = container.resolve(utils_1.Modules.PRODUCT);
    let brandService = null;
    let mediaService = null;
    try {
        brandService = container.resolve(brands_1.BRAND_MODULE);
    }
    catch (e) {
        console.log("Brand module not available");
    }
    try {
        mediaService = container.resolve(media_1.MEDIA_MODULE);
    }
    catch (e) {
        console.log("Media module not available");
    }
    console.log("🚀 Starting Homepage Content Seeding...");
    console.log("=".repeat(50));
    // 1. Create/Update Brands
    if (brandService) {
        console.log("\n📦 Creating Brands...");
        for (const brand of BRAND_DATA) {
            try {
                const existing = await brandService.listBrands({ slug: brand.slug });
                if (existing && existing.length > 0) {
                    // Update existing brand with logo
                    await brandService.updateBrands(existing[0].id, {
                        logo_url: brand.logo_url,
                        is_active: true,
                    });
                    console.log(`  ✓ Updated brand: ${brand.name}`);
                }
                else {
                    // Create new brand
                    await brandService.createBrands([{
                            name: brand.name,
                            slug: brand.slug,
                            logo_url: brand.logo_url,
                            is_active: true,
                        }]);
                    console.log(`  ✓ Created brand: ${brand.name}`);
                }
            }
            catch (e) {
                console.log(`  ⚠ Brand ${brand.name}: ${e.message}`);
            }
        }
    }
    // 2. Create Collections if they don't exist
    console.log("\n📁 Ensuring Collections exist...");
    const collections = [
        { title: "Apple", handle: "apple" },
        { title: "Hot Deals", handle: "hot-deals" },
        { title: "Best in Power Banks", handle: "best-in-power-banks" },
        { title: "New Arrivals", handle: "new-arrival" },
    ];
    const collectionMap = {};
    for (const coll of collections) {
        try {
            const existing = await productService.listProductCollections({ handle: coll.handle });
            if (existing.length > 0) {
                collectionMap[coll.handle] = existing[0].id;
                console.log(`  ✓ Collection exists: ${coll.title}`);
            }
            else {
                const created = await productService.createProductCollections({
                    title: coll.title,
                    handle: coll.handle,
                });
                collectionMap[coll.handle] = created.id;
                console.log(`  ✓ Created collection: ${coll.title}`);
            }
        }
        catch (e) {
            console.log(`  ⚠ Collection ${coll.title}: ${e.message}`);
        }
    }
    // 3. Create Products for Apple Collection
    console.log("\n🍎 Creating Apple Products...");
    for (const product of APPLE_PRODUCTS) {
        try {
            const existing = await productService.listProducts({ handle: product.handle });
            if (existing.length > 0) {
                // Update thumbnail
                const images = PRODUCT_IMAGES[product.category] || PRODUCT_IMAGES.accessories;
                await productService.updateProducts(existing[0].id, {
                    thumbnail: images[Math.floor(Math.random() * images.length)],
                });
                // Add to collection
                if (collectionMap["apple"]) {
                    try {
                        await productService.updateProductCollections(collectionMap["apple"], {
                            product_ids: [existing[0].id],
                        });
                    }
                    catch (e) {
                        // Already in collection
                    }
                }
                console.log(`  ✓ Updated: ${product.title}`);
            }
            else {
                const images = PRODUCT_IMAGES[product.category] || PRODUCT_IMAGES.accessories;
                const created = await productService.createProducts({
                    title: product.title,
                    handle: product.handle,
                    thumbnail: images[Math.floor(Math.random() * images.length)],
                    status: "published",
                    collection_id: collectionMap["apple"],
                });
                console.log(`  ✓ Created: ${product.title}`);
            }
        }
        catch (e) {
            console.log(`  ⚠ Product ${product.title}: ${e.message}`);
        }
    }
    // 4. Create Hot Deals Products
    console.log("\n🔥 Creating Hot Deals Products...");
    for (const product of HOT_DEALS_PRODUCTS) {
        try {
            const existing = await productService.listProducts({ handle: product.handle });
            if (existing.length > 0) {
                const images = PRODUCT_IMAGES[product.category] || PRODUCT_IMAGES.accessories;
                await productService.updateProducts(existing[0].id, {
                    thumbnail: images[Math.floor(Math.random() * images.length)],
                });
                console.log(`  ✓ Updated: ${product.title}`);
            }
            else {
                const images = PRODUCT_IMAGES[product.category] || PRODUCT_IMAGES.accessories;
                await productService.createProducts({
                    title: product.title,
                    handle: product.handle,
                    thumbnail: images[Math.floor(Math.random() * images.length)],
                    status: "published",
                    collection_id: collectionMap["hot-deals"],
                });
                console.log(`  ✓ Created: ${product.title}`);
            }
        }
        catch (e) {
            console.log(`  ⚠ Product ${product.title}: ${e.message}`);
        }
    }
    // 5. Create Power Bank Products
    console.log("\n🔋 Creating Power Bank Products...");
    for (const product of POWERBANK_PRODUCTS) {
        try {
            const existing = await productService.listProducts({ handle: product.handle });
            if (existing.length > 0) {
                await productService.updateProducts(existing[0].id, {
                    thumbnail: PRODUCT_IMAGES.powerbanks[Math.floor(Math.random() * PRODUCT_IMAGES.powerbanks.length)],
                });
                console.log(`  ✓ Updated: ${product.title}`);
            }
            else {
                await productService.createProducts({
                    title: product.title,
                    handle: product.handle,
                    thumbnail: PRODUCT_IMAGES.powerbanks[Math.floor(Math.random() * PRODUCT_IMAGES.powerbanks.length)],
                    status: "published",
                    collection_id: collectionMap["best-in-power-banks"],
                });
                console.log(`  ✓ Created: ${product.title}`);
            }
        }
        catch (e) {
            console.log(`  ⚠ Product ${product.title}: ${e.message}`);
        }
    }
    // 6. Create Media/Videos
    if (mediaService) {
        console.log("\n🎬 Creating Media/Videos...");
        for (const video of VIDEO_DATA) {
            try {
                const existing = await mediaService.listMedia({ title: video.title });
                if (!existing || existing.length === 0) {
                    await mediaService.createMedia([{
                            title: video.title,
                            url: video.url,
                            thumbnail_url: video.thumbnail_url,
                            type: "video",
                            is_active: true,
                        }]);
                    console.log(`  ✓ Created video: ${video.title}`);
                }
                else {
                    console.log(`  ✓ Video exists: ${video.title}`);
                }
            }
            catch (e) {
                console.log(`  ⚠ Video ${video.title}: ${e.message}`);
            }
        }
    }
    // 7. Create Hero Banners
    console.log("\n🖼️ Creating Hero Banners...");
    try {
        // Check if there's a homepage/banners module
        const homepageModule = container.resolve("homepage");
        if (homepageModule) {
            for (const banner of BANNER_DATA) {
                try {
                    await homepageModule.createBanner({
                        title: banner.title,
                        subtitle: banner.subtitle,
                        image_url: banner.image_url,
                        link: banner.link,
                        is_active: true,
                        position: "hero",
                    });
                    console.log(`  ✓ Created banner: ${banner.title}`);
                }
                catch (e) {
                    console.log(`  ⚠ Banner ${banner.title}: ${e.message}`);
                }
            }
        }
    }
    catch (e) {
        console.log("  ℹ Homepage module not available, banners will use static data");
    }
    console.log("\n" + "=".repeat(50));
    console.log("✅ Homepage Content Seeding Complete!");
    console.log("\n📋 Summary:");
    console.log(`  • Brands: ${BRAND_DATA.length} processed`);
    console.log(`  • Apple Products: ${APPLE_PRODUCTS.length} processed`);
    console.log(`  • Hot Deals: ${HOT_DEALS_PRODUCTS.length} processed`);
    console.log(`  • Power Banks: ${POWERBANK_PRODUCTS.length} processed`);
    console.log(`  • Videos: ${VIDEO_DATA.length} processed`);
    console.log(`  • Banners: ${BANNER_DATA.length} processed`);
    console.log("\n🌐 Refresh your frontend at localhost:3000 to see the changes!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1ob21lcGFnZS1jb250ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvc2VlZC1ob21lcGFnZS1jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBbUpBLHNDQXNPQztBQXhYRCxxREFBbUQ7QUFDbkQsOENBQWdEO0FBQ2hELDRDQUErQztBQUUvQyxvREFBb0Q7QUFDcEQsTUFBTSxjQUFjLEdBQUc7SUFDckIsTUFBTSxFQUFFO1FBQ04sbUZBQW1GO1FBQ25GLG1GQUFtRjtRQUNuRixtRkFBbUY7S0FDcEY7SUFDRCxPQUFPLEVBQUU7UUFDUCxtRkFBbUY7UUFDbkYsbUZBQW1GO1FBQ25GLG1GQUFtRjtLQUNwRjtJQUNELFVBQVUsRUFBRTtRQUNWLG1GQUFtRjtRQUNuRixtRkFBbUY7UUFDbkYsbUZBQW1GO0tBQ3BGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsbUZBQW1GO1FBQ25GLGdGQUFnRjtRQUNoRixtRkFBbUY7S0FDcEY7SUFDRCxVQUFVLEVBQUU7UUFDVixtRkFBbUY7UUFDbkYsbUZBQW1GO1FBQ25GLG1GQUFtRjtLQUNwRjtJQUNELE9BQU8sRUFBRTtRQUNQLG1GQUFtRjtRQUNuRixtRkFBbUY7UUFDbkYsbUZBQW1GO0tBQ3BGO0lBQ0QsTUFBTSxFQUFFO1FBQ04sbUZBQW1GO1FBQ25GLG1GQUFtRjtRQUNuRixtRkFBbUY7S0FDcEY7SUFDRCxXQUFXLEVBQUU7UUFDWCxtRkFBbUY7UUFDbkYsbUZBQW1GO1FBQ25GLG1GQUFtRjtLQUNwRjtDQUNGLENBQUE7QUFFRCw2REFBNkQ7QUFDN0QsTUFBTSxVQUFVLEdBQUc7SUFDakIsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFO0lBQy9ELEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRTtJ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