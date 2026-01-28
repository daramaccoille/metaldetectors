
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
// import Stripe from 'stripe'; // REMOVED
import { db } from '@/drizzle/db';
import { subscribers } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyStripeSignature } from '@/app/stripe-lite';

export const runtime = 'edge';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is missing');
    }

    // Manual verification using Edge Crypto API
    event = await verifyStripeSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (error: any) {
    console.error(`Webhook signature verification failed:`, error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`Processing checkout session ${session.id}`);

      // Update subscriber active status
      // We rely on the session.id being stored in the stripeId column during the initial subscribe action
      try {
        await db.update(subscribers)
          .set({
            active: true,
            stripeCustomerId: session.customer as string
          })
          .where(eq(subscribers.stripeId, session.id));
        console.log(`Activated subscriber with session ID: ${session.id}`);
      } catch (err) {
        console.error('Error updating subscriber:', err);
        return new NextResponse('Database Request Failed', { status: 500 });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}

// Add GET handler for easy browser testing/pinging
export async function GET(req: Request) {
  return new NextResponse('Stripe Webhook Endpoint is Live ⚡️', { status: 200 });
}
