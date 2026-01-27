
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



    // Check if user already exists to prevent duplicate customers
    const existingUser = await db.query.subscribers.findFirst({
        where: eq(subscribers.email, email)
    });

    let customerParam = {};
    if (existingUser?.stripeCustomerId) {
        customerParam = { customer: existingUser.stripeCustomerId };
    } else {
        customerParam = { customer_email: email };
    }

    // Debugging: Log (safely) if keys are present
    console.log("Stripe Key Present:", !!process.env.STRIPE_SECRET_KEY);
    console.log("Price ID (Basic):", !!process.env.STRIPE_PRICE_ID_BASIC, process.env.STRIPE_PRICE_ID_BASIC);
    console.log("Price ID (Pro):", !!process.env.STRIPE_PRICE_ID_PRO, process.env.STRIPE_PRICE_ID_PRO);
    console.log("Selected Plan:", plan);
    console.log("User Email:", email);

    if (!priceId || priceId.includes('mock')) {
        console.error("CRITICAL: Invalid Price ID. Check Cloudflare Environment Variables.");
        // We might want to throw here or return an error state, but let's see logic flow
    }

    let session;
    try {
        session = await stripe.checkout.sessions.create({
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/`,
            ...customerParam,
            metadata: {
                preferred_locale: locale,
                preferred_currency: currency,
                plan_type: plan
            }
        });
    } catch (err: any) {
        console.error("Stripe Session Creation Failed:", err.message);
        throw new Error(`Stripe Config Error: ${err.message}`);
    }

    // Insert "Pending" subscriber
    try {
        await db.insert(subscribers).values({
            email: email,
            stripeId: session.id,
            active: false,
            currency: currency,
            locale: locale,
            plan: plan
        }).onConflictDoUpdate({
            target: subscribers.email,
            set: { stripeId: session.id, currency, locale, plan } // Update pending session
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

import { Resend } from 'resend';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function manageSubscription(formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) return;

    // 1. Look up user
    const user = await db.query.subscribers.findFirst({
        where: eq(subscribers.email, email)
    });

    if (!user || !user.stripeCustomerId) {
        // For security, don't reveal if user exists or not, but maybe log it
        console.log(`Manage request for unknown or non-customer email: ${email}`);
        redirect('/account?sent=true'); // Pretend we sent it
        return;
    }

    // 2. Create Portal Session
    let portalSession;
    try {
        portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/account`,
        });
    } catch (e: any) {
        console.error("Stripe Portal Error:", e.message);
        // If customer ID is invalid (deleted in Stripe but not DB), catch here
        redirect('/account?error=stripe_error');
        return;
    }

    // 3. Send Email
    try {
        await resend.emails.send({
            from: 'MetalDetectors Accounts <accounts@metaldetectors.online>',
            to: email,
            subject: 'Manage your MetalDetectors Subscription',
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1>Manage Your Subscription</h1>
                    <p>Click the link below to upgrade, downgrade, or cancel your plan.</p>
                    <p>
                        <a href="${portalSession.url}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            Go to Customer Portal
                        </a>
                    </p>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">
                        If you didn't request this, you can ignore this email.
                    </p>
                </div>
            `
        });
    } catch (e) {
        console.error("Resend Error:", e);
        redirect('/account?error=email_failed');
    }

    redirect('/account?sent=true');
}
