"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || "development", process.cwd());
const httpConfig = {
    storeCors: process.env.STORE_CORS || "http://localhost:3000",
    adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
    authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:7001",
    jwtSecret: process.env.JWT_SECRET || "supersecret",
    cookieSecret: process.env.COOKIE_SECRET || "supersecret",
};
exports.default = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: httpConfig,
    },
    admin: {
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
                                        "http://localhost:9001/auth/customer/google/callback",
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
                                    from: process.env.SENDGRID_FROM || "noreply@example.com",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFFakUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELE1BQU0sVUFBVSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSx1QkFBdUI7SUFDNUQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLHVCQUF1QjtJQUM1RCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksNkNBQTZDO0lBQ2hGLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO0lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO0NBQ3pELENBQUE7QUFFRCxrQkFBZSxJQUFBLG9CQUFZLEVBQUM7SUFDMUIsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUVELEtBQUssRUFBRTtRQUNMLElBQUksRUFBRSxNQUFNO0tBQ2I7SUFFRCxPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUU7WUFDSixPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUFFLDBCQUEwQjt3QkFDbkMsRUFBRSxFQUFFLFdBQVc7d0JBQ2YsT0FBTyxFQUFFLEVBQUU7cUJBQ1o7b0JBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7d0JBQ2xFLENBQUMsQ0FBQzs0QkFDRTtnQ0FDRSxPQUFPLEVBQUUsdUJBQXVCO2dDQUNoQyxFQUFFLEVBQUUsUUFBUTtnQ0FDWixPQUFPLEVBQUU7b0NBQ1AsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCO29DQUN0QyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7b0NBQzlDLFdBQVcsRUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjt3Q0FDL0IscURBQXFEO2lDQUN4RDs2QkFDRjt5QkFDRjt3QkFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO2lCQUNSO2FBQ0Y7U0FDRjtRQUVELE9BQU8sRUFBRTtZQUNQLE9BQU8sRUFBRSxtQkFBbUI7WUFDNUIsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRSxFQUFFO2FBQ2Q7U0FDRjtRQUVELE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRTtRQUMzQyxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUU7UUFDL0MsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFO1FBQzdDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRTtRQUN6QyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUU7UUFDN0MsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixFQUFFO1FBQy9DLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRTtRQUV2QyxZQUFZLEVBQUU7WUFDWixPQUFPLEVBQUUsd0JBQXdCO1lBQ2pDLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCO3dCQUM5QixDQUFDLENBQUM7NEJBQ0U7Z0NBQ0UsT0FBTyxFQUFFLGlDQUFpQztnQ0FDMUMsRUFBRSxFQUFFLFVBQVU7Z0NBQ2QsT0FBTyxFQUFFO29DQUNQLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQztvQ0FDbkIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCO29DQUNyQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUkscUJBQXFCO2lDQUN6RDs2QkFDRjt5QkFDRjt3QkFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNQO3dCQUNFLE9BQU8sRUFBRSw4QkFBOEI7d0JBQ3ZDLEVBQUUsRUFBRSxPQUFPO3dCQUNYLE9BQU8sRUFBRTs0QkFDUCxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO3lCQUMzQjtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9