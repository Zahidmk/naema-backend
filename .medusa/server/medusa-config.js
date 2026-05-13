"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || "development", process.cwd());
const httpConfig = {
    storeCors: process.env.STORE_CORS || "*",
    adminCors: process.env.ADMIN_CORS || "*",
    authCors: process.env.AUTH_CORS || "*",
    jwtSecret: process.env.JWT_SECRET || "supersecret",
    cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    cookieOptions: {
        secure: (process.env.BACKEND_URL || "").startsWith("https://"),
        sameSite: "lax",
    },
};
exports.default = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: httpConfig,
    },
    admin: {
        vite: () => ({
            server: {
                allowedHosts: ["admin.markasouqs.com", "localhost", "127.0.0.1"],
            },
        }),
        path: "/app",
    },
    modules: {
        auth: {
            resolve: "@medusajs/auth",
            options: {
                providers: [
                    {
                        resolve: "@medusajs/auth-emailpass",
                        id: "emailpass",
                        options: {},
                    },
                    // Google OAuth - only enabled if credentials are set
                    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
                        ? [
                            {
                                resolve: "@medusajs/auth-google",
                                id: "google",
                                options: {
                                    clientId: process.env.GOOGLE_CLIENT_ID,
                                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                                    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:9000/auth/customer/google/callback",
                                },
                            },
                        ]
                        : []),
                ],
            },
        },
        // Payment module - enables payment collections and COD/manual payments
        // pp_system_default is the built-in provider for Cash on Delivery
        payment: {
            resolve: "@medusajs/payment",
            options: {
                providers: [],
            },
        },
        brands: { resolve: "./src/modules/brands" },
        wishlist: { resolve: "./src/modules/wishlist" },
        reviews: { resolve: "./src/modules/reviews" },
        media: { resolve: "./src/modules/media" },
        sellers: { resolve: "./src/modules/sellers" },
        warranty: { resolve: "./src/modules/warranty" },
        blog: { resolve: "./src/modules/blog" },
        // Notification module for email notifications
        notification: {
            resolve: "@medusajs/notification",
            options: {
                providers: [
                    // SendGrid for production emails
                    ...(process.env.SENDGRID_API_KEY
                        ? [
                            {
                                resolve: "@medusajs/notification-sendgrid",
                                id: "sendgrid",
                                options: {
                                    channels: ["email"],
                                    api_key: process.env.SENDGRID_API_KEY,
                                    from: process.env.SENDGRID_FROM || "noreply@markasouq.com",
                                },
                            },
                        ]
                        : []),
                    // Local notification provider (logs to console in development)
                    {
                        resolve: "@medusajs/notification-local",
                        id: "local",
                        options: {
                            channels: ["email", "log"],
                        },
                    },
                ],
            },
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFFakUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELE1BQU0sVUFBVSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHO0lBQ3hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHO0lBQ3hDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxHQUFHO0lBQ3RDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO0lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO0lBQ3hELGFBQWEsRUFBRTtRQUNiLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDOUQsUUFBUSxFQUFFLEtBQUs7S0FDaEI7Q0FDRixDQUFBO0FBRUQsa0JBQWUsSUFBQSxvQkFBWSxFQUFDO0lBQzFCLGFBQWEsRUFBRTtRQUNiLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVk7UUFDckMsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFFRCxLQUFLLEVBQUU7UUFDTCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNYLE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDO2FBQ2pFO1NBQ0YsQ0FBQztRQUNGLElBQUksRUFBRSxNQUFNO0tB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