import { getAllStrategies, type TaxonomyStrategy } from "@/lib/taxonomy";

export type PriceRecord = {
    last: number;
    change: number | null;
    settle: number | null;
    updated_at: string;
};

export type LivePrices = Record<string, number | PriceRecord>;

export function normalizePriceKey(key: string): string {
    return key.trim().toUpperCase();
}

export function buildOutrightPriceKey(product: string, anchorMonth: string): string {
    return normalizePriceKey(`${product} ${anchorMonth}`);
}

export function buildInstrumentPriceKey(instrument: string): string {
    return normalizePriceKey(instrument);
}

export function getPriceFromMap(key: string, prices: LivePrices): number | undefined {
    const item = prices[normalizePriceKey(key)];
    if (item === undefined) return undefined;
    if (typeof item === "number") return item;
    return item.last;
}

export function parseInstrumentLabel(instrument: string) {
    const trimmed = instrument.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) return null;

    const product = parts[0];
    const anchorMonth = parts[1];
    const strategyId = parts.length > 2 ? parts.slice(2).join(" ") : "";

    return {
        product,
        anchorMonth,
        strategyId,
        fullLabel: trimmed,
    };
}

export function parseStrategyId(strategyId: string) {
    const cleaned = strategyId.trim().toUpperCase();
    if (!cleaned) return { symbol: "", step: 1, canonicalId: "" };

    const digitsMatch = cleaned.match(/^(\d+)(?:M)?([A-Z]+)/);
    if (digitsMatch) {
        const step = Number(digitsMatch[1]) || 1;
        const symbol = digitsMatch[2];
        const canonicalId = step === 1 ? symbol : cleaned;
        return { symbol, step, canonicalId };
    }

    return { symbol: cleaned, step: 1, canonicalId: cleaned };
}

export function addMonthsToAnchor(anchorMonth: string, offset: number) {
    const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
    ];

    const match = anchorMonth.toUpperCase().match(/^([A-Z]{3})(\d{2,4})$/);
    if (!match) return null;

    const month = monthNames.indexOf(match[1]);
    if (month === -1) return null;

    const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
    const absolute = year * 12 + month + offset;
    const outYear = Math.floor(absolute / 12);
    const outMonth = absolute % 12;
    return `${monthNames[outMonth]}${String(outYear).slice(-2)}`;
}

export function getStrategyVector(strategyId: string, strategies: TaxonomyStrategy[]) {
    const parsed = parseStrategyId(strategyId);
    if (!parsed.symbol) return null;

    const strategy = strategies.find((s) => s.id.toUpperCase() === parsed.symbol.toUpperCase());
    if (!strategy) return null;

    return {
        strategy,
        step: parsed.step,
        symbol: parsed.symbol,
        canonicalId: parsed.canonicalId,
    };
}

export function deriveInstrumentPrice(
    instrumentLabel: string,
    prices: LivePrices,
    strategies: TaxonomyStrategy[]
): number | undefined {
    const parsed = parseInstrumentLabel(instrumentLabel);
    if (!parsed) return undefined;
    if (!parsed.strategyId) return getPriceFromMap(parsed.fullLabel, prices);

    const strategyMeta = getStrategyVector(parsed.strategyId, strategies);
    if (!strategyMeta) return undefined;

    const { strategy, step } = strategyMeta;
    const legs = strategy.legs;
    const outrights: number[] = [];

    for (let i = 0; i < legs.length; i++) {
        const monthKey = addMonthsToAnchor(parsed.anchorMonth, i * step);
        if (!monthKey) return undefined;
        const price = getPriceFromMap(buildOutrightPriceKey(parsed.product, monthKey), prices);
        if (price === undefined) return undefined;
        outrights.push(price);
    }

    return legs.reduce((sum, coefficient, index) => sum + coefficient * outrights[index], 0);
}

export function getLivePriceForTrade(
    tradeInstrument: string,
    product: string,
    prices: LivePrices,
    strategies: TaxonomyStrategy[]
) {
    const directPrice = getPriceFromMap(tradeInstrument, prices);
    if (directPrice !== undefined) return directPrice;

    const parsed = parseInstrumentLabel(tradeInstrument);
    // Only fall back to outright lookup when there is no strategy suffix — if there
    // is one (e.g. "1ms", "1MD") we must derive the price, not return the anchor leg.
    if (parsed && parsed.product && parsed.anchorMonth && !parsed.strategyId) {
        const outrightPrice = getPriceFromMap(buildOutrightPriceKey(parsed.product, parsed.anchorMonth), prices);
        if (outrightPrice !== undefined) return outrightPrice;
    }

    return deriveInstrumentPrice(tradeInstrument, prices, strategies);
}

export async function loadPricingStrategies() {
    return getAllStrategies();
}
