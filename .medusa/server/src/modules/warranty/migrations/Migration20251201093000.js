"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251201093000 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251201093000 extends migrations_1.Migration {
    async up() {
        // warranties
        this.addSql(`create table if not exists "warranty" (
      "id" text not null,
      "product_id" text not null,
      "order_id" text null,
      "order_item_id" text null,
      "customer_email" text not null,
      "type" text not null default 'manufacturer',
      "duration_months" integer not null default 12,
      "start_date" timestamptz not null,
      "end_date" timestamptz null,
      "status" text not null default 'active',
      "terms" text null,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "warranty_pkey" primary key ("id")
    );`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_warranty_deleted_at" ON "warranty" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_warranty_customer_email" ON "warranty" (customer_email);`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_warranty_product_id" ON "warranty" (product_id);`);
        // warranty_claims
        this.addSql(`create table if not exists "warranty_claim" (
      "id" text not null,
      "warranty_id" text not null,
      "customer_email" text not null,
      "issue_description" text not null,
      "status" text not null default 'submitted',
      "admin_notes" text null,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "warranty_claim_pkey" primary key ("id")
    );`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_warranty_claim_deleted_at" ON "warranty_claim" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_warranty_claim_warranty_id" ON "warranty_claim" (warranty_id);`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_warranty_claim_status" ON "warranty_claim" (status);`);
    }
    async down() {
        this.addSql(`drop table if exists "warranty_claim" cascade;`);
        this.addSql(`drop table if exists "warranty" cascade;`);
    }
}
exports.Migration20251201093000 = Migration20251201093000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTEyMDEwOTMwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy93YXJyYW50eS9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjUxMjAxMDkzMDAwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFrRDtBQUVsRCxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBQzNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsYUFBYTtRQUNiLElBQUksQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O09BaUJULENBQUMsQ0FBQztRQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsMkdBQTJHLENBQUMsQ0FBQztRQUN6SCxJQUFJLENBQUMsTUFBTSxDQUFDLDBGQUEwRixDQUFDLENBQUM7UUFDeEcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO1FBRWhHLGtCQUFrQjtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7T0FZVCxDQUFDLENBQUM7UUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLHVIQUF1SCxDQUFDLENBQUM7UUFDckksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnR0FBZ0csQ0FBQyxDQUFDO1FBQzlHLElBQUksQ0FBQyxNQUFNLENBQUMsc0ZBQXNGLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxNQUFNLENBQUMsMENBQTBDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0NBQ0Y7QUFoREQsMERBZ0RDIn0=