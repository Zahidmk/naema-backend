"use strict";
/**
 * Odoo Sync Service — COMPLETE EDITION
 *
 * Handles full synchronization of ALL product data between Odoo ERP and MedusaJS.
 * Odoo is the single source of truth for:
 *   - Products (name, SKU, barcode, descriptions, prices, weight, volume)
 *   - Brands (brand_id from product.brand model)
 *   - Categories (categ_id + public_categ_ids)
 *   - Variants & Attributes (attribute_line_ids → Color, Size, etc.)
 *   - Images (image_1920 + product_template_image_ids gallery)
 *   - Inventory (qty_available, virtual_available, incoming, outgoing)
 *   - SEO (website_meta_title/description/keywords, seo_name)
 *   - Cross-sell (optional_product_ids, accessory_product_ids, alternative_product_ids)
 *   - Ratings (rating_avg, rating_count)
 *   - Vendors (seller_ids)
 *   - Ribbons, tags, publish status
 *
 * @version 2.0 — March 2026
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODOO_VARIANT_FIELDS = exports.ODOO_PRODUCT_TEMPLATE_FIELDS = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
// ─────────────────────────────────────────────────
//  COMPLETE FIELD LIST TO FETCH FROM ODOO
// ─────────────────────────────────────────────────
/**
 * All product.template fields we request from Odoo.
 * We fetch from product.template (not product.product) to get template-level data,
 * then fetch variants separately.
 */
exports.ODOO_PRODUCT_TEMPLATE_FIELDS = [
    // Core
    "id", "name", "default_code", "barcode", "type", "active",
    "sequence", "is_favorite", "color",
    // Prices
    "list_price", "standard_price", "compare_list_price", "retail_price",
    "currency_id",
    // Descriptions
    "description", "description_sale", "description_ecommerce",
    // Brand & Category
    "brand_id", "categ_id", "public_categ_ids",
    "x_studio_brand_1", "x_studio_sub_category",
    // Inventory & Logistics
    "qty_available", "virtual_available", "incoming_qty", "outgoing_qty",
    "is_storable", "weight", "volume", "weight_uom_name", "volume_uom_name",
    "hs_code", "country_of_origin", "sale_delay",
    "allow_out_of_stock_order", "out_of_stock_message",
    "show_availability", "available_threshold",
    "uom_id", "uom_name",
    // Images
    "image_1920", "product_template_image_ids", "can_image_1024_be_zoomed",
    // Variants & Attributes
    "attribute_line_ids", "product_variant_ids", "product_variant_count",
    "has_configurable_attributes",
    // SEO & Website
    "seo_name", "website_meta_title", "website_meta_description",
    "website_meta_keywords", "website_meta_og_img",
    "is_published", "website_url", "website_sequence",
    "website_ribbon_id",
    "product_tag_ids",
    // Sales & Cross-sell
    "optional_product_ids", "accessory_product_ids", "alternative_product_ids",
    "sales_count", "combo_ids", "sale_ok", "purchase_ok",
    // Ratings
    "rating_avg", "rating_count", "rating_percentage_satisfaction",
    "rating_last_feedback", "rating_last_value",
    // Vendors
    "seller_ids",
    // Timestamps
    "create_date", "write_date",
];
/** Fields for product.product (variant-level) */
exports.ODOO_VARIANT_FIELDS = [
    "id", "display_name", "default_code", "barcode",
    "list_price", "standard_price",
    "qty_available", "virtual_available",
    "weight", "volume",
    "image_1920",
    "product_tmpl_id",
    "product_template_attribute_value_ids",
    "active",
];
// ─────────────────────────────────────────────────
//  ODOO SYNC SERVICE
// ─────────────────────────────────────────────────
/**
 * Odoo Sync Service — connects to Odoo via JSON-RPC and fetches
 * all product data for synchronization with MedusaJS.
 */
