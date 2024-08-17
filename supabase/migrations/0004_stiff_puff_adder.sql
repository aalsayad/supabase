ALTER TABLE "users_table" ALTER COLUMN "auth_data" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "provider" text NOT NULL;

