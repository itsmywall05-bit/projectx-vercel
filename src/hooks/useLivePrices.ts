"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllStrategies, type TaxonomyStrategy } from "@/lib/taxonomy";
import {
    getLivePriceForTrade,
    normalizePriceKey,
    type PriceRecord,
} from "@/lib/pricing";

export type RawPrices = Record<string, number | PriceRecord>;

export interface LivePricesResult {
    /** Raw price map keyed by normalized price_key */
    rawPrices: RawPrices;
    /** Flat number map — all keys normalized to uppercase */
    prices: Record<string, number>;
    strategies: TaxonomyStrategy[];
    /** Derive the live price for any instrument label (handles outrights, spreads, flies) */
    getInstrumentPrice: (instrument: string, product?: string) => number | undefined;
    /** True once at least one price snapshot has loaded */
    isLive: boolean;
}

/**
 * Polls /api/prices on `intervalMs` and derives instrument prices
 * from outright leg coefficients defined in the Taxonomy.
 *
 * Usage:
 *   const { getInstrumentPrice, isLive } = useLivePrices();
 *   const mark = getInstrumentPrice("CL Jul26 1MS", "CL");
 */
export function useLivePrices(intervalMs = 3000): LivePricesResult {
    const [rawPrices, setRawPrices] = useState<RawPrices>({});
    const [strategies, setStrategies] = useState<TaxonomyStrategy[]>([]);
    const [isLive, setIsLive] = useState(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    // Load taxonomy once
    useEffect(() => {
        getAllStrategies().then((s) => { if (mounted.current) setStrategies(s); });
    }, []);

    // Poll prices
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        async function poll() {
            try {
                const res = await fetch("/api/prices");
                if (res.ok) {
                    const data = await res.json();
                    if (mounted.current) {
                        setRawPrices(data ?? {});
                        setIsLive(true);
                    }
                }
            } catch { /* network error — keep last known prices */ }
            if (mounted.current) timer = setTimeout(poll, intervalMs);
        }

        poll();
        return () => clearTimeout(timer);
    }, [intervalMs]);

    // Normalize to flat number map (dual-keyed: symbol + product+month)
    const prices = useMemo(() => {
        const out: Record<string, number> = {};
        Object.entries(rawPrices).forEach(([key, value]) => {
            out[normalizePriceKey(key)] = typeof value === "number" ? value : value.last;
        });
        return out;
    }, [rawPrices]);

    const getInstrumentPrice = useCallback(
        (instrument: string, product = ""): number | undefined => {
            return getLivePriceForTrade(instrument, product, prices, strategies);
        },
        [prices, strategies],
    );

    return { rawPrices, prices, strategies, getInstrumentPrice, isLive };
}
