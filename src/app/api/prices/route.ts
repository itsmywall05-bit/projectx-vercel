import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from "@/lib/supabase-server";
import { normalizePriceKey } from "@/lib/pricing";

// Fields currently fetched from Excel.
// To add a field: add it here and in the VBA COLUMN_MAP, then run the SQL migration.
export type ExcelPriceUpdate = {
    product?: string;
    anchor_month?: string;
    exchange?: string;
    last?: number;
    change?: number;
    settle?: number;
};

export type StoredPriceRecord = {
    price_key: string;
    product?: string | null;
    anchor_month?: string | null;
    exchange?: string | null;
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

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const updates: ExcelPriceUpdate[] = Array.isArray(data) ? data : [data];

        const rows: (StoredPriceRecord)[] = [];
        for (const u of updates) {
            const last = num(u.last);
            const product = str(u.product);
            const anchorMonth = str(u.anchor_month);
            if (last === null || !product || !anchorMonth) continue;

            const price_key = normalizePriceKey(`${product} ${anchorMonth}`);
            rows.push({
                price_key,
                product,
                anchor_month: anchorMonth,
                exchange: str(u.exchange),
                last,
                change: num(u.change),
                settle: num(u.settle),
                updated_at: new Date().toISOString(),
            });
        }

        if (rows.length === 0) {
            return NextResponse.json({ error: "No valid price rows" }, { status: 400 });
        }

        // Deduplicate — last writer wins per price_key
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
    const { data, error } = await supabaseAdmin.from("price_feed").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const priceMap: Record<string, StoredPriceRecord> = {};
    (data ?? []).forEach((row) => {
        if (row?.price_key) priceMap[row.price_key] = row as StoredPriceRecord;
    });

    return NextResponse.json(priceMap);
}
