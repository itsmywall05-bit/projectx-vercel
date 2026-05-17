import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, name, exchange, tick_size, tick_value } = body;

  if (!code || !name || !exchange || !tick_size || !tick_value) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .upsert({ code: code.toUpperCase(), name, exchange, tick_size, tick_value })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { code } = await req.json();

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("code", code);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
