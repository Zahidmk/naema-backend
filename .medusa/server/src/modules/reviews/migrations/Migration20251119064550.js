"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251119064550 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251119064550 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "review" ("id" text not null, "product_id" text not null, "customer_id" text not null, "rating" integer not null, "title" text null, "content" text null, "status" text not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" (deleted_at) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "review" cascade;`);
    }
}
exports.Migration20251119064550 = Migration20251119064550;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTExMTkwNjQ1NTAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXZpZXdzL21pZ3JhdGlvbnMvTWlncmF0aW9uMjAyNTExMTkwNjQ1NTAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0RBQWtEO0FBRWxELE1BQWEsdUJBQXdCLFNBQVEsc0JBQVM7SUFFM0MsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLCtZQUErWSxDQUFDLENBQUM7UUFDN1osSUFBSSxDQUFDLE1BQU0sQ0FBQyx1R0FBdUcsQ0FBQyxDQUFDO0lBQ3ZILENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7SUFDeEQsQ0FBQztDQUVGO0FBWEQsMERBV0MifQ==