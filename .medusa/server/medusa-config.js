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
        cookieOptions: {
            secure: false,
            sameSite: "lax",
        },
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
                    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
                        ? [
                            {
                                resolve: "@medusajs/auth-google",
                                id: "google",
                                options: {
                                    clientId: process.env.GOOGLE_CLIENT_ID,
                                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                                    callbackUrl: process.env.GOOGLE_CALLBACK_URL ||
                                        "http://localhost:9000/auth/customer/google/callback",
                                },
                            },
                        ]
                        : []),
                ],
            },
        },
        payment: {
            resolve: "@medusajs/payment",
            options: {
                providers: [
                    {
                        resolve: "./src/modules/myfatoorah",
                        id: "myfatoorah",
                        options: {},
                    },
                ],
            },
        },
        brands: { resolve: "./src/modules/brands" },
        wishlist: { resolve: "./src/modules/wishlist" },
        reviews: { resolve: "./src/modules/reviews" },
        media: { resolve: "./src/modules/media" },
        sellers: { resolve: "./src/modules/sellers" },
        warranty: { resolve: "./src/modules/warranty" },
        blog: { resolve: "./src/modules/blog" },
        file: {
            resolve: "@medusajs/file",
            options: {
                providers: [
                    {
                        resolve: "@medusajs/file-local",
                        id: "local",
                        options: {
                            upload_dir: "static/uploads",
                            backend_url: (process.env.MEDUSA_BACKEND_URL || "http://localhost:9000") + "/static/uploads",
                        },
                    },
                ],
            },
        },
        notification: {
            resolve: "@medusajs/notification",
            options: {
                providers: [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFFakUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELE1BQU0sVUFBVSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHO0lBQ3hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHO0lBQ3hDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxHQUFHO0lBQ3RDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO0lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO0lBQ3hELGFBQWEsRUFBRTtRQUNiLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDOUQsUUFBUSxFQUFFLEtBQUs7S0FDaEI7Q0FDRixDQUFBO0FBRUQsa0JBQWUsSUFBQSxvQkFBWSxFQUFDO0lBQzFCLGFBQWEsRUFBRTtRQUNiLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVk7UUFDckMsSUFBSSxFQUFFLFVBQVU7UUFDaEIsYUFBYSxFQUFFO1lBQ2IsTUFBTSxFQUFFLEtBQUs7WUFDYixRQUFRLEVBQUUsS0FBSztTQUNoQjtLQUNGO0lBRUQsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDWCxNQUFNLEVBQUU7Z0JBQ04sWUFBWSxFQUFFLENBQUMsc0JBQXNCLEVB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