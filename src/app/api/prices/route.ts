import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from "@/lib/supabase-server";
import { normalizePriceKey } from "@/lib/pricing";

// Fields fetched from Excel.
// To add a field: add it here, handle in POST, and run the SQL migration.
export type ExcelPriceUpdate = {
    symbol?: string;        // TT instrument name — used as price_key (e.g. CLN6)
    product?: string;       // Product code (e.g. CL)
    anchor_month?: string;  // Expiry month (e.g. Jul26)
    exchange?: string;
    last?: number;
    change?: number;
    settle?: number;
};

export type StoredPriceRecord = {
    price_key: string;
    symbol?: string | null;
    product?: string | null;
    anchor_month?: string | null;
    exchange?: string | null;
    expiry_date?: string | null;
    last: number;
    change?: number | null;
    settle?: number | null;
    updated_at: string;
};

function str(v: unknown): string | null {
    return typeof v === "string" && v.trim() ? v.trim() : null;
}
function num(v: unknown): number | null {
    return typeof v === "number" && isFinite(v) ? v : null;
}

const MONTH_NUM: Record<string, string> = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
};

// "Jul26" → "2026-07-01"
function parseExpiryDate(anchorMonth: string): string | null {
    const m = anchorMonth.trim().toUpperCase().match(/^([A-Z]{3})(\d{2})$/);
    if (!m) return null;
    const month = MONTH_NUM[m[1]];
    if (!month) return null;
    return `20${m[2]}-${month}-01`;
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const updates: ExcelPriceUpdate[] = Array.isArray(data) ? data : [data];

        const rows: StoredPriceRecord[] = [];
        for (const u of updates) {
            const last = num(u.last);
            const product = str(u.product);
            const anchorMonth = str(u.anchor_month);
            const symbol = str(u.symbol);

            if (last === null || !product || !anchorMonth) continue;

            // price_key = symbol (CLN6) when available, else product+anchorMonth (CL JUL26)
            const price_key = symbol
                ? normalizePriceKey(symbol)
                : normalizePriceKey(`${product} ${anchorMonth}`);

            rows.push({
                price_key,
                symbol,
                product,
                anchor_month: anchorMonth,
                exchange: str(u.exchange),
                expiry_date: parseExpiryDate(anchorMonth),
                last,
                change: num(u.change),
                settle: num(u.settle),
                updated_at: new Date().toISOString(),
            });
        }

        if (rows.length === 0) {
            return NextResponse.json({ error: "No valid price rows" }, { status: 400 });
        }

        const unique = Array.from(new Map(rows.map((r) => [r.price_key, r])).values());

        const { data: inserted, error } = await supabaseAdmin
            .from("price_feed")
            .upsert(unique, { onConflict: "price_key" })
            .select();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true, count: unique.length, data: inserted });
    } catch {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
}

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("price_feed")
        .select("*")
        .order("expiry_date", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const priceMap: Record<string, StoredPriceRecord> = {};
    (data ?? []).forEach((row) => {
        if (!row?.price_key) return;
        const rec = row as StoredPriceRecord;
        // Index by primary key (symbol e.g. CLN6)
        priceMap[rec.price_key] = rec;
        // Also index by product+anchorMonth (CL JUL26) so existing lookups still work
        if (rec.product && rec.anchor_month) {
            const altKey = normalizePriceKey(`${rec.product} ${rec.anchor_month}`);
            if (altKey !== rec.price_key) priceMap[altKey] = rec;
        }
    });

    return NextResponse.json(priceMap);
}
