
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

// Renamed from subscribe to startCheckoutSession to reflect it returns a URL rather than redirecting directly
export async function startCheckoutSession(formData: FormData) {
    const email = formData.get('email') as string;
    // 'plan' can be 'basic' or 'pro' (defaulting to pro if not specified)
    const plan = formData.get('plan') as string || 'pro';

    if (!email) return { error: "Email is required" };

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
        // We won't crash, just treat as new user (no existing customer ID)
        // But this implies DB might be broken
    }

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
        console.error("\n❌ STRIPE ERROR:", err.message);

        // DEBUG: List available prices to help User fix .env
        try {
            console.log("\n🔍 DIAGNOSING CONFIGURATION...");
            const account = await stripe.accounts.retrieve();
            console.log(`Checking prices for Stripe Account ID: ${account.id}`);

            const prices = await stripe.prices.list({ limit: 10, active: true });
            console.log("\n✅ VALID PRICES FOUND IN THIS ACCOUNT:");
            if (prices.data.length === 0) {
                console.log("   (No active prices found. Please create a Product & Price in this Stripe Dashboard)");
            }
            prices.data.forEach(p => {
                const product = typeof p.product === 'string' ? p.product : p.product.id;
                console.log(`   👉 ID: ${p.id}  |  ${p.unit_amount ? p.unit_amount / 100 : 0} ${p.currency.toUpperCase()}`);
            });
            console.log("\n⚠️ IF YOUR ID IS NOT ABOVE, IT IS FROM A DIFFERENT ACCOUNT (OR LIVE/TEST MISMATCH).");
            console.log("   Please update .env.local with one of the IDs above, or switch your STRIPE_SECRET_KEY.\n");

        } catch (listErr) {
            console.error("Could not list prices (Key might be invalid):", listErr);
        }

        // Return error object instead of throwing hard error (which causes 500)
        return { error: `Stripe Config Error: ${err.message}` };
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

        console.log("Subscriber record created/updated successfully.");

    } catch (e: any) {
        console.error("FATAL: Failed to record subscriber info in DB", e);
        // Return friendly error
        return { error: `Database Error: ${e.message}` };
    }

    if (session.url) {
        // Return URL for client-side redirection
        return { url: session.url };
    }

    return { error: "Failed to create checkout session URL" };
}

import { Resend } from 'resend';
import { eq } from 'drizzle-orm';

// Remove global init to prevent crash if key is missing
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function manageSubscription(formData: FormData) {
    const resend = new Resend(process.env.RESEND_API_KEY);

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
