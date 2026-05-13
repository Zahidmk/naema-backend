"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = syncOdooCustomers;
const axios_1 = __importDefault(require("axios"));
// Odoo configuration
const ODOO_URL = process.env.ODOO_URL || "https://oskarllc-new-27289548.dev.odoo.com";
const ODOO_DB = process.env.ODOO_DB_NAME || "oskarllc-new-27289548";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "SYG";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "S123456";
async function syncOdooCustomers({ container }) {
    console.log("\n👥 Syncing Customers from Odoo to MedusaJS...");
    console.log("=".repeat(50));
    // 1. Authenticate with Odoo
    console.log("\n1️⃣  Authenticating with Odoo...");
    let uid;
    try {
        const authResponse = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {}]
            },
            id: 1
        });
        uid = authResponse.data.result;
        if (!uid) {
            console.error("❌ Authentication failed");
            return;
        }
        console.log(`✅ Authenticated (UID: ${uid})`);
    }
    catch (error) {
        console.error("❌ Authentication failed:", error.message);
        return;
    }
    // 2. Fetch customers from Odoo
    console.log("\n2️⃣  Fetching customers from Odoo...");
    let odooCustomers = [];
    try {
        const response = await axios_1.default.post(`${ODOO_URL}/jsonrpc`, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [
                    ODOO_DB,
                    uid,
                    ODOO_PASSWORD,
                    "res.partner",
                    "search_read",
                    [[["customer_rank", ">", 0], ["email", "!=", false]]],
                    {
                        fields: [
                            "id", "name", "email", "phone", "mobile",
                            "street", "street2", "city", "zip", "country_id",
                            "customer_rank", "is_company"
                        ],
                        limit: 200
                    }
                ]
            },
            id: 2
        });
        odooCustomers = response.data.result || [];
        console.log(`✅ Found ${odooCustomers.length} customers in Odoo`);
    }
    catch (error) {
        console.error("❌ Failed to fetch customers:", error.message);
        return;
    }
    if (odooCustomers.length === 0) {
        console.log("ℹ️  No customers with email found in Odoo");
        return;
    }
    // 3. Get database connection
    const { Pool } = require("pg");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || "postgres://marqa_user:marqa123@localhost:5432/marqa_souq_dev",
    });
    // 4. Check existing customers
    console.log("\n3️⃣  Checking existing customers in MedusaJS...");
    const existingCustomers = await pool.query("SELECT id, email, metadata FROM customer WHERE deleted_at IS NULL");
    const existingEmails = new Set(existingCustomers.rows.map((c) => c.email?.toLowerCase()));
    const existingOdooIds = new Set(existingCustomers.rows
        .filter((c) => c.metadata?.odoo_id)
        .map((c) => c.metadata.odoo_id));
    console.log(`📊 Existing customers: ${existingCustomers.rows.length}`);
    // 5. Import customers
    console.log("\n4️⃣  Importing customers...");
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    for (const customer of odooCustomers) {
        const email = customer.email?.toString().toLowerCase().trim();
        if (!email || email === "false") {
            skipped++;
            continue;
        }
        // Skip if already exists
        if (existingEmails.has(email) || existingOdooIds.has(customer.id)) {
            skipped++;
            continue;
        }
        try {
            // Parse name into first/last
            const nameParts = (customer.name || "").trim().split(" ");
            const firstName = nameParts[0] || "Customer";
            const lastName = nameParts.slice(1).join(" ") || "";
            const customerId = `cus_odoo_${customer.id}_${Date.now()}`;
            // Check if customer with this email already exists
            const existingCheck = await pool.query("SELECT id FROM customer WHERE email = $1 AND deleted_at IS NULL LIMIT 1", [email]);
            if (existingCheck.rows.length > 0) {
                // Update existing customer with Odoo metadata
                await pool.query(`
          UPDATE customer 
          SET metadata = $1, updated_at = NOW()
          WHERE email = $2 AND deleted_at IS NULL
        `, [
                    JSON.stringify({
                        odoo_id: customer.id,
                        odoo_name: customer.name,
                        is_company: customer.is_company,
                        synced_at: new Date().toISOString()
                    }),
                    email
                ]);
                skipped++;
                continue;
            }
            // Insert new customer
            await pool.query(`
        INSERT INTO customer (id, email, first_name, last_name, phone, has_account, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, false, $6, NOW(), NOW())
      `, [
                customerId,
                email,
                firstName,
                lastName,
                customer.phone || customer.mobile || null,
                JSON.stringify({
                    odoo_id: customer.id,
                    odoo_name: customer.name,
                    is_company: customer.is_company,
                    synced_at: new Date().toISOString()
                })
            ]);
            // Create address if available
            if (customer.street || customer.city) {
                const addressId = `addr_odoo_${customer.id}_${Date.now()}`;
                await pool.query(`
          INSERT INTO customer_address (id, customer_id, first_name, last_name, address_1, address_2, city, postal_code, phone, metadata, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        `, [
                    addressId,
                    customerId,
                    firstName,
                    lastName,
                    customer.street || "",
                    customer.street2 || "",
                    customer.city || "",
                    customer.zip || "",
                    customer.phone || customer.mobile || "",
                    JSON.stringify({ odoo_id: customer.id })
                ]);
            }
            imported++;
            console.log(`  ✅ ${imported}. ${customer.name} (${email})`);
        }
        catch (error) {
            if (error.message?.includes("duplicate")) {
                skipped++;
            }
            else {
                errors++;
                console.log(`  ❌ Error: ${customer.name} - ${error.message}`);
            }
        }
    }
    await pool.end();
    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 CUSTOMER SYNC SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log("\n✅ Customer sync completed!");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1vZG9vLWN1c3RvbWVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3N5bmMtb2Rvby1jdXN0b21lcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUErQkEsb0NBbU5DO0FBalBELGtEQUF5QjtBQXdCekIscUJBQXFCO0FBQ3JCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLDRDQUE0QyxDQUFBO0FBQ3JGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFBO0FBQ25FLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQTtBQUN4RCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUE7QUFFN0MsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELENBQUMsQ0FBQTtJQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUUzQiw0QkFBNEI7SUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO0lBRWpELElBQUksR0FBVyxDQUFBO0lBQ2YsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxVQUFVLEVBQUU7WUFDM0QsT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUsTUFBTTtZQUNkLE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsUUFBUTtnQkFDakIsTUFBTSxFQUFFLGNBQWM7Z0JBQ3RCLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLEVB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