
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { subscribers } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { getMetalAnalysis } from './ai/gemini';
import { formatMetalPrice, SupportedCurrency, SupportedLocale } from './utils/format';
import { sendEmail } from './utils/email';
import { fetchMarketData, MarketData } from './utils/market';

export interface Env {
	DATABASE_URL: string;
	GEMINI_API_KEY: string;
	RESEND_API_KEY: string;
	FMP_API_KEY: string;
	EXCHANGE_RATE_API_KEY?: string;
}

async function getAllMarketData(apiKey: string) {
	const metals = ['XAU', 'XAG', 'Cu', 'Pt', 'Pd'];
	const data: Record<string, MarketData> = {};

	// Fetch in parallel
	const results = await Promise.all(metals.map(metal => fetchMarketData(metal, apiKey)));

	metals.forEach((metal, i) => {
		data[metal] = results[i];
	});

	return data;
}

async function getFxRates() {
	// Mock FX rates if no API key
	// ideally fetch from https://api.exchangerate-api.com/v4/latest/USD
	return {
		USD: 1,
		EUR: 0.92,
		GBP: 0.79
	};
}

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log("Starting daily digest...");

		// 1. Get Data
		let marketData;
		try {
			marketData = await getAllMarketData(env.FMP_API_KEY);
		} catch (e) {
			console.error("Failed to fetch market data", e);
			// Could add mock fallback here if critical to send *something*
			return;
		}

		const fxRates = await getFxRates();

		// 2. AI Analysis
		let analysis;
		try {
			analysis = await getMetalAnalysis(env.GEMINI_API_KEY, marketData);
		} catch (e) {
			console.error("AI Analysis failed", e);
			return;
		}

		// 3. Fetch Active Subscribers
		const sql = neon(env.DATABASE_URL);
		const db = drizzle(sql);

		// Fetch all active subscribers
		const activeSubscribers = await db.select().from(subscribers).where(eq(subscribers.active, true));

		console.log(`Found ${activeSubscribers.length} active subscribers.`);

		// 4. Send Emails
		const results = await Promise.allSettled(activeSubscribers.map(async (sub) => {
			const currency = (sub.currency || 'USD') as SupportedCurrency;
			const locale = (sub.locale || 'en-US') as SupportedLocale;

			// Format Content
			let emailHtml = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="text-align: center; color: #D4AF37; margin-bottom: 24px;">MetalDetectors Daily</h1>
                <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 32px;">
                  High-conviction AI signals for ${new Date().toLocaleDateString(locale)}
                </p>
            `;

			for (const [metal, data] of Object.entries(analysis) as [string, any][]) {
				const targetPriceUSD = data.target_price;
				const formattedPrice = formatMetalPrice(targetPriceUSD, fxRates[currency], currency, locale);
				const color = data.ai_guess.toLowerCase().includes('buy') ? '#10B981' :
					data.ai_guess.toLowerCase().includes('sell') || data.ai_guess.toLowerCase().includes('short') ? '#EF4444' : '#F59E0B';

				emailHtml += `
                  <div style="margin-bottom: 16px; border: 1px solid #eee; padding: 16px; border-radius: 12px; background: #fafafa;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <h2 style="margin: 0; font-size: 18px;">${metal}</h2>
                      <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                        ${data.ai_guess}
                      </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                      <span>Target: <strong>${formattedPrice}</strong></span>
                      <span style="color: #666;">RSI: ${(marketData as any)[metal]?.rsi?.toFixed(0) ?? 'N/A'}</span>
                    </div>
                    <p style="margin: 0; font-style: italic; color: #555; font-size: 14px; line-height: 1.5;">"${data.reasoning}"</p>
                  </div>
                `;
			}

			emailHtml += `
              <div style="margin-top: 32px; text-align: center; font-size: 12px; color: #999;">
                <p>Not financial advice. Trading involves risk.</p>
                <p><a href="https://metaldetectors.info/unsubscribe" style="color: #999;">Unsubscribe</a></p>
              </div>
            </div>
            `;

			await sendEmail(env.RESEND_API_KEY, sub.email, `Daily Signals: ${Object.keys(analysis).join(', ')}`, emailHtml);
		}));

		// Log results
		const successes = results.filter(r => r.status === 'fulfilled').length;
		console.log(`Sent ${successes} emails.`);
	},

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			await this.scheduled({ cron: "manual", type: "scheduled", scheduledTime: Date.now() } as any, env, ctx);
			return new Response("Daily digest logic executed successfully. Check logs.", { status: 200 });
		} catch (e: any) {
			return new Response(`Error: ${e.message}\n${e.stack}`, { status: 500 });
		}
	}
};
