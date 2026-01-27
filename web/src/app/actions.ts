
'use server'

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { db } from '@/drizzle/db';
import { subscribers } from '@/drizzle/schema';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2025-01-27.acacia' as any, // Latest or matching installed
    httpClient: Stripe.createFetchHttpClient(),
});

export async function subscribe(formData: FormData) {
    const email = formData.get('email') as string;
    // 'plan' can be 'basic' or 'pro' (defaulting to pro if not specified)
    const plan = formData.get('plan') as string || 'pro';

    if (!email) return;

    // Attempt to detect locale from Cloudflare headers
    const headersList = await headers();
    const country = headersList.get('cf-ipcountry');

    let currency = 'USD';
    let locale = 'en-US';

    if (country === 'GB') {
        currency = 'GBP';
        locale = 'en-GB';
    } else if (['DE', 'FR', 'ES', 'IT', 'IE'].includes(country || '')) {
        currency = 'EUR';
        // Mapping country to locale could be more complex, simplification:
        locale = country === 'FR' ? 'fr-FR' : 'de-DE';
    }

    // Create Checkout Session
    // Use environmental variables for price IDs
    // STRIPE_PRICE_ID_PRO and STRIPE_PRICE_ID_BASIC should be defined

    // Fallback to existing single var if strict PRO/BASIC vars aren't separate yet
    let priceId = process.env.STRIPE_PRICE_ID;

    if (plan === 'basic') {
        priceId = process.env.STRIPE_PRICE_ID_BASIC || process.env.STRIPE_PRICE_ID;
    } else {
        priceId = process.env.STRIPE_PRICE_ID_PRO || process.env.STRIPE_PRICE_ID;
    }

    if (!priceId) priceId = 'price_12345_mock';


    const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/`,
        customer_email: email,
        metadata: {
            preferred_locale: locale,
            preferred_currency: currency
        }
    });

    // Insert "Pending" subscriber
    try {
        await db.insert(subscribers).values({
            email: email,
            stripeId: session.id,
            active: false,
            currency: currency,
            locale: locale
        }).onConflictDoUpdate({
            target: subscribers.email,
            set: { stripeId: session.id, currency, locale } // Update pending session
        });
    } catch (e) {
        console.error("Failed to record basic subscriber info", e);
    }

    if (session.url) {
        // Stripe Checkout URL already contains session ID but we can ensure email is prefilled if session config allows
        // The customer_email parameter in session creation handles the prefilling logic automatically on Stripe's side
        redirect(session.url);
    }
}
