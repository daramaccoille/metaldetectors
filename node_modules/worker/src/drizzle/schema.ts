
import { pgTable, text, boolean, uuid } from 'drizzle-orm/pg-core';

export const subscribers = pgTable('subscribers', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique().notNull(),
    currency: text('currency').default('USD'), // USD, EUR, GBP
    locale: text('locale').default('en-US'),
    stripeId: text('stripe_id'),
    active: boolean('active').default(false),
    stripeCustomerId: text('stripe_customer_id'),
    plan: text('plan').default('pro') // 'basic' or 'pro'
});
