"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251119043917 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251119043917 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "wishlist" ("id" text not null, "customer_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wishlist_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_wishlist_deleted_at" ON "wishlist" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`create table if not exists "wishlist_item" ("id" text not null, "wishlist_id" text not null, "product_id" text not null, "variant_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wishlist_item_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_wishlist_item_deleted_at" ON "wishlist_item" (deleted_at) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "wishlist" cascade;`);
        this.addSql(`drop table if exists "wishlist_item" cascade;`);
    }
}
exports.Migration20251119043917 = Migration20251119043917;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTExMTkwNDM5MTcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy93aXNobGlzdC9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjUxMTE5MDQzOTE3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFrRDtBQUVsRCxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQywwUUFBMFEsQ0FBQyxDQUFDO1FBQ3hSLElBQUksQ0FBQyxNQUFNLENBQUMsMkdBQTJHLENBQUMsQ0FBQztRQUV6SCxJQUFJLENBQUMsTUFBTSxDQUFDLHdVQUF3VSxDQUFDLENBQUM7UUFDdFYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxSEFBcUgsQ0FBQyxDQUFDO0lBQ3JJLENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FFRjtBQWhCRCwwREFnQkMifQ==