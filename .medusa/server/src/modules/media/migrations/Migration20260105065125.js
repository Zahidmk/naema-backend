"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260105065125 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260105065125 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "media" add column if not exists "title_ar" text null, add column if not exists "thumbnail_url" text null, add column if not exists "brand" text null, add column if not exists "views" integer not null default 0, add column if not exists "display_order" integer not null default 0, add column if not exists "is_featured" boolean not null default false;`);
    }
    async down() {
        this.addSql(`alter table if exists "media" drop column if exists "title_ar", drop column if exists "thumbnail_url", drop column if exists "brand", drop column if exists "views", drop column if exists "display_order", drop column if exists "is_featured";`);
    }
}
exports.Migration20260105065125 = Migration20260105065125;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjAxMDUwNjUxMjUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWRpYS9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjYwMTA1MDY1MTI1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFrRDtBQUVsRCxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1WEFBdVgsQ0FBQyxDQUFDO0lBQ3ZZLENBQUM7SUFFUSxLQUFLLENBQUMsSUFBSTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLGtQQUFrUCxDQUFDLENBQUM7SUFDbFEsQ0FBQztDQUVGO0FBVkQsMERBVUMifQ==