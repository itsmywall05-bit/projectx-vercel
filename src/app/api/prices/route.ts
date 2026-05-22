import { NextResponse } from "next/server";
import { normalizePriceKey } from "@/lib/pricing";

export type ExcelPriceUpdate = {
    instrument?: string;
    symbol?: string;
    product?: string;
    anchor_month?: string;
    last?: number;
    change?: number;
    settle?: number;
    price?: number;
};

export type StoredPriceRecord = {
    last: number;
    change: number | null;
    settle: number | null;
    updated_at: string;
};

const globalPrices: Record<string, StoredPriceRecord> = {};

function createStoredRecord(payload: ExcelPriceUpdate): StoredPriceRecord | null {
    const last = typeof payload.last === "number" ? payload.last : typeof payload.price === "number" ? payload.price : undefined;
    if (last === undefined) return null;
    return {
        last,
        change: typeof payload.change === "number" ? payload.change : null,
        settle: typeof payload.settle === "number" ? payload.settle : null,
        updated_at: new Date().toISOString(),
    };
}

function storePrice(key: string, record: StoredPriceRecord) {
    const normalized = normalizePriceKey(key);
    if (!normalized) return;
    globalPrices[normalized] = record;
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const updates = Array.isArray(data) ? data : [data];

        let count = 0;
        for (const update of updates) {
            const record = createStoredRecord(update);
            if (!record) continue;
            const instrumentKey = typeof update.instrument === "string" && update.instrument.trim();
            const symbolKey = typeof update.symbol === "string" && update.symbol.trim();
            const productKey = typeof update.product === "string" && update.product.trim();
            const anchorMonthKey = typeof update.anchor_month === "string" && update.anchor_month.trim();

            if (instrumentKey) {
                storePrice(update.instrument!, record);
            }
            if (symbolKey) {
                storePrice(update.symbol!, record);
            }
            if (productKey && anchorMonthKey) {
                storePrice(`${update.product} ${update.anchor_month}`, record);
                if (symbolKey) {
                    storePrice(`${update.product} ${update.anchor_month} ${update.symbol}`, record);
                }
            }
            count++;
        }

        return NextResponse.json({ success: true, count });
    } catch (e) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json(globalPrices);
}
