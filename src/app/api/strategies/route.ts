import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("strategies")
        .select("*")
        .order("code");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        code,
        name,
        tagline,
        status,
        setup_conditions,
        entry_rules,
        exit_rules,
        market_conditions,
        edge_hypothesis,
        tags,
    } = body;

    if (!code || !name || !setup_conditions || !entry_rules || !exit_rules || !edge_hypothesis) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = {
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        tagline: tagline ? String(tagline).trim() : null,
        status: status || "testing",
        setup_conditions: String(setup_conditions).trim(),
        entry_rules: String(entry_rules).trim(),
        exit_rules: String(exit_rules).trim(),
        market_conditions: market_conditions ? String(market_conditions).trim() : null,
        edge_hypothesis: String(edge_hypothesis).trim(),
        tags: Array.isArray(tags) ? tags.map((t: string) => String(t).trim()).filter(Boolean) : [],
    };

    const { data, error } = await supabaseAdmin
        .from("strategies")
        .insert(payload)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}
