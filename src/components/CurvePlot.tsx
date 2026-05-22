"use client";

import React from "react";

type Point = { label: string; price: number };

export default function CurvePlot({ points, height = 140 }: { points: Point[]; height?: number }) {
    if (!points || points.length === 0) return <div style={{ height }}>No data</div>;

    const vals = points.map((p) => p.price);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.1 || 1;
    const w = 320;
    const h = height;

    const mapX = (i: number) => (i / (points.length - 1)) * (w - 20) + 10;
    const mapY = (v: number) => {
        const norm = (v - (min - pad)) / ((max + pad) - (min - pad));
        return h - (norm * (h - 10) + 5);
    };

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(i)} ${mapY(p.price)}`).join(" ");

    return (
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: "#fafafa", borderRadius: 6 }}>
            <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e6f3ff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>

            <path d={`${path} L ${mapX(points.length - 1)} ${h} L ${mapX(0)} ${h} Z`} fill="url(#g1)" stroke="none" />
            <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {points.map((p, i) => (
                <circle key={i} cx={mapX(i)} cy={mapY(p.price)} r={2.5} fill="#2563eb" />
            ))}
        </svg>
    );
}
