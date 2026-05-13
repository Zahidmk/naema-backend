"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260303102032 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20260303102032 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "brand" add column if not exists "is_special" boolean not null default false;`);
    }
    async down() {
        this.addSql(`alter table if exists "brand" drop column if exists "is_special";`);
    }
}
exports.Migration20260303102032 = Migration20260303102032;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjAzMDMxMDIwMzIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9icmFuZHMvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI2MDMwMzEwMjAzMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUUzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMscUdBQXFHLENBQUMsQ0FBQztJQUNySCxDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO0lBQ25GLENBQUM7Q0FFRjtBQVZELDBEQVVDIn0=