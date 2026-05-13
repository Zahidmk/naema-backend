"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251118091459 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251118091459 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "brand" drop constraint if exists "brand_slug_unique";`);
        this.addSql(`create table if not exists "brand" ("id" text not null, "name" text not null, "slug" text not null, "description" text null, "logo_url" text null, "banner_url" text null, "is_active" boolean not null default true, "meta_title" text null, "meta_description" text null, "display_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "brand_pkey" primary key ("id"));`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_brand_slug_unique" ON "brand" (slug) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" ON "brand" (deleted_at) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "brand" cascade;`);
    }
}
exports.Migration20251118091459 = Migration20251118091459;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTExMTgwOTE0NTkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9icmFuZHMvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI1MTExODA5MTQ1OS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUUzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsOEVBQThFLENBQUMsQ0FBQztRQUM1RixJQUFJLENBQUMsTUFBTSxDQUFDLHVlQUF1ZSxDQUFDLENBQUM7UUFDcmYsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1R0FBdUcsQ0FBQyxDQUFDO1FBQ3JILElBQUksQ0FBQyxNQUFNLENBQUMscUdBQXFHLENBQUMsQ0FBQztJQUNySCxDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FFRjtBQWJELDBEQWFDIn0=