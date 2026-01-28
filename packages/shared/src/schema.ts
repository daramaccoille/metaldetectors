
import { pgTable, text, boolean, uuid, timestamp } from 'drizzle-orm/pg-core';

export const subscribers = pgTable('subscribers', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique().notNull(),
    currency: text('currency').default('USD'), // USD, EUR, GBP
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
