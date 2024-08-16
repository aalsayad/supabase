ALTER TABLE "users_table" ADD COLUMN "auth_data" jsonb;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "supa_admin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "picture" text;--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN IF EXISTS "age";--> statement-breakpoint
ALTER TABLE "users_table" DROP COLUMN IF EXISTS "toes";