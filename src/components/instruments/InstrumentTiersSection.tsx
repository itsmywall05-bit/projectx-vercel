"use client";

import { useState, useEffect } from "react";
import { Tag } from "@/components/ui/Tag";
import type { TagVariant } from "@/components/ui/Tag";
import { Card, SectionHeader } from "@/components/ui";
import { BUILT_IN, getAllStrategies, getTowers } from "@/lib/taxonomy";
import type { TaxonomyStrategy } from "@/lib/taxonomy";
import type { Instrument } from "@/lib/data/types";

interface TowerMeta {
    variant: TagVariant;
    notes: string;
}

const TOWER_META: Record<string, TowerMeta> = {
    S: {
        variant: "b",
        notes: "The spread is the local slope between two adjacent curve points — it measures whether the market is in backwardation (near premium over far) or contango (far premium over near). A spread strengthening (moving more positive) means prompt tightness is growing. A weakening spread signals building supply or demand falling away near-term. Spreads are the primary sensitivity indicator: everything else is built on top of them.",
    },
    F: {
        variant: "p",
        notes: "The fly measures local convexity — whether a specific delivery month is kinked relative to its two neighbors. A positive fly means the middle month is cheap: the curve dips down at that point. A negative fly means the middle is expensive: the curve humps up. Flies are sensitive to supply or demand events that are isolated to a narrow window of months — a refinery turnaround, a seasonal demand peak, a pipeline outage — without broadly moving the whole curve.",
    },
    FF: {
        variant: "a",
        notes: "The double fly measures the rate of change of curvature — how the kink pattern itself is shifting as you move along the curve. A large FF signals that adjacent flies are pulling in opposite directions: one section of the curve is convex while the next is concave. This structure is especially responsive to seasonal inflection points, where the curvature regime changes from one delivery period to the next.",
    },
    D: {
        variant: "a",
        notes: "The drone captures third-order shape across five expiries. Where flies tell you about isolated kinks, the drone is sensitive to large-scale S-curves and structural bulges — the kind that appear when a medium-term supply cycle is shifting. Drone values change slowly; persistent drift in the drone often precedes broad spread moves by signalling that the curve is rebuilding its structural shape before the slope reprices.",
    },
    FD: {
        variant: "a",
        notes: "Six legs, fourth-order. By this tier, directional exposure to the outright is negligible. FD tracks whether the curve's medium-term structural pattern is consistent across a six-month span. A moving FD while spreads are quiet means the curve is rotating its inner shape without changing its overall level — a sign of structural repositioning rather than fundamental supply/demand shift.",
    },
    DD: {
        variant: "y",
        notes: "Seven-leg, fifth-order. The double drone detects whether the large-scale curve arch is rotating — changing shape end-to-end without moving in level. A trending DD while lower structures are flat is a regime signal: the market is repricing the structural supply/demand balance across the full visible horizon. Often precedes broader spread moves by several sessions.",
    },
    T: {
        variant: "y",
        notes: "Eight legs spanning a delivery year. The tenor measures the overall structural tilt of the curve at a quarterly-to-annual scale. A rising tenor means the back end of the curve is falling relative to the front — the market is becoming more backwardated across time, not just at the prompt. When tenor diverges from front spreads, the market agrees on current tightness but is repricing the multi-quarter trajectory.",
    },
    FT: {
        variant: "y",
        notes: "Nine-leg structure measuring the curvature of the tenor — whether the year-scale arch of the curve is steepening or flattening unevenly from one half to the other. FT moves are infrequent but meaningful: they signal that the seasonal curve pattern is being disrupted asymmetrically, with one delivery period resisting repricing while another accelerates.",
    },
    DT: {
        variant: "r",
        notes: "Ten legs spanning nearly a full calendar year. DT captures slow, deep oscillations in the curve's structural shape — movements that only appear once lower-order structures have averaged out. Persistent DT drift typically reflects a long-cycle fundamental shift: a multi-year supply investment cycle changing pace, or a demand regime transition propagating gradually through the forward curve.",
    },
    TT: {
        variant: "r",
        notes: "Eleven legs, ninth-order. TT measures the symmetry of the forward curve's overall shape across an annual horizon. A non-zero TT means the first half of the visible curve is shaped differently from the second — the curve is structurally asymmetric in a way no lower-tier structure can fully describe. Rarely moves outside of genuine regime transitions.",
    },
    X: {
        variant: "r",
        notes: "Twelve legs, the full calendar year. The Decima's value reflects the complete annual structural fingerprint of the forward curve. In efficient markets it tends toward zero — the annual shape is fully explained by lower-order structures. A large Decima reading indicates the curve has developed complex, high-order shape that no combination of spreads, flies, or drones can adequately capture; a clear sign of a structural supply shock spanning the entire delivery year.",
    },
    FX: {
        variant: "r",
        notes: "Thirteen legs, eleventh-order. FX captures the curvature of the Decima itself — whether the curve's annual structural fingerprint is biased toward the near or far end of the year. When FX moves, the market is not just reshaping the forward curve: it is reshaping how the reshaping is distributed across the year. Rarely significant; when it is, the entire curve structure is in transition.",
    },
    DX: {
        variant: "r",
        notes: "Fourteen legs, the top of the current taxonomy hierarchy. DX represents the highest-order structural signal the standard taxonomy can resolve. Values near zero confirm the forward curve is well-approximated by lower-tier structures. A persistent, directional DX reading is a rare signal that a structural regime shift has propagated through the entire visible horizon and cannot be decomposed into any simpler pattern.",
    },
};

