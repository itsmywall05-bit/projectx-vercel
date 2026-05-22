import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("backlog_items").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, tags, priority, entryDate } = body;
    const payload = {
      title: title || "Untitled",
      category: "TD",
      notes: description || "",
      tags: Array.isArray(tags) ? tags : [],
      priority: priority || "medium",
      entry_date: entryDate || new Date().toISOString(),
    } as any;

    const { data, error } = await supabaseAdmin.from("backlog_items").insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
