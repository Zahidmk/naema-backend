"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251119043200 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251119043200 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table if not exists "product_brand" ("id" text not null, "product_id" text not null, "brand_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_brand_pkey" primary key ("id"));`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_brand_deleted_at" ON "product_brand" (deleted_at) WHERE deleted_at IS NULL;`);
    }
    async down() {
        this.addSql(`drop table if exists "product_brand" cascade;`);
    }
}
exports.Migration20251119043200 = Migration20251119043200;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNTExMTkwNDMyMDAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9icmFuZHMvbWlncmF0aW9ucy9NaWdyYXRpb24yMDI1MTExOTA0MzIwMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBa0Q7QUFFbEQsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUUzQyxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsNlNBQTZTLENBQUMsQ0FBQztRQUMzVCxJQUFJLENBQUMsTUFBTSxDQUFDLHFIQUFxSCxDQUFDLENBQUM7SUFDckksQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsK0NBQStDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBRUY7QUFYRCwwREFXQyJ9