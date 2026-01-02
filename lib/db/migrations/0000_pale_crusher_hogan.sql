CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"card_key" text NOT NULL,
	"is_used" boolean DEFAULT false,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"email" text,
	"status" text DEFAULT 'pending',
	"trade_no" text,
	"card_key" text,
	"paid_at" timestamp,
	"delivered_at" timestamp,
	"user_id" text,
	"username" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"category" text,
	"image" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;