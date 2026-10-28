import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "meal_plans" ADD COLUMN IF NOT EXISTS "calories_target" numeric;
  ALTER TABLE "meal_plans" ADD COLUMN IF NOT EXISTS "protein_percent" numeric;
  ALTER TABLE "meal_plans" ADD COLUMN IF NOT EXISTS "carbs_percent" numeric;
  ALTER TABLE "meal_plans" ADD COLUMN IF NOT EXISTS "fat_percent" numeric;
  ALTER TABLE "meal_plans" ADD COLUMN IF NOT EXISTS "duration_weeks" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "meal_plans" DROP COLUMN IF EXISTS "duration_weeks";
  ALTER TABLE "meal_plans" DROP COLUMN IF EXISTS "fat_percent";
  ALTER TABLE "meal_plans" DROP COLUMN IF EXISTS "carbs_percent";
  ALTER TABLE "meal_plans" DROP COLUMN IF EXISTS "protein_percent";
  ALTER TABLE "meal_plans" DROP COLUMN IF EXISTS "calories_target";
  `)
}
