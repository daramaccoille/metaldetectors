import { AnalysisResult, MarketData } from '../types';
import { formatMetalPrice, SupportedCurrency, SupportedLocale } from '../utils/format';

function getStyles() {
    return `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #111827; margin: 0; padding: 0; color: #F3F4F6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1F2937; padding: 20px; border-radius: 8px; border: 1px solid #374151; }
    .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
    .title { color: #D4AF37; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
    .subtitle { color: #9CA3AF; margin: 5px 0 0; font-size: 14px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .metal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .metal-name { font-size: 20px; font-weight: bold; color: #F3F4F6; }
    .badge { padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: white; }
    .badge-buy { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
    .badge-sell { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
    .badge-hold { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; font-size: 14px; color: #E5E7EB; }
    .price-value { font-size: 18px; font-weight: bold; color: #F3F4F6; }
    .ai-box { background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; padding: 12px; font-style: italic; font-size: 14px; color: #D1FAE5; }
    .footer { text-align: center; color: #6B7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #374151; padding-top: 20px; }
    .link { color: #6B7280; text-decoration: underline; margin: 0 5px; }
    `;
}

// PRO TEMPLATE
export function generateProEmailHtml(
    analysis: AnalysisResult,
    marketData: Record<string, MarketData>,
    currency: SupportedCurrency,
    locale: SupportedLocale,
    fxRates: Record<string, number>
): string {
    const today = new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let cards = '';

    for (const [metal, data] of Object.entries(analysis) as [string, any][]) {
        const targetPriceUSD = data.target_price;
        const formattedPrice = formatMetalPrice(targetPriceUSD, fxRates[currency], currency, locale);
        const action = data.ai_guess.toLowerCase();

        let badgeClass = 'badge-hold';
        if (action.includes('buy')) badgeClass = 'badge-buy';
        if (action.includes('sell') || action.includes('short')) badgeClass = 'badge-sell';

        const rsi = (marketData as any)[metal]?.rsi?.toFixed(0) ?? 'N/A';
        const trend = (marketData as any)[metal]?.trend === 'up' ? 'Bullish ↗' : ((marketData as any)[metal]?.trend === 'down' ? 'Bearish ↘' : 'Neutral →');

        cards += `
        <div class="card">
            <div class="metal-header">
                <span class="metal-name">${metal}</span>
                <span class="badge ${badgeClass}">${data.ai_guess}</span>
            </div>
            <div class="data-grid">
                <div>Target: <span class="price-value">${formattedPrice}</span></div>
                <div>RSI: ${rsi}</div>
                <div style="grid-column: span 2;">Trend: ${trend}</div>
            </div>
            <div class="ai-box">
                " ${data.reasoning} "
            </div>
        </div>
        `;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>${getStyles()}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">MetalDetectors Daily</h1>
                <p class="subtitle">High-Conviction AI Signals • ${today}</p>
            </div>
            
            <div style="margin-bottom: 25px; padding: 15px; background: rgba(0,0,0,0.2); border-left: 4px solid #D4AF37; color: #D1D5DB; font-size: 14px;">
                <strong>Market Pulse:</strong> Global volatility is creating opportunities. See today's AI-curated picks below.
            </div>

            ${cards}

            <div class="footer">
                <p>Not financial advice. Trading involves risk.</p>
                <p>
                    <a href="https://metaldetectors.info/account" class="link">Manage Account</a> | 
                    <a href="https://metaldetectors.info/unsubscribe" class="link">Unsubscribe</a>
                </p>
                <p>© 2026 MetalDetectors Inc.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// BASIC TEMPLATE (XAG Only)
export function generateBasicEmailHtml(
    analysis: AnalysisResult,
    marketData: Record<string, MarketData>,
    currency: SupportedCurrency,
    locale: SupportedLocale,
    fxRates: Record<string, number>
): string {
    const today = new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const metal = 'XAG';

    // Safety check if XAG is missing
    if (!analysis[metal]) {
        // Fallback to Pro template if XAG missing (unlikely but safe)
        // Note: passing analysis as any here if strict types complain, but they are same type
        return generateProEmailHtml(analysis, marketData, currency, locale, fxRates);
    }

    const data = analysis[metal];
    const targetPriceUSD = data.target_price;
    const formattedPrice = formatMetalPrice(targetPriceUSD, fxRates[currency], currency, locale);
    const rsi = (marketData as any)[metal]?.rsi?.toFixed(0) ?? 'N/A';

    // Basic Style Overrides
    const basicStyles = `
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 0; color: #1F2937; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 0; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden; }
        .header { background: #1F2937; padding: 20px; text-align: center; }
        .title { color: #E5E7EB; margin: 0; font-size: 20px; }
        .date { color: #9CA3AF; font-size: 12px; margin-top: 5px; }
        .content { padding: 30px 20px; text-align: center; }
        .metal-card { border: 2px solid #3B82F6; border-radius: 12px; padding: 25px; background: #EEF2FF; margin-bottom: 30px; }
        .big-price { font-size: 36px; font-weight: 800; color: #1F2937; margin: 10px 0; }
        .trend-arrow { color: #3B82F6; font-weight: bold; font-size: 18px; }
        .cta-box { background: linear-gradient(135deg, #111827 0%, #374151 100%); color: white; padding: 25px; text-align: center; border-radius: 0 0 8px 8px; }
        .btn { background: #D4AF37; color: #111827; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 10px; }
        .footer { text-align: center; color: #9CA3AF; font-size: 11px; padding: 20px; background: #F9FAFB; }
    `;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>${basicStyles}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="title">MetalDetectors <span style="font-weight:normal; color:#9CA3AF;">Basic</span></h1>
                <div class="date">${today}</div>
            </div>
            
            <div class="content">
                <div class="metal-card">
                    <h2 style="margin:0; color:#4B5563; text-transform:uppercase; font-size:14px; letter-spacing:1px;">Silver (XAG) Snapshot</h2>
                    <div class="big-price">${formattedPrice}</div>
                    <div class="trend-arrow">RSI: ${rsi}</div>
                    <p style="color:#6B7280; font-size:14px; line-height:1.5; margin-top:15px;">
                        ${data.reasoning}
                    </p>
                </div>
            </div>

            <div class="cta-box">
                <h3 style="margin:0 0 10px 0; color:#F3F4F6;">Missed Gold & AI Picks?</h3>
                <p style="margin:0 0 20px 0; color:#D1D5DB; font-size:14px;">Upgrade to Pro to unlock signals for XAU, Cu, Pt, and Pd.</p>
                <a href="https://metaldetectors.info" class="btn">Upgrade to Pro ($5/mo)</a>
            </div>

            <div class="footer">
                <a href="https://metaldetectors.info/unsubscribe" style="color:#9CA3AF;">Unsubscribe</a>
            </div>
        </div>
    </body>
    </html>
    `;
}
