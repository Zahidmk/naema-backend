import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

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
}

export default defineConfig({
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
          ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                {
                  resolve: "@medusajs/auth-google",
                  id: "google",
                  options: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackUrl:
                      process.env.GOOGLE_CALLBACK_URL ||
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
    "odoo-sync": { resolve: "./src/modules/odoo-sync" },

    file: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "static/uploads",
              backend_url: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
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
})
