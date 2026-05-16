"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui";
import { Tag } from "@/components/ui/Tag";
import { TaxonomyStrategy, getAllStrategies, getTowers } from "@/lib/taxonomy";

export default function InstrumentRelationships() {
    const [towers, setTowers] = useState<Record<string, TaxonomyStrategy[]>>({});
    const [limit, setLimit] = useState<number>(5);

    useEffect(() => {
        async function load() {
            const strats = await getAllStrategies();
            setTowers(getTowers(strats));
        }
        load();
    }, []);

    const towerEntries = Object.entries(towers);
    const displayedTowers = towerEntries.slice(0, limit);

    function getDirectionSensitivity(legs: number) {
        if (legs === 1) return { text: "High (direct)", color: "var(--red)" };
        if (legs === 2) return { text: "Moderate", color: "var(--amber)" };
        if (legs === 3) return { text: "Low (curvature)", color: "var(--teal)" };
        return { text: "Very Low", color: "var(--blue)" };
    }

    function getComplexity(legs: number) {
        if (legs === 1) return "Low";
        if (legs === 2) return "Medium";
        return "High";
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Showing {displayedTowers.length} of {towerEntries.length} relationships
                </div>
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
                    {displayedTowers.map(([sym, group]) => {
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
    );
}
