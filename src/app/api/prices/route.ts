import { NextResponse } from "next/server";
import { normalizePriceKey } from "@/lib/pricing";

// Simple in-memory store for RTD prices
const globalPrices: Record<string, number> = {};

function storePrice(key: string, price: number) {
    const normalized = normalizePriceKey(key);
    if (normalized) {
        globalPrices[normalized] = price;
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const updates = Array.isArray(data) ? data : [data];

        for (const update of updates) {
            if (typeof update.price !== "number") continue;
            if (typeof update.instrument === "string" && update.instrument.trim()) {
                storePrice(update.instrument, update.price);
            }
            if (typeof update.symbol === "string" && update.symbol.trim()) {
                storePrice(update.symbol, update.price);
            }
            if (typeof update.product === "string" && update.product.trim() && typeof update.anchor_month === "string" && update.anchor_month.trim()) {
                storePrice(`${update.product} ${update.anchor_month}`, update.price);
                if (typeof update.symbol === "string" && update.symbol.trim()) {
                    storePrice(`${update.product} ${update.anchor_month} ${update.symbol}`, update.price);
                }
            }
        }

        return NextResponse.json({ success: true, count: updates.length });
    } catch (e) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json(globalPrices);
}
