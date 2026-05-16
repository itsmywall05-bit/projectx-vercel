import { NextResponse } from "next/server";

// Simple in-memory store for RTD prices
const globalPrices: Record<string, number> = {};

export async function POST(req: Request) {
    try {
        const data = await req.json();
        
        // Handle array of updates or single update
        const updates = Array.isArray(data) ? data : [data];
        
        for (const update of updates) {
            if (update.instrument && typeof update.price === "number") {
                globalPrices[update.instrument] = update.price;
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
