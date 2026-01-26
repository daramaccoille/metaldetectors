
export type SupportedLocale = 'en-US' | 'de-DE' | 'fr-FR' | 'en-GB';
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP';

export function formatMetalPrice(
    priceUSD: number,
    fxRate: number,
    currency: SupportedCurrency,
    locale: SupportedLocale
) {
    const convertedPrice = priceUSD * fxRate;

    // We round to the nearest whole unit as requested (€1, £1, $1)
    const roundedPrice = Math.round(convertedPrice);

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0, // Forces rounding to whole number
    }).format(roundedPrice);
}
