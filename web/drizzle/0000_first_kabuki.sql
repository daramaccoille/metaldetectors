CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"currency" text DEFAULT 'USD',
	"locale" text DEFAULT 'en-US',
	"stripe_id" text,
	"active" boolean DEFAULT false,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
