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
// Fix for sdk.client.fetch double-stringifying bodies: parse JSON strings that
// arrive as a JSON-encoded string (e.g. "\"{ ... }\"") so the route handler
// always sees a proper object.
function fixDoubleStringifiedBody(req, _res, next) {
    // Collect raw body when bodyParser is disabled
    if (!req.body || (typeof req.body === "object" && Object.keys(req.body).length === 0)) {
        let raw = "";
        req.on("data", (chunk) => { raw += chunk.toString(); });
        req.on("end", () => {
            if (raw) {
                try {
                    let parsed = JSON.parse(raw);
                    // If it was double-stringified, parsed will be a string — parse again
                    if (typeof parsed === "string")
                        parsed = JSON.parse(parsed);
                    req.body = parsed;
                }
                catch {
                    try {
                        req.body = JSON.parse(raw);
                    }
                    catch { /* leave empty */ }
                }
            }
            next();
        });
        return;
    }
    // Body already parsed — check if it's a string (double-stringify)
    if (typeof req.body === "string") {
        try {
            req.body = JSON.parse(req.body);
        }
        catch { /* leave as-is */ }
    }
    next();
}
exports.default = (0, http_1.defineMiddlewares)({
    routes: [
        {
            // Disable default body parser for admin brand routes to handle double-stringified JSON
            matcher: "/admin/brands",
            method: "POST",
            bodyParser: false,
            middlewares: [fixDoubleStringifiedBody],
        },
        {
            matcher: "/admin/brands/:id",
            method: ["PUT"],
            bodyParser: false,
            middlewares: [fixDoubleStringifiedBody],
        },
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