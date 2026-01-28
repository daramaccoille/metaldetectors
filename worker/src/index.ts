
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { subscribers, digests } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { getMetalAnalysis } from './ai/gemini';
import { formatMetalPrice, SupportedCurrency, SupportedLocale } from './utils/format';
import { sendEmail } from './utils/email';
import { fetchMarketData } from './utils/market';
import { generateBasicEmailHtml, generateProEmailHtml } from './templates/daily-digest';
import { MarketData } from './types';

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

		// Archive today's digest
		try {
			const todayStr = new Date().toISOString().split('T')[0];
			const archiveHtml = generateProEmailHtml(analysis, marketData, 'USD', 'en-US', fxRates);

			await db.insert(digests).values({
				date: todayStr,
				contentHtml: archiveHtml
			}).onConflictDoNothing();

			console.log("Archived digest for", todayStr);
		} catch (e) {
			console.error("Failed to archive digest:", e);
		}

		// Fetch all active subscribers
		const activeSubscribers = await db.select().from(subscribers).where(eq(subscribers.active, true));

		console.log(`Found ${activeSubscribers.length} active subscribers.`);

		// 4. Send Emails
		const results = await Promise.allSettled(activeSubscribers.map(async (sub) => {
			const currency = (sub.currency || 'USD') as SupportedCurrency;
			const locale = (sub.locale || 'en-US') as SupportedLocale;

			// Format Content using Templates
			let emailHtml;

			if (sub.plan === 'basic') {
				emailHtml = generateBasicEmailHtml(analysis, marketData, currency, locale, fxRates);
			} else {
				// Default to Pro
				emailHtml = generateProEmailHtml(analysis, marketData, currency, locale, fxRates);
			}

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
