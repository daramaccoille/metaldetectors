/**
 * Lightweight, edge-compatible technical indicators.
 * Replaces the heavy 'technicalindicators' library to keep worker bundle size tiny.
 */

export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length <= period) return [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsi: number[] = [];
  
  // We don't strictly need the whole history, just the current one
  // but let's provide a similar interface to the library
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    
    if (avgLoss === 0) rsi.push(100);
    else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
}

export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number, middle: number, lower: number }[] {
  if (prices.length < period) return [];

  const results = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const middle = slice.reduce((a, b) => a + b, 0) / period;
    
    const variance = slice.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / period;
    const deviation = Math.sqrt(variance);
    
    results.push({
      upper: middle + (deviation * stdDev),
      middle: middle,
      lower: middle - (deviation * stdDev)
    });
  }

  return results;
}
