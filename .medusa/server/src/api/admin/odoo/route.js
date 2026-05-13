"use strict";
/**
 * Odoo Admin API Routes
 * Provides endpoints for managing Odoo integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const service_1 = __importDefault(require("../../../modules/odoo-sync/service"));
// Instantiate the service
const odooService = new service_1.default();
/**
 * GET /admin/odoo/status
 * Get Odoo integration status and configuration
 */
async function GET(req, res) {
    try {
        const config = odooService.getConfig();
        const isConfigured = odooService.isConfigured();
        res.json({
            success: true,
            data: {
                configured: isConfigured,
                config: {
                    url: config.url || null,
                    dbName: config.dbName || null,
                    username: config.username || null,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
/**
 * POST /admin/odoo/status
 * Test connection to Odoo
 */
async function POST(req, res) {
    try {
        const result = await odooService.testConnection();
        res.json({
            success: result.success,
            message: result.message,
            data: result.data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL29kb28vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFZSCxrQkF5QkM7QUFNRCxvQkFrQkM7QUExREQsaUZBQWdFO0FBRWhFLDBCQUEwQjtBQUMxQixNQUFNLFdBQVcsR0FBRyxJQUFJLGlCQUFlLEVBQUUsQ0FBQTtBQUV6Qzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUN2QixHQUFrQixFQUNsQixHQUFtQjtJQUVuQixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDdEMsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFBO1FBRS9DLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUksRUFBRTtnQkFDSixVQUFVLEVBQUUsWUFBWTtnQkFDeEIsTUFBTSxFQUFFO29CQUNOLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUk7b0JBQ3ZCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUk7b0JBQzdCLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxJQUFJLElBQUk7aUJBQ2xDO2FBQ0Y7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTztTQUNyQixDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBRWpELEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDdkIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1lBQ3ZCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTztTQUNyQixDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyJ9