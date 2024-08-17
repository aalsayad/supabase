CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"authData" jsonb NOT NULL,
	"supaAdmin" boolean DEFAULT false,
	"picture" text,
	"verified" boolean DEFAULT false,
	"provider" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "users_table";