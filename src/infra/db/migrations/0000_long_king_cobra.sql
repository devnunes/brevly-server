CREATE TABLE "links" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"short_url" text NOT NULL,
	"access_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
