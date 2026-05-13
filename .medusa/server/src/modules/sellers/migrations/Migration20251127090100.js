"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251127090100 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251127090100 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "seller" ("id" text not null, "name" text not null, "email" text null, "phone" text null, "legal_name" text null, "tax_id" text null, "address_json" jsonb null, "logo_url" text null, "status" text not null default 'pending', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seller_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seller_deleted_at" ON "seller" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`create table if not exists "seller_request" ("id" text not null, "seller_name" text not null, "email" text null, "phone" text null, "documents_urls" jsonb null, "notes" text null, "status" text not null default 'pending', "decision_note" text null, "decided_at" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seller_request_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seller_request_deleted_at" ON "seller_request" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`create table if not exists "seller_product_link" ("id" text not null, "seller_id" text not null, "product_id" text not null, "display_order" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seller_product_link_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seller_product_link_deleted_at" ON "seller_product_link" (deleted_at) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "seller" cascade;`);
        this.addSql(`drop table if exists "seller_request" cascade;`);
        this.addSql(`drop table if exists "seller_product_link" cascade;`);
    }
}
exports.Migration20251127090100 = Migration20251127090100;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTExMjcwOTAxMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9zZWxsZXJzL21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNTExMjcwOTAxMDAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0RBQWtEO0FBRWxELE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFDM0MsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLG1jQUFtYyxDQUFDLENBQUM7UUFDamQsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1R0FBdUcsQ0FBQyxDQUFDO1FBRXJILElBQUksQ0FBQyxNQUFNLENBQUMsZ2VBQWdlLENBQUMsQ0FBQztRQUM5ZSxJQUFJLENBQUMsTUFBTSxDQUFDLHVIQUF1SCxDQUFDLENBQUM7UUFFckksSUFBSSxDQUFDLE1BQU0sQ0FBQyw2WEFBNlgsQ0FBQyxDQUFDO1FBQzNZLElBQUksQ0FBQyxNQUFNLENBQUMsaUlBQWlJLENBQUMsQ0FBQztJQUNqSixDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsZ0RBQWdELENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsTUFBTSxDQUFDLHFEQUFxRCxDQUFDLENBQUM7SUFDckUsQ0FBQztDQUNGO0FBakJELDBEQWlCQyJ9