
import { RSI, BollingerBands } from 'technicalindicators';

export interface MarketData {
    symbol: string;
    price: number;
    rsi: number;
    bb_status: 'above_high' | 'below_low' | 'within_range';
    trend: 'up' | 'down' | 'sideways';
    raw_history?: any[]; // For debugging
}

// Helper to calculate technicals from raw close prices
export function calculateTechnicals(closes: number[], currentPrice: number): Partial<MarketData> {
    // RSI (14 period)
    const rsiInput = {
        values: closes,
        period: 14
    };
    const rsiValues = RSI.calculate(rsiInput);
    const currentRsi = rsiValues[rsiValues.length - 1] || 50;

    // Bollinger Bands (20 period, 2 stdDev)
    const bbInput = {
        period: 20,
        values: closes,
        stdDev: 2
    };
    const bbValues = BollingerBands.calculate(bbInput);
    const lastBB = bbValues[bbValues.length - 1];

    let bbStatus: MarketData['bb_status'] = 'within_range';
    if (lastBB) {
        if (currentPrice > lastBB.upper) bbStatus = 'above_high';
        else if (currentPrice < lastBB.lower) bbStatus = 'below_low';
    }

    // Simple Trend (Moving Average 50 vs 200 would be better, but let's use last 5 candles)
    const last5 = closes.slice(-5);
    const isUptrend = last5[4] > last5[0];

    return {
        rsi: currentRsi,
        bb_status: bbStatus,
        trend: isUptrend ? 'up' : 'down'
    };
}

// Real implementation using Financial Modeling Prep
// FMP Symbols: Gold (XAUUSD), Silver (XAGUSD), Copper (HGUSD), Platinum (PLUSD), Palladium (PAUSD)

const SYMBOL_MAP: Record<string, string> = {
    'XAU': 'XAUUSD',
    'XAG': 'XAGUSD',
    'Cu': 'HGUSD',
    'Pt': 'PLUSD',
    'Pd': 'PAUSD'
};

export async function fetchMarketData(symbol: string, apiKey: string): Promise<MarketData> {
    const fmpSymbol = SYMBOL_MAP[symbol] || symbol;

    // Fetch 4 Hour candles (enough for BB and RSI calculation)
    const url = `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${fmpSymbol}?apikey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${symbol}: ${response.statusText}`);
    }

    const data: any[] = await response.json();

    if (!Array.isArray(data) || data.length < 30) {
        console.warn(`Insufficient data for ${symbol}, using fallback`);
        // Fallback or error if insufficient data
        return {
            symbol,
            price: 2000,
            rsi: 50,
            bb_status: 'within_range',
            trend: 'sideways'
        };
    }

    // FMP returns newest first. We need oldest first for tech indicators.
    // Take last 50 periods
    const candles = data.slice(0, 50).reverse();
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];

    const technicals = calculateTechnicals(closes, currentPrice);

    return {
        symbol,
        price: currentPrice,
        rsi: technicals.rsi!,
        bb_status: technicals.bb_status!,
        trend: technicals.trend!
    };
}
