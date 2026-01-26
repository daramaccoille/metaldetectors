
# MetalDetectors

This project contains the application code for MetalDetectors, a daily AI-driven metals trading signal service.

## Project Structure
- **web/**: Next.js 15 (App Router) frontend, styled with Glassmorphism (Vanilla CSS). Handles Landing Page, Stripe Subscriptions, and User Onboarding.
- **worker/**: Cloudflare Worker. Handles the 07:00 UTC daily cron job, fetching market data (mock/API), using Gemini 1.5 Flash for analysis, and sending localized emails via Resend.

## Quick Start

### 1. Environment Setup

**Frontend (`web/.env.local`):**
Create this file and add:
```bash
NEXT_PUBLIC_URL=http://localhost:3000 # or your production URL
DATABASE_URL=postgres://... # Your Neon connection string
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_ID=price_... # ID of the $5 monthly product
```

**Worker (`worker/.dev.vars`):**
Create this file for local development:
```bash
DATABASE_URL=postgres://...
GEMINI_API_KEY=...
RESEND_API_KEY=...
```

### 2. Database Setup via Drizzle
The schema is defined in `web/drizzle/schema.ts` (and duplicated in worker for simplicity).
To push to Neon:
```bash
cd web
npm run drizzle-kit push
```

### 3. Running Locally
**Frontend:**
```bash
cd web
npm run dev
```

**Worker (Test Cron):**
```bash
cd worker
npx wrangler dev
# In another terminal, trigger the cron manually:
curl "http://localhost:8787/__scheduled?cron=0+7+*+*+*"
```

## Deployment
1. **Frontend**: Deploy `web` directory to Cloudflare Pages.
2. **Backend**: 
   ```bash
   cd worker
   npx wrangler deploy
   ```
   Then set secrets:
   ```bash
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put GEMINI_API_KEY
   ```

### 4. Testing Stripe Webhooks Locally
1. Login to Stripe CLI:
   ```bash
   stripe login
   ```
2. Listen for events and forward to local app:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the "webhook signing secret" (whsec_...) from the CLI output.
4. Add it to `web/.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Trigger an event (or go through the UI flow):
   ```bash
   stripe trigger checkout.session.completed
   ```
