
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
If fixing the Root Directory (above) gets your site online, you can stick with `next-on-pages` for now.

## 3. Deployment Checklist

### Frontend (Cloudflare Pages)
- [ ] **Repo Connected**: GitHub repo connected to Cloudflare Pages.
- [ ] **Root Directory**: Set to `web`.
- [ ] **Build Command**: `npx @cloudflare/next-on-pages@latest`
- [ ] **Output Directory**: `.vercel/output/static`
- [ ] **Environment Variables**: Add these in **Settings > Environment variables**:
  - `NEXT_PUBLIC_URL`: `https://metaldetectors.info` (or your pages.dev URL)
  - `STRIPE_SECRET_KEY`: `sk_live_...`
  - `STRIPE_PRICE_ID_PRO`: `price_...` (Pro Plan)
  - `STRIPE_PRICE_ID_BASIC`: `price_...` (Basic Plan)
  - `STRIPE_WEBHOOK_SECRET`: `whsec_...` (from dashboard)
  - `RESEND_API_KEY`: `re_...` (for account management emails)
  - `DATABASE_URL`: `postgres://...` (Neon Connection String)

### Backend (Cloudflare Worker)
- [ ] **Deploy**: Run `npx wrangler deploy` from `worker/` directory.
- [ ] **Secrets**: Ensure production secrets are set:
  ```bash
  npx wrangler secret put DATABASE_URL
  npx wrangler secret put FMP_API_KEY
  npx wrangler secret put GEMINI_API_KEY
  npx wrangler secret put RESEND_API_KEY
  ```
