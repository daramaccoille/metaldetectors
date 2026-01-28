
'use server'

import { redirect } from 'next/navigation';
// import Stripe from 'stripe'; // REMOVED to save 1.5MB
import { db } from '@/drizzle/db';
import { subscribers } from '@/drizzle/schema';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { createCheckoutSession, createPortalSession } from './stripe-lite';

export async function startCheckoutSession(formData: FormData) {
    const email = formData.get('email') as string;
    // 'plan' can be 'basic' or 'pro' (defaulting to pro if not specified)
    const plan = formData.get('plan') as string || 'pro';

    if (!email) return { error: "Email is required" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Invalid email format" };
    }

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
    let priceId = process.env.STRIPE_PRICE_ID_PRO;

    if (plan === 'basic') {
        priceId = process.env.STRIPE_PRICE_ID_BASIC;
    } else {
        priceId = process.env.STRIPE_PRICE_ID_PRO;
    }

    if (!priceId) priceId = 'price_12345_mock';

    // Check if user already exists to prevent duplicate customers
    let existingUser;
    try {
        console.log("Checking DB for existing user...");
        existingUser = await db.query.subscribers.findFirst({
            where: eq(subscribers.email, email)
        });
        console.log("DB Check Complete. Found:", !!existingUser);
    } catch (dbError: any) {
        console.error("DB Check Failed:", dbError.message);
    }

    // Debugging
    console.log("Stripe Key Present:", !!process.env.STRIPE_SECRET_KEY);
    console.log("Price ID (Basic):", !!process.env.STRIPE_PRICE_ID_BASIC);

    if (!priceId || priceId.includes('mock')) {
        console.error("CRITICAL: Invalid Price ID. Check Cloudflare Environment Variables.");
    }

    let session;
    try {
        session = await createCheckoutSession(
            process.env.STRIPE_SECRET_KEY || '',
            {
                priceId,
                successUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/`,
                customerEmail: existingUser?.stripeCustomerId ? undefined : email,
                customerId: existingUser?.stripeCustomerId || undefined,
                metadata: {
                    preferred_locale: locale,
                    preferred_currency: currency,
                    plan_type: plan
                }
            }
        );
    } catch (err: any) {
        console.error("\n❌ STRIPE ERROR:", err.message);
        return { error: `Stripe Config Error: ${err.message}` };
    }

    // Insert "Pending" subscriber
    try {
        await db.insert(subscribers).values({
            email: email,
            stripeId: session.id, // session.id is available in the response too
            active: false,
            currency: currency,
            locale: locale,
            plan: plan
        }).onConflictDoUpdate({
            target: subscribers.email,
            set: { stripeId: session.id, currency, locale, plan } // Update pending session
        });

        console.log("Subscriber record created/updated successfully.");

    } catch (e: any) {
        console.error("FATAL: Failed to record subscriber info in DB", e);
        return { error: `Database Error: ${e.message}` };
    }

    if (session.url) {
        return { url: session.url };
    }

    return { error: "Failed to create checkout session URL" };
}

export async function manageSubscription(formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) return;

    // 1. Look up user
    const user = await db.query.subscribers.findFirst({
        where: eq(subscribers.email, email)
    });

    if (!user || !user.stripeCustomerId) {
        console.log(`Manage request for unknown or non-customer email: ${email}`);
        redirect('/account?sent=true');
        return;
    }

    // 2. Create Portal Session
    let portalSession;
    try {
        portalSession = await createPortalSession(
            process.env.STRIPE_SECRET_KEY || '',
            user.stripeCustomerId,
            `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/account`
        );
    } catch (e: any) {
        console.error("Stripe Portal Error:", e.message);
        redirect('/account?error=stripe_error');
        return;
    }

    // 3. Send Email using fetch (Edge Compatible)
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
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
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Resend API Error: ${res.status} ${errorText}`);
        }
    } catch (e) {
        console.error("Resend Error:", e);
        redirect('/account?error=email_failed');
    }

    redirect('/account?sent=true');
}
