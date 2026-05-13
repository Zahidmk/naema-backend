"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("@medusajs/framework/http");
const busboy_1 = __importDefault(require("busboy"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const branding_1 = require("./middlewares/branding");
// Development-only middleware to safely handle multipart/form-data for admin
// upload routes. This avoids the global JSON/body parser from interfering
// with multipart streams during local development where middleware ordering
// can cause `LIMIT_UNEXPECTED_FILE` errors.
//
// This middleware is intentionally gated to non-production environments and
// requires either a valid admin session (production path) or the
// DEV_ADMIN_TOKEN header when ENABLE_DEV_ADMIN_BYPASS=1.
const uploadDir = path_1.default.join(process.cwd(), "static", "uploads");
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
async function adminMultipartGuard(req, res, next) {
    try {
        const ct = (req.headers['content-type'] || '');
        if (!ct.includes('multipart/form-data'))
            return next();
        console.log('Admin multipart middleware handling upload for', req.path);
        const bb = (0, busboy_1.default)({ headers: req.headers });
        let storedFilePath = null;
        let originalName = null;
        let mimetype = null;
        let size = 0;
        bb.on('file', (_field, file, info) => {
            originalName = info.filename;
            mimetype = info.mimeType;
            const safe = (originalName || 'upload').replace(/[^a-zA-Z0-9_.-]/g, '_');
            const filename = `${Date.now()}-${safe}`;
            storedFilePath = path_1.default.join(uploadDir, filename);
            const writeStream = fs_1.default.createWriteStream(storedFilePath);
            file.on('data', (data) => { size += data.length; });
            file.pipe(writeStream);
            writeStream.on('error', (err) => {
                console.error('Write stream error (middleware):', err);
                try {
                    fs_1.default.unlinkSync(storedFilePath);
                }
                catch { }
                return res.status(500).json({ message: 'Failed to write file' });
            });
        });
        bb.on('error', (err) => {
            console.error('Busboy error (middleware):', err);
            return res.status(500).json({ message: 'Upload parsing failed' });
        });
        bb.on('finish', () => {
            if (!storedFilePath) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            // Block video uploads unless explicitly enabled
            const isVideo = (mimetype || '').startsWith('video/');
            const allowVideos = String(process.env.ALLOW_VIDEO_UPLOADS || '').toLowerCase() === 'true';
            if (isVideo && !allowVideos) {
                try {
                    if (fs_1.default.existsSync(storedFilePath))
                        fs_1.default.unlinkSync(storedFilePath);
                }
                catch { }
                return res.status(400).json({ message: 'Video uploads are disabled. Set ALLOW_VIDEO_UPLOADS=true to enable.' });
            }
            const url = `/static/uploads/${path_1.default.basename(storedFilePath)}`;
            console.log('Middleware upload OK ->', url);
            return res.json({ url, filename: originalName, size, mimetype });
        });
        req.pipe(bb);
    }
    catch (e) {
        console.error('Admin multipart middleware failed:', e);
        return res.status(500).json({ message: e?.message || 'Upload failed' });
    }
}
exports.default = (0, http_1.defineMiddlewares)({
    routes: [
        {
            // Match the admin upload endpoints (adjust as needed)
            matcher: "/admin/uploads",
            middlewares: [adminMultipartGuard],
        },
        {
            matcher: "/admin/media/upload",
            // Disable Medusa's built-in body parser so multer can read the raw multipart stream
            bodyParser: false,
            middlewares: [adminMultipartGuard],
        },
        {
            // Inject marqasouq branding into admin pages
            matcher: "/app/*",
            middlewares: [branding_1.injectBranding],
        },
        // Customer authentication for store customer routes (required for /store/customers/me)
        {
            matcher: "/store/customers/me*",
            middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"])],
        },
        // Customer creation after registration - needs allowUnregistered since customer profile doesn't exist yet
        {
            matcher: "/store/customers",
            method: "POST",
            middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"], { allowUnregistered: true })],
        },
        // Customer authentication for custom store routes
        {
            matcher: "/store/wishlist*",
            middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"])],
        },
        // Customer cancel order - must be authenticated and own the order
        {
            matcher: "/store/orders/*/cancel",
            method: "POST",
            middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"])],
        },
        {
            matcher: "/store/products/*/reviews",
            middlewares: [(0, http_1.authenticate)("customer", ["session", "bearer"], { allowUnauthenticated: true })],
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpL21pZGRsZXdhcmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbURBQTBFO0FBRTFFLG9EQUEyQjtBQUMzQixnREFBdUI7QUFDdkIsNENBQW1CO0FBRW5CLHFEQUF1RDtBQUV2RCw2RUFBNkU7QUFDN0UsMEVBQTBFO0FBQzFFLDRFQUE0RTtBQUM1RSw0Q0FBNEM7QUFDNUMsRUFBRTtBQUNGLDRFQUE0RTtBQUM1RSxpRUFBaUU7QUFDakUseURBQXlEO0FBRXpELE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUMvRCxJQUFJLENBQUMsWUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7SUFBRSxZQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBRTNFLEtBQUssVUFBVSxtQkFBbUIsQ0FDaEMsR0FBa0IsRUFDbEIsR0FBbUIsRUFDbkIsSUFBd0I7SUFFeEIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBVyxDQUFBO1FBQ3hELElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDO1lBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQTtRQUV0RCxPQUFPLENBQUMsR0FBRyxDQUFDLGdEQUFnRCxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUV2RSxNQUFNLEVBQUUsR0FBRyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQWMsRUFBRSxDQUFDLENBQUE7UUFFbEQsSUFBSSxjQUFjLEdBQWtCLElBQUksQ0FB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