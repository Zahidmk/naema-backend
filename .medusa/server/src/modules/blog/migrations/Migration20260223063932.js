"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260223063932 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260223063932 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "blog_post" drop constraint if exists "blog_post_slug_unique";`);
        this.addSql(`create table if not exists "blog_post" ("id" text not null, "title" text not null, "slug" text not null, "content" text null, "excerpt" text null, "author" text null, "image_url" text null, "is_published" boolean not null default false, "published_at" timestamptz null, "category" text null, "reading_time" text null, "likes_count" integer not null default 0, "is_featured" boolean not null default false, "meta_title" text null, "meta_description" text null, "keywords" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_post_pkey" primary key ("id"));`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blog_post_slug_unique" ON "blog_post" (slug) WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_deleted_at" ON "blog_post" (deleted_at) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "blog_post" cascade;`);
    }
}
exports.Migration20260223063932 = Migration20260223063932;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjAyMjMwNjM5MzIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9ibG9nL21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNjAyMjMwNjM5MzIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0RBQWtEO0FBRWxELE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFFM0MsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLHNGQUFzRixDQUFDLENBQUM7UUFDcEcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxcEJBQXFwQixDQUFDLENBQUM7UUFDbnFCLElBQUksQ0FBQyxNQUFNLENBQUMsK0dBQStHLENBQUMsQ0FBQztRQUM3SCxJQUFJLENBQUMsTUFBTSxDQUFDLDZHQUE2RyxDQUFDLENBQUM7SUFDN0gsQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsMkNBQTJDLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBRUY7QUFiRCwwREFhQyJ9