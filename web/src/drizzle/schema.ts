import { pgTable, text, boolean, uuid, timestamp, primaryKey, integer } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from "next-auth/adapters"

// --- Consolidated User & Subscription Schema ---
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  passwordHash: text("password_hash"),
  image: text("image"),
  // Subscription Metadata
  metal: text('metal').default('Gold'), // Gold, Silver, Platinum, Copper
  locale: text('locale').default('en-US'),
  stripeId: text('stripe_id'), // Used for Session ID initially
  stripeCustomerId: text('stripe_customer_id'), // Actual Customer ID (cus_...)
  active: boolean('active').default(false),
  plan: text('plan').default('pro'), // 'basic' | 'pro'
})

export const digests = pgTable('digests', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: text('date').unique().notNull(), // Format: YYYY-MM-DD
  contentHtml: text('content_html').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

// --- Reports Schema ---

export const agentReports = pgTable('agent_reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    reportBatchId: text('report_batch_id').notNull(), // e.g., "XAUUSD_20260503_210554"
    metal: text('metal').notNull(), // e.g., "XAUUSD"
    date: text('date').notNull().default(''), // e.g., "2026-05-03" (for easy filtering)
    stage: text('stage').notNull().default(''), // e.g., "1_analysts", "2_research", "complete"
    agentName: text('agent_name').notNull(), // e.g., "bull.md", "trader.md", "complete_report.md"
    contentMd: text('content_md').notNull(), // The actual markdown content
    createdAt: timestamp('created_at').defaultNow(),
});

