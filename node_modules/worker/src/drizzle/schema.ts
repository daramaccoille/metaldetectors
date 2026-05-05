import { pgTable, text, boolean, uuid, timestamp, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').unique().notNull(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    passwordHash: text('password_hash'),
    image: text('image'),
    // Subscription Metadata
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

export const metalReadings = pgTable('metal_readings', {
    id: uuid('id').defaultRandom().primaryKey(),
    metal: text('metal').notNull(), // XAU, XAG, etc.
    price: numeric('price').notNull(),
    currency: text('currency').default('USD'),
    createdAt: timestamp('created_at').defaultNow(),
});
