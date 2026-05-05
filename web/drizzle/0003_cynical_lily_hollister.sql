CREATE TABLE "agent_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_batch_id" text NOT NULL,
	"metal" text NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"stage" text DEFAULT '' NOT NULL,
	"agent_name" text NOT NULL,
	"content_md" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "digests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"content_html" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "digests_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"password_hash" text,
	"image" text,
	"metal" text DEFAULT 'Gold',
	"locale" text DEFAULT 'en-US',
	"stripe_id" text,
	"stripe_customer_id" text,
	"active" boolean DEFAULT false,
	"plan" text DEFAULT 'pro',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "subscribers" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "subscribers_email_unique";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "provider" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "providerAccountId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "expires_at" integer;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "token_type" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "session_state" text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "locale";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "stripe_id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "active";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "plan";