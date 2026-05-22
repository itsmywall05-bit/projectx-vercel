"use client";

import { useEffect, useState } from "react";
import { PageIntro, StubPage } from "@/components/ui";
import CurvePlot from "@/components/CurvePlot";

type PriceEntry = {
  month?: string;
  anchorMonth?: string;
  name?: string;
  price?: number;
  outright?: number;
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
        if (Array.isArray(data)) entries = data;
        else if (Array.isArray(data?.prices)) entries = data.prices;
        else if (data && typeof data === "object") {
          // try to coerce object shapes into an array
          const vals = Object.values(data).flat();
          entries = Array.isArray(vals) ? (vals as PriceEntry[]) : [];
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
    .map((p, i) => ({
      label: p.anchorMonth ?? p.month ?? p.name ?? `row-${i}`,
      price: Number(p.price ?? p.outright ?? (p as any).value ?? 0),
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
                {prices && prices.map((p, i) => {
                  const label = p.anchorMonth ?? p.month ?? p.name ?? `row-${i}`;
                  const priceVal = p.price ?? p.outright ?? (p as any).value ?? null;
                  const priceText =
                    priceVal === null || priceVal === undefined ? "—" : Number(priceVal).toFixed(2);
                  return (
                    <tr key={i}>
                      <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{label}</td>
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
