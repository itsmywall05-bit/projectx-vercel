import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from "@/lib/supabase-server";
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
    price_key: string;
    instrument?: string | null;
    symbol?: string | null;
    product?: string | null;
    anchor_month?: string | null;
    last: number;
    change: number | null;
    settle: number | null;
    updated_at: string;
};

function createStoredRow(payload: ExcelPriceUpdate): Omit<StoredPriceRecord, "price_key"> | null {
    const last = typeof payload.last === "number" ? payload.last : typeof payload.price === "number" ? payload.price : undefined;
    if (last === undefined) return null;

    return {
        instrument: typeof payload.instrument === "string" && payload.instrument.trim() ? payload.instrument.trim() : null,
        symbol: typeof payload.symbol === "string" && payload.symbol.trim() ? payload.symbol.trim() : null,
        product: typeof payload.product === "string" && payload.product.trim() ? payload.product.trim() : null,
        anchor_month: typeof payload.anchor_month === "string" && payload.anchor_month.trim() ? payload.anchor_month.trim() : null,
        last,
        change: typeof payload.change === "number" ? payload.change : null,
        settle: typeof payload.settle === "number" ? payload.settle : null,
        updated_at: new Date().toISOString(),
    };
}

function buildPriceRows(update: ExcelPriceUpdate) {
    const baseRow = createStoredRow(update);
    if (!baseRow) return [];

    const rows: Array<Omit<StoredPriceRecord, "price_key"> & { price_key: string }> = [];
    const instrumentKey = typeof update.instrument === "string" && update.instrument.trim();
    const symbolKey = typeof update.symbol === "string" && update.symbol.trim();
    const productKey = typeof update.product === "string" && update.product.trim();
    const anchorMonthKey = typeof update.anchor_month === "string" && update.anchor_month.trim();

    if (instrumentKey) {
        rows.push({ price_key: normalizePriceKey(update.instrument!), ...baseRow });
    }
    if (symbolKey) {
        rows.push({ price_key: normalizePriceKey(update.symbol!), ...baseRow });
    }
    if (productKey && anchorMonthKey) {
        rows.push({ price_key: normalizePriceKey(`${update.product} ${update.anchor_month}`), ...baseRow });
        if (symbolKey) {
            rows.push({ price_key: normalizePriceKey(`${update.product} ${update.anchor_month} ${update.symbol}`), ...baseRow });
        }
    }

    return rows;
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const updates = Array.isArray(data) ? data : [data];

        const rows = updates.flatMap((update) => buildPriceRows(update));
        if (rows.length === 0) {
            return NextResponse.json({ error: "No valid price rows found" }, { status: 400 });
        }

        const { data: inserted, error } = await supabaseAdmin
            .from("price_feed")
            .upsert(rows, { onConflict: "price_key" })
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: rows.length, data: inserted });
    } catch (e) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
}

export async function GET() {
    const { data, error } = await supabaseAdmin.from("price_feed").select("*");
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const priceMap: Record<string, StoredPriceRecord> = {};
    (data ?? []).forEach((row) => {
        if (!row?.price_key) return;
        priceMap[row.price_key] = row as StoredPriceRecord;
    });

    return NextResponse.json(priceMap);
}
