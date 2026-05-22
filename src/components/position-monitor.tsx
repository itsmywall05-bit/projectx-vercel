"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllStrategies, type TaxonomyStrategy } from "@/lib/taxonomy";
import { addMonthsToAnchor, buildOutrightPriceKey, getPriceFromMap } from "@/lib/pricing";

type Trade = {
    id: string;
    product: string;
    instrument: string;
    size_contracts: number;
    strategy?: string | null;
};

export default function PositionMonitor({ fetchInterval = 3000 }: { fetchInterval?: number }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [strategies, setStrategies] = useState<TaxonomyStrategy[]>([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const r = await fetch(`/api/trades`);
                const td = await r.json();
                if (!mounted) return;
                setTrades(Array.isArray(td) ? td : []);
            } catch {
                if (!mounted) return;
            }
            try {
                const r2 = await fetch(`/api/prices`);
                const pd = await r2.json();
                if (!mounted) return;
                setPrices(pd || {});
            } catch { }
        };
        load();
        const id = setInterval(load, fetchInterval);
        getAllStrategies().then((s) => setStrategies(s));
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [fetchInterval]);

    const exposures = useMemo(() => {
        const map: Record<string, number> = {};

        trades.filter((t) => !t.instrument.includes("EXIT")).forEach((t) => {
            const size = Number(t.size_contracts) || 0;
            const stratId = (t.strategy || "").toString().trim();
            // Try to resolve strategy legs from catalog
            const strat = strategies.find((s) => s.id.toUpperCase() === stratId.toUpperCase());
            if (!strat || !Array.isArray(strat.legs) || strat.legs.length === 0) {
                // fallback: attribute whole size to the trade's anchor month outright if present
                const parts = t.instrument?.split(/\s+/) ?? [];
                if (parts.length >= 2) {
                    const key = buildOutrightPriceKey(parts[0], parts[1]);
                    map[key] = (map[key] || 0) + size;
                }
                return;
            }

            // Map legs across anchor months starting from trade anchor
            const parts = t.instrument?.split(/\s+/) ?? [];
            const product = parts[0];
            const anchor = parts[1];
            if (!product || !anchor) return;

            for (let i = 0; i < strat.legs.length; i++) {
                const month = addMonthsToAnchor(anchor, i);
                if (!month) continue;
                const key = buildOutrightPriceKey(product, month);
                map[key] = (map[key] || 0) + strat.legs[i] * size;
            }
        });

        return map;
    }, [trades, strategies]);

    const rows = Object.entries(exposures).sort((a, b) => a[0].localeCompare(b[0]));

    if (rows.length === 0) return null;

    return (
        <section className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Position Monitor (spread-normalised)</h3>
            <div className="bg-bg3 border rounded p-3">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-muted text-xs">
                            <th className="text-left">Anchor</th>
                            <th className="text-right">Net Contracts</th>
                            <th className="text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(([k, v]) => (
                            <tr key={k} className="border-t border-border">
                                <td className="py-2">{k}</td>
                                <td className="py-2 text-right font-semibold">{v.toFixed(2)}</td>
                                <td className="py-2 text-right">{(getPriceFromMap(k, prices) ?? "—")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
