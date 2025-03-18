DO $$ BEGIN
 CREATE TYPE "public"."tax" AS ENUM('Luxury', 'GST', 'VAT', 'Service');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Category" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"categoryName" varchar NOT NULL,
	"description" text,
	"taxApplicability" boolean DEFAULT false,
	"tax" real DEFAULT 0,
	"image" text,
	"taxType" "tax" DEFAULT 'GST'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Items" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"subcategory_id" integer,
	"category_id" integer,
	"itemName" varchar NOT NULL,
	"description" text,
	"taxApplicability" boolean DEFAULT false,
	"tax" real DEFAULT 0,
	"baseAmount" real NOT NULL,
	"discount" real DEFAULT 0,
	"totalAmount" real NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Subcategory" (
	"subcategory_id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"subcategoryName" varchar NOT NULL,
	"description" text,
	"taxApplicability" boolean DEFAULT false,
	"tax" real DEFAULT 0,
	"image" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Items" ADD CONSTRAINT "Items_subcategory_id_Subcategory_subcategory_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."Subcategory"("subcategory_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Items" ADD CONSTRAINT "Items_category_id_Category_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."Category"("category_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_category_id_Category_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."Category"("category_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