function getDirectionSensitivity(legs: number) {
    if (legs <= 2) return { text: "Moderate", color: "var(--amber)" };
    if (legs === 3) return { text: "Low (curvature)", color: "var(--teal)" };
    if (legs <= 5) return { text: "Very Low", color: "var(--blue)" };
    return { text: "Structural only", color: "var(--muted)" };
}

function getComplexity(legs: number) {
    if (legs <= 2) return "Medium";
    if (legs <= 4) return "High";
    return "Very High";
}

interface Props {
    outright: Instrument | null;
}

export default function InstrumentTiersSection({ outright }: Props) {
    const [limit, setLimit] = useState(5);
    const [towers, setTowers] = useState<Record<string, TaxonomyStrategy[]>>({});

    useEffect(() => {
        getAllStrategies().then((strats) => setTowers(getTowers(strats)));
    }, []);

    const displayedTowers = BUILT_IN.slice(0, limit);
    const towerEntries = Object.entries(towers);
    const displayedRelationships = towerEntries.slice(0, limit);

    const limitSelect = (
        <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-bg4 border border-border2 text-text text-sm rounded px-2 py-1 focus:border-accent outline-none"
        >
            <option value={3}>Show 3</option>
            <option value={5}>Show 5</option>
            <option value={10}>Show 10</option>
            <option value={50}>Show All</option>
        </select>
    );

    return (
        <>
            {/* ── Instrument Universe: tower list ─────────────────── */}
            <div className="flex items-center justify-between mb-2">
                <SectionHeader title="Instrument Universe" sub="CL WTI Family" />
            </div>

            <div className="inst-tree">
                {/* Outright — passed from server */}
                {outright && (
                    <div className="it-children">
                        <div className="it-child">
                            <div className="it-child-name">
                                <Tag variant="y">Outright</Tag>
                                <span>{outright.symbol} — {outright.name}</span>
                            </div>
                            {outright.formula && <div className="it-child-formula">{outright.formula}</div>}
                            {outright.notes && (
                                <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.6 }}>
                                    {outright.notes}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="it-children">
                    {displayedTowers.map((tower) => {
                        const meta = TOWER_META[tower.sym];
                        if (!meta) return null;
                        return (
                            <div key={tower.sym} className="it-child">
                                <div className="it-child-name">
                                    <Tag variant={meta.variant}>{tower.sym}</Tag>
                                    <span>
                                        {tower.sym} — {tower.name}
                                        <span style={{ fontSize: 9, color: "var(--muted)", marginLeft: 8 }}>
                                            {tower.legs.length} legs · tier {tower.tier}
                                        </span>
                                    </span>
                                </div>
                                <div className="it-child-formula" style={{ fontFamily: "monospace", fontSize: 9 }}>
                                    {tower.rule}
                                </div>
                                <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.6 }}>
                                    {meta.notes}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Instrument Relationships: shared limit ───────────── */}
            <SectionHeader title="Instrument Relationships" />
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        Showing {Math.min(limit, towerEntries.length)} of {towerEntries.length} relationships
                    </div>
                    {limitSelect}
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table className="dt">
                        <thead>
                            <tr>
                                <th>Relationship (Tower)</th>
                                <th>Legs</th>
                                <th>Direction Sensitivity</th>
                                <th>Complexity</th>
                                <th>Base Strategy</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><Tag variant="c">Outright</Tag></td>
                                <td>1</td>
                                <td style={{ color: "var(--red)" }}>High (direct)</td>
                                <td>Low</td>
                                <td>Trigger source</td>
                            </tr>
                            {displayedRelationships.map(([sym, group]) => {
                                const baseStrat = group[0];
                                const legs = baseStrat.legs.length;
                                const sens = getDirectionSensitivity(legs);
                                return (
                                    <tr key={sym}>
                                        <td>
                                            <Tag variant={legs === 2 ? "b" : legs === 3 ? "p" : "y"}>{sym}</Tag>
                                            <span className="ml-2">{baseStrat.name}</span>
                                        </td>
                                        <td>{legs}</td>
                                        <td style={{ color: sens.color }}>{sens.text}</td>
                                        <td>{getComplexity(legs)}</td>
                                        <td>{baseStrat.id} ({baseStrat.rule})</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
}
