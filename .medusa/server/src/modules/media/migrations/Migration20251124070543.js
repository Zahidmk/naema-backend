"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251124070543 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251124070543 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "gallery" drop constraint if exists "gallery_slug_unique";`);
        this.addSql(`create table if not exists "banner" ("id" text not null, "title" text null, "media_id" text not null, "link" text null, "position" text null, "is_active" boolean not null default true, "start_at" text null, "end_at" text null, "display_order" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "banner_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_banner_deleted_at" ON "banner" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`create table if not exists "gallery" ("id" text not null, "name" text not null, "slug" text not null, "description" text null, "is_active" boolean not null default true, "display_order" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gallery_pkey" primary key ("id"));`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_gallery_slug_unique" ON "gallery" (slug) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_gallery_deleted_at" ON "gallery" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`create table if not exists "gallery_media" ("id" text not null, "gallery_id" text not null, "media_id" text not null, "display_order" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gallery_media_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_gallery_media_deleted_at" ON "gallery_media" (deleted_at) WHERE deleted_at IS NULL;`);
        this.addSql(`create table if not exists "media" ("id" text not null, "url" text not null, "mime_type" text null, "title" text null, "alt_text" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "media_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_media_deleted_at" ON "media" (deleted_at) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "banner" cascade;`);
        this.addSql(`drop table if exists "gallery" cascade;`);
        this.addSql(`drop table if exists "gallery_media" cascade;`);
        this.addSql(`drop table if exists "media" cascade;`);
    }
}
exports.Migration20251124070543 = Migration20251124070543;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTExMjQwNzA1NDMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWRpYS9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjUxMTI0MDcwNTQzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFrRDtBQUVsRCxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO1FBQ2hHLElBQUksQ0FBQyxNQUFNLENBQUMsc2RBQXNkLENBQUMsQ0FBQztRQUNwZSxJQUFJLENBQUMsTUFBTSxDQUFDLHVHQUF1RyxDQUFDLENBQUM7UUFFckgsSUFBSSxDQUFDLE1BQU0sQ0FBQyw4WkFBOFosQ0FBQyxDQUFDO1FBQzVhLElBQUksQ0FBQyxNQUFNLENBQUMsMkdBQTJHLENBQUMsQ0FBQztRQUN6SCxJQUFJLENBQUMsTUFBTSxDQUFDLHlHQUF5RyxDQUFDLENBQUM7UUFFdkgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnWEFBZ1gsQ0FBQyxDQUFDO1FBQzlYLElBQUksQ0FBQyxNQUFNLENBQUMscUhBQXFILENBQUMsQ0FBQztRQUVuSSxJQUFJLENBQUMsTUFBTSxDQUFDLG1WQUFtVixDQUFDLENBQUM7UUFDalcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxR0FBcUcsQ0FBQyxDQUFDO0lBQ3JILENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBRXZELElBQUksQ0FBQyxNQUFNLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQUMsTUFBTSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUVGO0FBNUJELDBEQTRCQyJ9