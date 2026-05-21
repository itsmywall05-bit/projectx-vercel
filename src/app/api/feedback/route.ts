import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

function normalizeTags(value: unknown): string[] {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string") {
        return value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }
    return [];
}

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("feedback_log")
        .select("*")
        .order("session_number", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const request = await req.json();
    const session_number = Number(request.session_number ?? 0);
    const session_date = request.session_date;

    if (!session_number || !session_date) {
        return NextResponse.json(
            { error: "session_number and session_date are required" },
            { status: 400 }
        );
    }

    const payload = {
        session_number,
        session_date,
        body: typeof request.body === "string" ? request.body : "",
        went_well: request.went_well || null,
        didnt_go_well: request.didnt_go_well || null,
        to_improve: request.to_improve || null,
        mistake: request.mistake || null,
        learning: request.learning || null,
        tags: normalizeTags(request.tags),
    };

    const { data, error } = await supabaseAdmin
        .from("feedback_log")
        .insert(payload)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
