
# Deployment Troubleshooting & Guide

## 1. 🚨 Fixing the "No Next.js version detected" Error
This error happens because Cloudflare Pages looks for `package.json` in the **root** of your repository (`MetalDetectors/`), but your Next.js app is inside the `web/` folder.

**Solution:**
1. Go to **Cloudflare Dashboard** > **Workers & Pages**.
2. Select your Pages project.
3. Go to **Settings** > **Build & deployments**.
4. Click **Edit configuration**.
5. Change **Root Directory** (or "Framework Preset") to: `web`
6. Save and **Retry deployment**.

## 2. ⚠️ The "Deprecated next-on-pages" Warning
Cloudflare is transitioning to `OpenNext`. The warning is annoying but usually **safe to ignore** for now if your app builds. 
## 4. Environment Variables Checklist (CRITICAL)

### **A. Frontend (Cloudflare Pages)**
These handle the **Website**, **Sign Up**, and **Subscription Management**.
Go to: **Stats (Settings) > Environment variables > Production**

| Variable | Value Hint |
| :--- | :--- |
| `NEXT_PUBLIC_URL` | `https://metaldetectors.online` |
| `DATABASE_URL` | `postgresql://...` (Neon DB) |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PRICE_ID_BASIC` | `price_1Su...` (The $1 Price ID) |
| `STRIPE_PRICE_ID_PRO` | `price_1Su...` (The $5 Price ID) |
| `RESEND_API_KEY` | `re_...` (For 'Manage Subscription' emails) |

### **B. Backend (Cloudflare Worker)**
This handles **Daily Email Sending** and **AI Analysis**.
These must be set via `npx wrangler secret put KEY` inside the `worker/` folder.

| Secret Name | Value Hint |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://...` (Same as Frontend) |
| `FMP_API_KEY` | `...` |
| `GEMINI_API_KEY` | `...` |
| `RESEND_API_KEY` | `re_...` (For Daily Digest emails) |

### **C. Local Development (`.env.local`)**
This is for `npm run dev` on your machine.
Ensure `web/.env.local` contains ALL the variables from Section A!