class OdooSyncService {
    constructor() {
        this.client = null;
        this.uid = null;
        this.requestId = 0;
        // Use hardcoded config since env vars aren't loading in MedusaJS exec context
        this.config = {
            url: "https://oskarllc-new-27289548.dev.odoo.com",
            dbName: "oskarllc-new-27289548",
            username: "SYG",
            password: "fa8410bdf3264b91ea393b9f8341626a98ca262a",
        };
    }
    // ── Config helpers ──
    isConfigured() {
        return !!(this.config.url && this.config.dbName && this.config.username && this.config.password);
    }
    getConfig() {
        return { url: this.config.url, dbName: this.config.dbName, username: this.config.username };
    }
    setConfig(config) {
        this.config = config;
        this.client = null;
        this.uid = null;
    }
    // ── HTTP / JSON-RPC layer ──
    createClient() {
        if (!this.client) {
            this.client = axios_1.default.create({
                baseURL: this.config.url,
                headers: { "Content-Type": "application/json" },
                httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false }),
                timeout: 60000, // 60s for large fetches
            });
        }
        return this.client;
    }
    async jsonRpc(url, method, params) {
        const client = this.createClient();
        const response = await client.post(url, {
            jsonrpc: "2.0",
            method,
            params,
            id: ++this.requestId,
        });
        if (response.data.error) {
            const msg = response.data.error.message || response.data.error.data?.message || "Unknown Odoo error";
            throw new Error(`Odoo Error: ${msg}`);
        }
        return response.data.result;
    }
    async authenticate() {
        try {
            const result = await this.jsonRpc("/jsonrpc", "call", {
                service: "common",
                method: "authenticate",
                args: [this.config.dbName, this.config.username, this.config.password, {}],
            });
            if (result && typeof result === "number" && result > 0) {
                this.uid = result;
                console.log("✅ Odoo authenticated, UID:", this.uid);
                return true;
            }
            console.error("❌ Odoo auth failed: Invalid response", result);
            return false;
        }
        catch (error) {
            console.error("❌ Odoo auth failed:", error.message);
            return false;
        }
    }
    async ensureAuth() {
        if (!this.uid) {
            const ok = await this.authenticate();
            if (!ok)
                throw new Error("Failed to authenticate with Odoo");
        }
    }
    async executeKw(model, method, args, kwargs = {}) {
        await this.ensureAuth();
        return this.jsonRpc("/jsonrpc", "call", {
            service: "object",
            method: "execute_kw",
            args: [this.config.dbName, this.uid, this.config.password, model, method, args, kwargs],
        });
    }
    async searchRead(model, domain, fields, limit = 100, offset = 0, order) {
        const kwargs = { fields, limit, offset };
        if (order)
            kwargs.order = order;
        return this.executeKw(model, "search_read", [domain], kwargs);
    }
    async read(model, ids, fields) {
        if (ids.length === 0)
            return [];
        return this.executeKw(model, "read", [ids], { fields });
    }
    async searchCount(model, domain) {
        return this.executeKw(model, "search_count", [domain]);
    }
    // ═══════════════════════════════════════════════
    //  PRODUCT FETCHING — COMPLETE FIELD LIST
    // ═══════════════════════════════════════════════
    /**
     * Fetch products from Odoo with ALL fields.
     * Uses product.template model for template-level data.
     */
    async fetchProducts(limit = 100, offset = 0) {
        await this.ensureAuth();
        const products = await this.searchRead("product.template", [["active", "=", true], ["sale_ok", "=", true]], [...exports.ODOO_PRODUCT_TEMPLATE_FIELDS], limit, offset, "write_date desc");
        return products;
    }
    /**
     * Fetch only products modified since a given date (for delta sync)
     */
    async fetchProductsSince(since, limit = 500) {
        await this.ensureAuth();
        const products = await this.searchRead("product.template", [
            ["active", "=", true],
            ["sale_ok", "=", true],
            "|",
            ["write_date", ">", since],
            ["create_date", ">", since],
        ], [...exports.ODOO_PRODUCT_TEMPLATE_FIELDS], limit, 0, "write_date desc");
        return products;
    }
    /**
     * Fetch a single product by Odoo template ID
     */
    async fetchProductById(templateId) {
        await this.ensureAuth();
        const products = await this.read("product.template", [templateId], [...exports.ODOO_PRODUCT_TEMPLATE_FIELDS]);
        return products.length > 0 ? products[0] : null;
    }
    /**
     * Get total count of active saleable products
     */
    async getProductCount() {
        return this.searchCount("product.template", [["active", "=", true], ["sale_ok", "=", true]]);
    }
    // ═══════════════════════════════════════════════
    //  VARIANTS — Individual product.product records
    // ═══════════════════════════════════════════════
    /**
     * Fetch all variants for a given template
     */
    async fetchVariantsByTemplate(templateId) {
        await this.ensureAuth();
        const variants = await this.searchRead("product.product", [["product_tmpl_id", "=", templateId], ["active", "=", true]], [...exports.ODOO_VARIANT_FIELDS], 100);
        return variants;
    }
    /**
     * Fetch specific variants by IDs
     */
    async fetchVariantsByIds(variantIds) {
        if (variantIds.length === 0)
            return [];
        await this.ensureAuth();
        return this.read("product.product", variantIds, [...exports.ODOO_VARIANT_FIELDS]);
    }
    // ═══════════════════════════════════════════════
    //  ATTRIBUTES — Color, Size, Storage, etc.
    // ═══════════════════════════════════════════════
    /**
     * Fetch attribute lines for a product (which attributes it has)
     */
    async fetchAttributeLines(lineIds) {
        if (lineIds.length === 0)
            return [];
        await this.ensureAuth();
        return this.read("product.template.attribute.line", lineIds, [
            "id", "attribute_id", "value_ids", "product_tmpl_id",
        ]);
    }
    /**
     * Fetch attribute values by IDs (e.g., "Red", "XL", "128GB")
     */
    async fetchAttributeValues(valueIds) {
        if (valueIds.length === 0)
            return [];
        await this.ensureAuth();
        return this.read("product.attribute.value", valueIds, [
            "id", "name", "attribute_id", "html_color", "is_custom", "sequence",
        ]);
    }
    /**
     * Fetch template attribute value IDs (for mapping variant → attribute values)
     */
    async fetchTemplateAttributeValues(ids) {
        if (ids.length === 0)
            return [];
        await this.ensureAuth();
        return this.read("product.template.attribute.value", ids, [
            "id", "name", "attribute_id", "product_attribute_value_id", "ptav_active",
        ]);
    }
    // ═══════════════════════════════════════════════
    //  BRANDS — product.brand model
    // ═══════════════════════════════════════════════
    /**
     * Fetch all brands from Odoo
     */
    async fetchBrands() {
        await this.ensureAuth();
        try {
            const brands = await this.searchRead("product.brand", [], ["id", "name", "logo", "description"], 500);
            return brands;
        }
        catch (error) {
            // product.brand model may not exist in all Odoo installations
            console.warn("⚠️  product.brand model not available:", error.message);
            return [];
        }
    }
    /**
     * Fetch a single brand by ID
     */
    async fetchBrandById(brandId) {
        await this.ensureAuth();
        try {
            const brands = await this.read("product.brand", [brandId], ["id", "name", "logo", "description"]);
            return brands.length > 0 ? brands[0] : null;
        }
        catch {
            return null;
        }
    }
    // ═══════════════════════════════════════════════
    //  CATEGORIES
    // ═══════════════════════════════════════════════
    /**
     * Fetch internal categories (product.category)
     */
    async fetchCategories() {
        await this.ensureAuth();
        return this.searchRead("product.category", [], ["id", "name", "parent_id", "complete_name"], 500);
    }
    /**
     * Fetch website public categories (product.public.category)
     */
    async fetchPublicCategories() {
        await this.ensureAuth();
        try {
            return this.searchRead("product.public.category", [], ["id", "name", "parent_id", "parent_path", "sequence", "website_id", "image_128"], 500, 0, "sequence asc");
        }
        catch (error) {
            console.warn("⚠️  product.public.category not available:", error.message);
            return [];
        }
    }
    // ═══════════════════════════════════════════════
    //  IMAGES — Gallery images
    // ═══════════════════════════════════════════════
    /**
     * Fetch extra product images (product.image)
     */
    async fetchProductImages(imageIds) {
        if (imageIds.length === 0)
            return [];
        await this.ensureAuth();
        return this.read("product.image", imageIds, [
            "id", "name", "image_1920", "sequence", "product_tmpl_id",
        ]);
    }
    // ═══════════════════════════════════════════════
    //  VENDORS / SUPPLIERS
    // ═══════════════════════════════════════════════
    /**
     * Fetch vendor/supplier info for a product
     */
    async fetchVendors(sellerIds) {
        if (sellerIds.length === 0)
            return [];
        await this.ensureAuth();
        return this.read("product.supplierinfo", sellerIds, [
            "id", "partner_id", "price", "currency_id", "delay", "min_qty", "product_tmpl_id",
        ]);
    }
    // ═══════════════════════════════════════════════
    //  RIBBONS — NEW / SALE / HOT DEAL badges
    // ═══════════════════════════════════════════════
    /**
     * Fetch all ribbons
     */
    async fetchRibbons() {
        await this.ensureAuth();
        try {
            return this.searchRead("product.ribbon", [], ["id", "html", "bg_color", "text_color", "html_class"], 50);
        }
        catch {
            return [];
        }
    }
    // ═══════════════════════════════════════════════
    //  TAGS
    // ═══════════════════════════════════════════════
    /**
     * Fetch product tags by IDs
     */
    async fetchTags(tagIds) {
        if (tagIds.length === 0)
            return [];
        await this.ensureAuth();
        try {
            return this.read("product.tag", tagIds, ["id", "name", "color"]);
        }
        catch {
            return [];
        }
    }
    // ═══════════════════════════════════════════════
    //  INVENTORY
    // ═══════════════════════════════════════════════
    /**
     * Fetch stock quant records
     */
    async fetchInventory() {
        await this.ensureAuth();
        return this.searchRead("stock.quant", [["quantity", ">", 0]], ["id", "product_id", "location_id", "quantity", "reserved_quantity"], 2000);
    }
    /**
     * Fetch product variants with extended stock fields.
     * Returns qty_available, virtual_available (forecast), incoming, outgoing, free_qty.
     */
    async fetchVariantStock(limit = 1000) {
        await this.ensureAuth();
        return this.searchRead("product.product", [["active", "=", true]], [
            "id", "default_code", "name",
            "qty_available", "virtual_available",
            "incoming_qty", "outgoing_qty", "free_qty",
        ], limit);
    }
    // ═══════════════════════════════════════════════
    //  CONVERT TO MEDUSA FORMAT (Complete)
    // ═══════════════════════════════════════════════
    /**
     * Convert an Odoo product to MedusaJS product format.
     *
     * Mapping strategy:
     * - Native Medusa fields: title, description, handle, status, weight, etc.
     * - metadata JSON: ALL extra Odoo fields that don't have a Medusa equivalent
     *
     * @param product - Complete Odoo product record
     * @param options - Optional resolved related data
     */
    convertToMedusaProduct(product, options) {
        // URL slug: prefer Odoo seo_name, fallback to generated slug
        const handle = (product.seo_name && typeof product.seo_name === "string")
            ? product.seo_name
            : product.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-{2,}/g, "-") // collapse multiple dashes
                .replace(/^-|-$/g, "") // trim leading/trailing dashes
                .substring(0, 100);
        // Determine product status:
        // If product is active + saleable → publish it in Medusa
        // We use Odoo's is_published as a hint but default to "published" for saleable products
        const status = (product.active && product.sale_ok) ? "published" : "draft";
        // Brand name: from resolved brand_id, or x_studio_brand_1, or options
        const brandName = options?.brandName
            || (product.brand_id ? product.brand_id[1] : null)
            || (product.x_studio_brand_1 || null);
        // Ribbon text: from resolved ribbon or options
        const ribbonText = options?.ribbonText
            || (product.website_ribbon_id ? product.website_ribbon_id[1] : null);
        // Helper: strip HTML tags for plain text description
        const stripHtml = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        // Description: prefer description_sale, then strip description_ecommerce, then description
        let description = null;
        if (product.description_sale && typeof product.description_sale === "string") {
            description = product.description_sale;
        }
        else if (product.description_ecommerce && typeof product.description_ecommerce === "string") {
            description = stripHtml(product.description_ecommerce);
        }
        else if (product.description && typeof product.description === "string") {
            description = product.description;
        }
        // Currency code from Odoo (normalize to lowercase)
        const currencyCode = product.currency_id
            ? product.currency_id[1].toLowerCase()
            : "kwd";
        // Currency multiplier: KWD=1000, OMR=1000 (3 decimals), others=100
        const currencyMultiplier = (currencyCode === "kwd" || currencyCode === "omr") ? 1000 : 100;
        return {
            title: product.name,
            subtitle: brandName || null,
            description,
            handle,
            is_giftcard: false,
            status,
            thumbnail: null, // Set separately after image download
            weight: product.weight || 0,
            metadata: {
                // ── Odoo Reference ──
                odoo_id: product.id,
                odoo_sku: product.default_code || null,
                odoo_barcode: product.barcode || null,
                odoo_product_type: product.type || null,
                // ── Category ──
                odoo_category_id: product.categ_id ? product.categ_id[0] : null,
                odoo_category_name: product.categ_id ? product.categ_id[1] : null,
                sub_category: product.x_studio_sub_category || null,
                public_category_ids: product.public_categ_ids || [],
                // ── Brand ──
                brand: brandName,
                brand_id: product.brand_id ? product.brand_id[0] : null,
                brand_selection: product.x_studio_brand_1 || null,
                // ── Prices ──
                cost_price: product.standard_price || 0,
                compare_price: product.compare_list_price || 0,
                retail_price: product.retail_price || 0,
                currency: product.currency_id ? product.currency_id[1] : null,
                // ── Descriptions ──
                ecommerce_description: product.description_ecommerce || null,
                // ── Inventory ──
                odoo_stock: product.qty_available || 0,
                forecasted_qty: product.virtual_available || 0,
                incoming_qty: product.incoming_qty || 0,
                outgoing_qty: product.outgoing_qty || 0,
                is_storable: product.is_storable || false,
                volume: product.volume || 0,
                weight_unit: product.weight_uom_name || "kg",
                volume_unit: product.volume_uom_name || "m³",
                hs_code: product.hs_code || null,
                origin_country: product.country_of_origin ? product.country_of_origin[1] : null,
                origin_country_code: product.country_of_origin ? product.country_of_origin[0] : null,
                lead_time_days: product.sale_delay || 0,
                allow_backorder: product.allow_out_of_stock_order || false,
                oos_message: product.out_of_stock_message || null,
                show_stock_qty: product.show_availability || false,
                stock_threshold: product.available_threshold || 0,
                uom: product.uom_name || null,
                // ── SEO ──
                seo_title: product.website_meta_title || null,
                seo_description: product.website_meta_description || null,
                seo_keywords: product.website_meta_keywords || null,
                og_image: product.website_meta_og_img || null,
                display_order: product.website_sequence || 0,
                odoo_website_url: product.website_url || null,
                is_published_odoo: product.is_published || false,
                // ── Ribbon / Badge ──
                ribbon: ribbonText,
                // ── Tags ──
                tags: options?.tagNames || [],
                tag_ids: product.product_tag_ids || [],
                // ── Cross-sell / Upsell (Odoo template IDs — resolve to Medusa IDs at display time) ──
                upsell_odoo_ids: product.optional_product_ids || [],
                accessory_odoo_ids: product.accessory_product_ids || [],
                alternative_odoo_ids: product.alternative_product_ids || [],
                combo_ids: product.combo_ids || [],
                // ── Social proof ──
                total_sold: product.sales_count || 0,
                rating: product.rating_avg || 0,
                reviews_count: product.rating_count || 0,
                satisfaction_pct: product.rating_percentage_satisfaction || 0,
                latest_review_text: product.rating_last_feedback || null,
                latest_review_rating: product.rating_last_value || 0,
                // ── Vendors ──
                vendors: options?.vendors || [],
                vendor_ids: product.seller_ids || [],
                // ── Feature flags ──
                is_featured: product.is_favorite || false,
                sort_order: product.sequence || 0,
                sale_ok: product.sale_ok || false,
                purchase_ok: product.purchase_ok || false,
                can_be_zoomed: product.can_image_1024_be_zoomed || false,
                // ── Variant info ──
                variant_count: product.product_variant_count || 1,
                has_configurable_attributes: product.has_configurable_attributes || false,
                // ── Image gallery IDs (to be resolved) ──
                gallery_image_ids: product.product_template_image_ids || [],
                // ── Sync timestamp ──
                synced_at: new Date().toISOString(),
                odoo_write_date: product.write_date || null,
            },
            // Default variant (will be replaced with real variants if product has attributes)
            // NOTE: prices are NOT part of CreateProductVariantDTO in MedusaJS 2.x
            // Prices must be set via the Pricing module after product/variant creation
            // Price info is stored in variant metadata for later pricing sync
            variants: [
                {
                    title: "Default",
                    sku: product.default_code || `ODOO-${product.id}`,
                    barcode: product.barcode || undefined,
                    manage_inventory: product.is_storable || false,
                    allow_backorder: product.allow_out_of_stock_order || false,
                    inventory_quantity: Math.floor(product.qty_available || 0),
                    weight: product.weight || 0,
                    metadata: {
                        odoo_product_id: product.id,
                        odoo_price: product.list_price || 0,
                        odoo_price_amount: Math.round((product.list_price || 0) * currencyMultiplier),
                        odoo_currency: currencyCode,
                    },
                },
            ],
        };
    }
    // ═══════════════════════════════════════════════
    //  TEST CONNECTION
    // ═══════════════════════════════════════════════
    async testConnection() {
        try {
            if (!this.isConfigured()) {
                return {
                    success: false,
                    message: "Odoo is not configured. Set ODOO_URL, ODOO_DB_NAME, ODOO_USERNAME, ODOO_API_KEY.",
                };
            }
            const authenticated = await this.authenticate();
            if (!authenticated) {
                return { success: false, message: "Authentication failed. Check credentials." };
            }
            const productCount = await this.getProductCount();
            const categories = await this.fetchCategories();
            let brandCount = 0;
            try {
                const brands = await this.fetchBrands();
                brandCount = brands.length;
            }
            catch { /* brand model may not exist */ }
            return {
                success: true,
                message: "Successfully connected to Odoo",
                data: {
                    userId: this.uid,
                    productCount,
                    categoryCount: categories.length,
                    brandCount,
                },
            };
        }
        catch (error) {
            return { success: false, message: `Connection failed: ${error.message}` };
        }
    }
}
exports.default = OdooSyncService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL29kb28tc3luYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHOzs7Ozs7QUFFSCxrREFBNEM7QUFDNUMsa0RBQXlCO0FBNlB6QixvREFBb0Q7QUFDcEQsMENBQTBDO0FBQzFDLG9EQUFvRDtBQUVwRDs7OztHQUlHO0FBQ1UsUUFBQSw0QkFBNEIsR0FBRztJQUMxQyxPQUFPO0lBQ1AsSUFBSSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRO0lBQ3pELFVBQVUsRUFBRSxhQUFhLEVBQUUsT0FBTztJQUVsQyxTQUFTO0lBQ1QsWUFBWSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGNBQWM7SUFDcEUsYUFBYTtJQUViLGVBQWU7SUFDZixhQUFhLEVBQUUsa0JBQWtCLEVBQUUsdUJBQXVCO0lBRTFELG1CQUFtQjtJQUNuQixVQUFVLEVBQUUsVUFBVSxFQUFFLGtCQUFrQjtJQUMxQyxrQkFBa0IsRUFBRSx1QkFBdUI7SUFFM0Msd0JBQXdCO0lBQ3hCLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsY0FBYztJQUNwRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUI7SUFDdkUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLFlBQVk7SUFDNUMsMEJBQTBCLEVBQUUsc0JBQXNCO0lBQ2xELG1CQUFtQixFQUFFLHFCQUFxQjtJQUMxQyxRQUFRLEVBQUUsVUFBVTtJQUVwQixTQUFTO0lBQ1QsWUFBWSxFQUFFLDRCQUE0QixFQUFFLDBCQUEwQjtJQUV0RSx3QkFBd0I7SUFDeEIsb0JBQW9CLEVBQUUscUJBQXFCLEVBQUUsdUJBQXVCO0lBQ3BFLDZCQUE2QjtJQUU3QixnQkFBZ0I7SUFDaEIsVUFBVSxFQUFFLG9CQUFvQixFQUFFLDBCQUEwQjtJQUM1RCx1QkFBdUIsRUFBRSxxQkFBcUI7SUFDOUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxrQkFBa0I7SUFDakQsbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUVqQixxQkFBcUI7SUFDckIsc0JBQXNCLEVBQUUsdUJBQXVCLEVBQUUseUJBQXlCO0lBQzFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLGFBQWE7SUFFcEQsVUFBVTtJQUNWLFlBQVksRUFBRSxjQUFjLEVBQUUsZ0NBQWdDO0lBQzlELHNCQUFzQixFQUFFLG1CQUFtQjtJQUUzQyxVQUFVO0lBQ1YsWUFBWTtJQUVaLGFBQWE7SUFDYixhQUFhLEVBQUUsWUFBWTtDQUNuQixDQUFBO0FBRVYsaURBQWlEO0FBQ3BDLFFBQUEsbUJBQW1CLEdBQUc7SUFDakMsSUFBSSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsU0FBUztJQUMvQyxZQUFZLEVBQUUsZ0JBQWdCO0lBQzlCLGVBQWUsRUFBRSxtQkFBbUI7SUFDcEMsUUFBUSxFQUFFLFFBQVE7SUFDbEIsWUFBWTtJQUNaLGlCQUFpQjtJQUNqQixzQ0FBc0M7SUFDdEMsUUFBUTtDQUNBLENBQUE7QUFFVixvREFBb0Q7QUFDcEQscUJBQXFCO0FBQ3JCLG9EQUFvRDtBQUVwRDs7O0dBR0c7QUFDSCxNQUFNLGVBQWU7SUFNbkI7UUFKUSxXQUFNLEdBQXlCLElBQUksQ0FBQTtRQUNuQyxRQUFHLEdBQWtCLElBQUksQ0FBQTtRQUN6QixjQUFTLEdBQUcsQ0FBQyxDQUFBO1FBR25CLDhFQUE4RTtRQUM5RSxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osR0FBRyxFQUFFLDRDQUE0QztZQUNqRCxNQUFNLEVBQUUsdUJBQXVCO1lBQy9CLFFBQVEsRUFBRSxLQUFLO1lBQ2YsUUFBUSxFQUFFLDBDQUEwQztTQUNyRCxDQUFBO0lBQ0gsQ0FBQztJQUVELHVCQUF1QjtJQUV2QixZQUFZO1FBQ1YsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ2xHLENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDN0YsQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFrQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDO0lBRUQsOEJBQThCO0lBRXRCLFlBQVk7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3pCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUc7Z0JBQ3hCLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtnQkFDL0MsVUFBVSxFQUFFLElBQUksZUFBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUMxRCxPQUFPLEVBQUUsS0FBSyxFQUFFLHdCQUF3QjthQUN6QyxDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBQ3BCLENBQUM7SUFFTyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQVcsRUFBRSxNQUFjLEVBQUUsTUFBMkI7UUFDNUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDdEMsT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNO1lBQ04sTUFBTTtZQUNOLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQ3JCLENBQUMsQ0FBQTtRQUVGLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN4QixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQTtZQUNwRyxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUN2QyxDQUFDO1FBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUM3QixDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVk7UUFDaEIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUU7Z0JBQ3BELE9BQU8sRUFBRSxRQUFRO2dCQUNqQixNQUFNLEVBQUUsY0FBYztnQkFDdEIsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2FBQzNFLENBQUMsQ0FBQTtZQUNGLElBQUksTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFBO2dCQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDbkQsT0FBTyxJQUFJLENBQUE7WUFDYixDQUFDO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUM3RCxPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ25ELE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFTyxLQUFLLENBQUMsVUFBVTtRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7WUFDcEMsSUFBSSxDQUFDLEVBQUU7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBO1FBQzlELENBQUM7SUFDSCxDQUFDO0lBRU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFFLElBQVcsRUFBRSxTQUE4QixFQUFFO1FBQ2xHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFO1lBQ3RDLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO1NBQ3hGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWEsRUFBRSxNQUFhLEVBQUUsTUFBZ0IsRUFBRSxLQUFLLEdBQUcsR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBYztRQUM5RyxNQUFNLE1BQU0sR0FBd0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFBO1FBQzdELElBQUksS0FBSztZQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDL0QsQ0FBQztJQUVPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBYSxFQUFFLEdBQWEsRUFBRSxNQUFnQjtRQUMvRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sRUFBRSxDQUFBO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ3pELENBQUM7SUFFTyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQWEsRUFBRSxNQUFhO1FBQ3BELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELDBDQUEwQztJQUMxQyxrREFBa0Q7SUFFbEQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDO1FBQ3pDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDcEMsa0JBQWtCLEVBQ2xCLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUMvQyxDQUFDLEdBQUcsb0NBQTRCLENBQUMsRUFDakMsS0FBSyxFQUNMLE1BQU0sRUFDTixpQkFBaUIsQ0FDbEIsQ0FBQTtRQUNELE9BQU8sUUFBeUIsQ0FBQTtJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBYSxFQUFFLEtBQUssR0FBRyxHQUFHO1FBQ2pELE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDcEMsa0JBQWtCLEVBQ2xCO1lBQ0UsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztZQUNyQixDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQ3RCLEdBQUc7WUFDSCxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO1lBQzFCLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUM7U0FDNUIsRUFDRCxDQUFDLEdBQUcsb0NBQTRCLENBQUMsRUFDakMsS0FBSyxFQUNMLENBQUMsRUFDRCxpQkFBaUIsQ0FDbEIsQ0FBQTtRQUNELE9BQU8sUUFBeUIsQ0FBQTtJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBa0I7UUFDdkMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDdkIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9DQUE0QixDQUFDLENBQUMsQ0FBQTtRQUNyRyxPQUFPLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBRSxRQUFRLENBQUMsQ0FBQyxDQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDbEUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGVBQWU7UUFDbkIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDOUYsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCxpREFBaUQ7SUFDakQsa0RBQWtEO0lBRWxEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFVBQWtCO1FBQzlDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDcEMsaUJBQWlCLEVBQ2pCLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQzdELENBQUMsR0FBRywyQkFBbUIsQ0FBQyxFQUN4QixHQUFHLENBQ0osQ0FBQTtRQUNELE9BQU8sUUFBeUIsQ0FBQTtJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBb0I7UUFDM0MsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPLEVBQUUsQ0FBQTtRQUN0QyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN2QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLENBQUMsR0FBRywyQkFBbUIsQ0FBQyxDQUEyQixDQUFBO0lBQ3JHLENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsMkNBQTJDO0lBQzNDLGtEQUFrRDtJQUVsRDs7T0FFRztJQUNILEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFpQjtRQUN6QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sRUFBRSxDQUFBO1FBQ25DLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxPQUFPLEVBQUU7WUFDM0QsSUFBSSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCO1NBQ3JELENBQWlDLENBQUE7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFFBQWtCO1FBQzNDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDcEMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLFFBQVEsRUFBRTtZQUNwRCxJQUFJLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFVBQVU7U0FDcEUsQ0FBa0MsQ0FBQTtJQUNyQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsNEJBQTRCLENBQUMsR0FBYTtRQUM5QyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU8sRUFBRSxDQUFBO1FBQy9CLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7WUFDeEQsSUFBSSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsNEJBQTRCLEVBQUUsYUFBYTtTQUMxRSxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELGdDQUFnQztJQUNoQyxrREFBa0Q7SUFFbEQ7O09BRUc7SUFDSCxLQUFLLENBQUMsV0FBVztRQUNmLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDbEMsZUFBZSxFQUNmLEVBQUUsRUFDRixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxFQUNyQyxHQUFHLENBQ0osQ0FBQTtZQUNELE9BQU8sTUFBcUIsQ0FBQTtRQUM5QixDQUFDO1FBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztZQUNwQiw4REFBOEQ7WUFDOUQsT0FBTyxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDckUsT0FBTyxFQUFFLENBQUE7UUFDWCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFlO1FBQ2xDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUE7WUFDakcsT0FBTyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUUsTUFBTSxDQUFDLENBQUMsQ0FBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFDNUQsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNQLE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQztJQUNILENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsY0FBYztJQUNkLGtEQUFrRDtJQUVsRDs7T0FFRztJQUNILEtBQUssQ0FBQyxlQUFlO1FBQ25CLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FDcEIsa0JBQWtCLEVBQ2xCLEVBQUUsRUFDRixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxFQUM1QyxHQUFHLENBQ3VCLENBQUE7SUFDOUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN2QixJQUFJLENBQUM7WUFDSCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQ3BCLHlCQUF5QixFQUN6QixFQUFFLEVBQ0YsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsRUFDakYsR0FBRyxFQUNILENBQUMsRUFDRCxjQUFjLENBQ2tCLENBQUE7UUFDcEMsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDekUsT0FBTyxFQUFFLENBQUE7UUFDWCxDQUFDO0lBQ0gsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCwyQkFBMkI7SUFDM0Isa0RBQWtEO0lBRWxEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQWtCO1FBQ3pDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDcEMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxRQUFRLEVBQUU7WUFDMUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGlCQUFpQjtTQUMxRCxDQUFnQyxDQUFBO0lBQ25DLENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsdUJBQXVCO0lBQ3ZCLGtEQUFrRDtJQUVsRDs7T0FFRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBbUI7UUFDcEMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPLEVBQUUsQ0FBQTtRQUNyQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN2QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsU0FBUyxFQUFFO1lBQ2xELElBQUksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLGlCQUFpQjtTQUNsRixDQUEwQixDQUFBO0lBQzdCLENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsMENBQTBDO0lBQzFDLGtEQUFrRDtJQUVsRDs7T0FFRztJQUNILEtBQUssQ0FBQyxZQUFZO1FBQ2hCLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3ZCLElBQUksQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FDcEIsZ0JBQWdCLEVBQ2hCLEVBQUUsRUFDRixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsRUFDdEQsRUFBRSxDQUNzQixDQUFBO1FBQzVCLENBQUM7UUFBQyxNQUFNLENBQUM7WUFDUCxPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUM7SUFDSCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELFFBQVE7SUFDUixrREFBa0Q7SUFFbEQ7O09BRUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQWdCO1FBQzlCLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFDbEMsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDdkIsSUFBSSxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUF1QixDQUFBO1FBQ3hGLENBQUM7UUFBQyxNQUFNLENBQUM7WUFDUCxPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUM7SUFDSCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELGFBQWE7SUFDYixrREFBa0Q7SUFFbEQ7O09BRUc7SUFDSCxLQUFLLENBQUMsY0FBYztRQUNsQixNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN2QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQ3BCLGFBQWEsRUFDYixDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN0QixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxFQUNwRSxJQUFJLENBQ3dCLENBQUE7SUFDaEMsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsSUFBSTtRQUNsQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN2QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQ3BCLGlCQUFpQixFQUNqQixDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUN2QjtZQUNFLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTTtZQUM1QixlQUFlLEVBQUUsbUJBQW1CO1lBQ3BDLGNBQWMsRUFBRSxjQUFjLEVBQUUsVUFBVTtTQUMzQyxFQUNELEtBQUssQ0FDTixDQUFBO0lBQ0gsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCx1Q0FBdUM7SUFDdkMsa0RBQWtEO0lBRWxEOzs7Ozs7Ozs7T0FTRztJQUNILHNCQUFzQixDQUNwQixPQUFvQixFQUNwQixPQUtDO1FBRUQsNkRBQTZEO1FBQzdELE1BQU0sTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDO1lBQ3ZFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUTtZQUNsQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUk7aUJBQ1QsV0FBVyxFQUFFO2lCQUNiLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO2lCQUM1QixPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztpQkFDcEIsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBUSwyQkFBMkI7aUJBQ3pELE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQVMsK0JBQStCO2lCQUM3RCxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBRXhCLDRCQUE0QjtRQUM1Qix5REFBeUQ7UUFDekQsd0ZBQXdGO1FBQ3hGLE1BQU0sTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO1FBRTFFLHNFQUFzRTtRQUN0RSxNQUFNLFNBQVMsR0FBRyxPQUFPLEVBQUUsU0FBUztlQUMvQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztlQUMvQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQTtRQUV2QywrQ0FBK0M7UUFDL0MsTUFBTSxVQUFVLEdBQUcsT0FBTyxFQUFFLFVBQVU7ZUFDakMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFdEUscURBQXFEO1FBQ3JELE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBWSxFQUFVLEVBQUUsQ0FDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUUzRCwyRkFBMkY7UUFDM0YsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQTtRQUNyQyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM3RSxXQUFXLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFBO1FBQ3hDLENBQUM7YUFBTSxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsSUFBSSxPQUFPLE9BQU8sQ0FBQyxxQkFBcUIsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM5RixXQUFXLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBQ3hELENBQUM7YUFBTSxJQUFJLE9BQU8sQ0FBQyxXQUFXLElBQUksT0FBTyxPQUFPLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzFFLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFBO1FBQ25DLENBQUM7UUFFRCxtREFBbUQ7UUFDbkQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLFdBQVc7WUFDdEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO1lBQ3RDLENBQUMsQ0FBQyxLQUFLLENBQUE7UUFDVCxtRUFBbUU7UUFDbkUsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFlBQVksS0FBSyxLQUFLLElBQUksWUFBWSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtRQUUxRixPQUFPO1lBQ0wsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ25CLFFBQVEsRUFBRSxTQUFTLElBQUksSUFBSTtZQUMzQixXQUFXO1lBQ1gsTUFBTTtZQUNOLFdBQVcsRUFBRSxLQUFLO1lBQ2xCLE1BQU07WUFDTixTQUFTLEVBQUUsSUFBSSxFQUFFLHNDQUFzQztZQUN2RCxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQzNCLFFBQVEsRUFBRTtnQkFDUix1QkFBdUI7Z0JBQ3ZCLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDbkIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxZQUFZLElBQUksSUFBSTtnQkFDdEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSTtnQkFDckMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJO2dCQUV2QyxpQkFBaUI7Z0JBQ2pCLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQy9ELGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ2pFLFlBQVksRUFBRSxPQUFPLENBQUMscUJBQXFCLElBQUksSUFBSTtnQkFDbkQsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixJQUFJLEVBQUU7Z0JBRW5ELGNBQWM7Z0JBQ2QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN2RCxlQUFlLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixJQUFJLElBQUk7Z0JBRWpELGVBQWU7Z0JBQ2YsVUFBVSxFQUFFLE9BQU8sQ0FBQyxjQUFjLElBQUksQ0FBQztnQkFDdkMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxDQUFDO2dCQUM5QyxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVksSUFBSSxDQUFDO2dCQUN2QyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFFN0QscUJBQXFCO2dCQUNyQixxQkFBcUIsRUFBRSxPQUFPLENBQUMscUJBQXFCLElBQUksSUFBSTtnQkFFNUQsa0JBQWtCO2dCQUNsQixVQUFVLEVBQUUsT0FBTyxDQUFDLGFBQWEsSUFBSSxDQUFDO2dCQUN0QyxjQUFjLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixJQUFJLENBQUM7Z0JBQzlDLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWSxJQUFJLENBQUM7Z0JBQ3ZDLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWSxJQUFJLENBQUM7Z0JBQ3ZDLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVyxJQUFJLEtBQUs7Z0JBQ3pDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQzNCLFdBQVcsRUFBRSxPQUFPLENBQUMsZUFBZSxJQUFJLElBQUk7Z0JBQzVDLFdBQVcsRUFBRSxPQUFPLENBQUMsZUFBZSxJQUFJLElBQUk7Z0JBQzVDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQ2hDLGNBQWMsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtnQkFDL0UsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7Z0JBQ3BGLGNBQWMsRUFBRSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUM7Z0JBQ3ZDLGVBQWUsRUFBRSxPQUFPLENBQUMsd0JBQXdCLElBQUksS0FBSztnQkFDMUQsV0FBVyxFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsSUFBSSxJQUFJO2dCQUNqRCxjQUFjLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixJQUFJLEtBQUs7Z0JBQ2xELGVBQWUsRUFBRSxPQUFPLENBQUMsbUJBQW1CLElBQUksQ0FBQztnQkFDakQsR0FBRyxFQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSTtnQkFFN0IsWUFBWTtnQkFDWixTQUFTLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixJQUFJLElBQUk7Z0JBQzdDLGVBQWUsRUFBRSxPQUFPLENBQUMsd0JBQXdCLElBQUksSUFBSTtnQkFDekQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsSUFBSSxJQUFJO2dCQUNuRCxRQUFRLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixJQUFJLElBQUk7Z0JBQzdDLGFBQWEsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLElBQUksQ0FBQztnQkFDNUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsSUFBSSxJQUFJO2dCQUM3QyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsWUFBWSxJQUFJLEtBQUs7Z0JBRWhELHVCQUF1QjtnQkFDdkIsTUFBTSxFQUFFLFVBQVU7Z0JBRWxCLGFBQWE7Z0JBQ2IsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLElBQUksRUFBRTtnQkFDN0IsT0FBTyxFQUFFLE9BQU8sQ0FBQyxlQUFlLElBQUksRUFBRTtnQkFFdEMsd0ZBQXdGO2dCQUN4RixlQUFlLEVBQUUsT0FBTyxDQUFDLG9CQUFvQixJQUFJLEVBQUU7Z0JBQ25ELGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsSUFBSSxFQUFFO2dCQUN2RCxvQkFBb0IsRUFBRSxPQUFPLENBQUMsdUJBQXVCLElBQUksRUFBRTtnQkFDM0QsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLElBQUksRUFBRTtnQkFFbEMscUJBQXFCO2dCQUNyQixVQUFVLEVBQUUsT0FBTyxDQUFDLFdBQVcsSUFBSSxDQUFDO2dCQUNwQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDO2dCQUMvQixhQUFhLEVBQUUsT0FBTyxDQUFDLFlBQVksSUFBSSxDQUFDO2dCQUN4QyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsOEJBQThCLElBQUksQ0FBQztnQkFDN0Qsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLG9CQUFvQixJQUFJLElBQUk7Z0JBQ3hELG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxDQUFDO2dCQUVwRCxnQkFBZ0I7Z0JBQ2hCLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUU7Z0JBQy9CLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUU7Z0JBRXBDLHNCQUFzQjtnQkFDdEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksS0FBSztnQkFDekMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksQ0FBQztnQkFDakMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLElBQUksS0FBSztnQkFDakMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksS0FBSztnQkFDekMsYUFBYSxFQUFFLE9BQU8sQ0FBQyx3QkFBd0IsSUFBSSxLQUFLO2dCQUV4RCxxQkFBcUI7Z0JBQ3JCLGFBQWEsRUFBRSxPQUFPLENBQUMscUJBQXFCLElBQUksQ0FBQztnQkFDakQsMkJBQTJCLEVBQUUsT0FBTyxDQUFDLDJCQUEyQixJQUFJLEtBQUs7Z0JBRXpFLDJDQUEyQztnQkFDM0MsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLDBCQUEwQixJQUFJLEVBQUU7Z0JBRTNELHVCQUF1QjtnQkFDdkIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2dCQUNuQyxlQUFlLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxJQUFJO2FBQzVDO1lBRUQsa0ZBQWtGO1lBQ2xGLHVFQUF1RTtZQUN2RSwyRUFBMkU7WUFDM0Usa0VBQWtFO1lBQ2xFLFFBQVEsRUFBRTtnQkFDUjtvQkFDRSxLQUFLLEVBQUUsU0FBUztvQkFDaEIsR0FBRyxFQUFHLE9BQU8sQ0FBQyxZQUF1QixJQUFJLFFBQVEsT0FBTyxDQUFDLEVBQUUsRUFBRTtvQkFDN0QsT0FBTyxFQUFHLE9BQU8sQ0FBQyxPQUFrQixJQUFJLFNBQVM7b0JBQ2pELGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksS0FBSztvQkFDOUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyx3QkFBd0IsSUFBSSxLQUFLO29CQUMxRCxrQkFBa0IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO29CQUMxRCxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUMzQixRQUFRLEVBQUU7d0JBQ1IsZUFBZSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUMzQixVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDO3dCQUNuQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQzt3QkFDN0UsYUFBYSxFQUFFLFlBQVk7cUJBQzVCO2lCQUNGO2FBQ0Y7U0FDRixDQUFBO0lBQ0gsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCxtQkFBbUI7SUFDbkIsa0RBQWtEO0lBRWxELEtBQUssQ0FBQyxjQUFjO1FBQ2xCLElBQUksQ0FBQztZQUNILElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztnQkFDekIsT0FBTztvQkFDTCxPQUFPLEVBQUUsS0FBSztvQkFDZCxPQUFPLEVBQUUsa0ZBQWtGO2lCQUM1RixDQUFBO1lBQ0gsQ0FBQztZQUNELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1lBQy9DLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLDJDQUEyQyxFQUFFLENBQUE7WUFDakYsQ0FBQztZQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1lBQ2pELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1lBQy9DLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQTtZQUNsQixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7Z0JBQ3ZDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO1lBQzVCLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBRTNDLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLGdDQUFnQztnQkFDekMsSUFBSSxFQUFFO29CQUNKLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRztvQkFDaEIsWUFBWTtvQkFDWixhQUFhLEVBQUUsVUFBVSxDQUFDLE1BQU07b0JBQ2hDLFVBQVU7aUJBQ1g7YUFDRixDQUFBO1FBQ0gsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDcEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQTtRQUMzRSxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBRUQsa0JBQWUsZUFBZSxDQUFBIn0=