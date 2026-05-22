"use client";

import { useEffect, useState } from "react";
import { PageIntro, StubPage } from "@/components/ui";
import CurvePlot from "@/components/CurvePlot";

type PriceEntry = {
  key: string;
  last: number;
  change: number | null;
  settle: number | null;
};

export default function WatchlistPage() {
  const [prices, setPrices] = useState<PriceEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        let entries: PriceEntry[] = [];
        if (Array.isArray(data)) {
          entries = data.map((item: any, i: number) => ({
            key: item.key ?? `row-${i}`,
            last: Number(item.last ?? item.price ?? item.outright ?? 0),
            change: item.change ?? null,
            settle: item.settle ?? null,
          }));
        } else if (data && typeof data === "object") {
          entries = Object.entries(data).map(([key, value]) => {
            if (typeof value === "number") {
              return { key, last: value, change: null, settle: null };
            }
            const record = value as Record<string, unknown>;
            return {
              key,
              last: Number(record.last ?? record.price ?? record.outright ?? 0),
              change: typeof record.change === "number" ? record.change : null,
              settle: typeof record.settle === "number" ? record.settle : null,
            };
          });
        }
        setPrices(entries || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
      });
    return () => {
      mounted = false;
    };
  }, []);

  const points = (prices || [])
    .map((p) => ({
      label: p.key,
      price: p.last,
    }))
    .filter((x) => Number.isFinite(x.price));

  return (
    <>
      <PageIntro>What you&apos;re watching. What must happen before you act.</PageIntro>

      <StubPage
        icon="◓"
        title="Watchlist Engine"
        phase="Phase 2"
        text="Assets on radar with thesis and trigger conditions. For CL: specific spread levels, fly curvature setups, outright areas of interest."
      />

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Curve Shapes</h2>

        <div style={{ marginBottom: 12 }}>
          <strong>Live outrights</strong>
        </div>

        {error && <div style={{ color: "#b91c1c" }}>Error: {error}</div>}

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ minWidth: 280 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Anchor</th>
                  <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {prices === null && (
                  <tr>
                    <td colSpan={2} style={{ padding: 8 }}>Loading…</td>
                  </tr>
                )}
                {prices && prices.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ padding: 8 }}>No price data available</td>
                  </tr>
                )}
                {prices && prices.map((p) => {
                  const priceText = Number.isFinite(p.last) ? p.last.toFixed(2) : "—";
                  return (
                    <tr key={p.key}>
                      <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{p.key}</td>
                      <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f3f4f6" }}>{priceText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1, display: "grid", gap: 12 }}>
            <div style={{ height: 140, background: "#f9fafb", border: "1px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {points.length > 0 ? (
                <div style={{ width: "100%", maxWidth: 640 }}>
                  <CurvePlot points={points} />
                </div>
              ) : (
                <div>Overlay chart placeholder (outright)</div>
              )}
            </div>
            <div style={{ height: 140, background: "#f9fafb", border: "1px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {points.length > 0 ? (
                <div style={{ width: "100%", maxWidth: 640 }}>
                  <CurvePlot points={points} />
                </div>
              ) : (
                <div>Overlay chart placeholder (curve shape)</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
