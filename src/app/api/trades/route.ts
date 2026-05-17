import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const direction = url.searchParams.get("direction");
  const process_tag = url.searchParams.get("process_tag");
  const strategy = url.searchParams.get("strategy");
  const checklist = url.searchParams.get("checklist");

  let query = supabaseAdmin
    .from("trades")
    .select("*, products(tick_size, tick_value)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (direction) query = query.eq("direction", direction);
  if (process_tag) query = query.eq("process_tag", process_tag);
  if (strategy) query = query.eq("strategy", strategy);
  if (checklist === "true") query = query.eq("checklist_passed", true);
  if (checklist === "false") query = query.eq("checklist_passed", false);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.risk_lt !== undefined && body.risk_lt !== null) {
    // Fetch currently open trades (no exit_price), sorted oldest to newest
    const { data: openTrades } = await supabaseAdmin
      .from("trades")
      .select("id, risk_lt")
      .is("exit_price", null)
      .order("created_at", { ascending: true })
      .limit(4);

    if (openTrades && openTrades.length > 0) {
      // Shift risk limits: trade i gets trade i+1's risk_lt, last gets the new trade's risk_lt
      for (let i = 0; i < openTrades.length; i++) {
        const nextRiskLt = i < openTrades.length - 1 ? openTrades[i + 1].risk_lt : body.risk_lt;
        
        await supabaseAdmin
          .from("trades")
          .update({ risk_lt: nextRiskLt })
          .eq("id", openTrades[i].id);
      }
    }
  }

  const { data, error } = await supabaseAdmin
    .from("trades")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Trade ID required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("trades")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const { error } = await supabaseAdmin
    .from("trades")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
