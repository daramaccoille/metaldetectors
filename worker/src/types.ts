
export interface MarketData {
    symbol: string;
    price: number;
    rsi: number;
    bb_status: 'above_high' | 'below_low' | 'within_range';
    trend: 'up' | 'down' | 'sideways';
    raw_history?: any[];
}

export interface MetalAnalysis {
    volatility: string;
    sentiment: string;
    trend: string;
    ai_guess: string;
    target_price: number;
    reasoning: string;
}

export type AnalysisResult = Record<string, MetalAnalysis>;
