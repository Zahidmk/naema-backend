"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251224120000 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251224120000 extends migrations_1.Migration {
    async up() {
        // Add nullable thumbnail_url column to media table
        this.addSql(`alter table if exists "media" add column if not exists "thumbnail_url" text null;`);
    }
    async down() {
        this.addSql(`alter table if exists "media" drop column if exists "thumbnail_url";`);
    }
}
exports.Migration20251224120000 = Migration20251224120000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTEyMjQxMjAwMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWRpYS9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjUxMjI0MTIwMDAwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFrRDtBQUVsRCxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsbURBQW1EO1FBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsbUZBQW1GLENBQUMsQ0FBQztJQUNuRyxDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7Q0FFRjtBQVhELDBEQVdDIn0=