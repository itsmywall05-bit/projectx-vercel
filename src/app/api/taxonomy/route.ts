import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("taxonomy_catalog")
            .select("*")
            .order("created_at", { ascending: true });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data || []);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, sym, name, rule, tier, legs, fill_form, diff_form } = body;
        if (!id || !sym || !name) return NextResponse.json({ error: "id, sym, and name are required" }, { status: 400 });
        const { data, error } = await supabaseAdmin
            .from("taxonomy_catalog")
            .upsert({ id, sym, name, rule: rule ?? "", tier: tier ?? null, legs: legs ?? [], fill_form: fill_form ?? "", diff_form: diff_form ?? "" })
            .select()
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...fields } = body;
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
        const allowed = ["sym", "name", "rule", "tier", "legs", "fill_form", "diff_form"];
        const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
        const { data, error } = await supabaseAdmin
            .from("taxonomy_catalog")
            .update(update)
            .eq("id", id)
            .select()
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 });
        const { error } = await supabaseAdmin.from("taxonomy_catalog").delete().eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
