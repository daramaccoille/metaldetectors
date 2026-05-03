import { pgTable, text, boolean, uuid, timestamp, primaryKey, integer } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from "next-auth/adapters"

export const subscribers = pgTable('subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  metal: text('metal').default('Gold'), // Gold, Silver, Platinum, Copper
  locale: text('locale').default('en-US'),
  stripeId: text('stripe_id'), // Used for Session ID initially
  stripeCustomerId: text('stripe_customer_id'), // Actual Customer ID (cus_...)
  active: boolean('active').default(false),
  plan: text('plan').default('pro'), // 'basic' | 'pro'
});

export const digests = pgTable('digests', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: text('date').unique().notNull(), // Format: YYYY-MM-DD
  contentHtml: text('content_html').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- NextAuth Schema ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
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
