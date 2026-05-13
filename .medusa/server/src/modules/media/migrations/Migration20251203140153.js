"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251203140153 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251203140153 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "banner" drop column if exists "media_id";`);
        this.addSql(`alter table if exists "banner" add column if not exists "image_url" text null;`);
    }
    async down() {
        this.addSql(`alter table if exists "banner" drop column if exists "image_url";`);
        this.addSql(`alter table if exists "banner" add column if not exists "media_id" text not null;`);
    }
}
exports.Migration20251203140153 = Migration20251203140153;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTEyMDMxNDAxNTMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWRpYS9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjUxMjAzMTQwMTUzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFrRDtBQUVsRCxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBRWhGLElBQUksQ0FBQyxNQUFNLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO1FBRWpGLElBQUksQ0FBQyxNQUFNLENBQUMsbUZBQW1GLENBQUMsQ0FBQztJQUNuRyxDQUFDO0NBRUY7QUFkRCwwREFjQyJ9