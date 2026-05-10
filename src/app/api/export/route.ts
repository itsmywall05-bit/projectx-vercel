import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  const { data: trades, error } = await supabaseAdmin
    .from("trades")
    .select("*, products(tick_size, tick_value)")
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "Date", "Product", "Instrument", "Type", "Direction",
    "Entry Price", "Entry Time", "Exit Price", "Exit Time",
    "Size", "Strategy", "Assumption", "Checklist Passed",
    "Playbook Applied", "Playbook Rule", "Process Tag",
    "Notes Pre", "Notes During", "Notes Post",
    "Ticks P&L", "P&L ($)",
  ];

  const rows = (trades || []).map((t) => {
    let ticksPnl = "";
    let dollarPnl = "";

    if (t.exit_price && t.products) {
      const dir = t.direction === "Long" ? 1 : -1;
      const ticks = ((t.exit_price - t.entry_price) / t.products.tick_size) * dir;
      const pnl = ticks * t.products.tick_value * t.size_contracts;
      ticksPnl = (Math.round(ticks * 100) / 100).toString();
      dollarPnl = (Math.round(pnl * 100) / 100).toString();
    }

    return [
      t.date, t.product, t.instrument, t.instrument_type, t.direction,
      t.entry_price, t.entry_time || "", t.exit_price || "", t.exit_time || "",
      t.size_contracts, t.strategy || "", t.assumption || "",
      t.checklist_passed ? "Yes" : "No",
      t.playbook_applied ? "Yes" : "No", t.playbook_rule || "",
      t.process_tag || "",
      t.notes_pre || "", t.notes_during || "", t.notes_post || "",
      ticksPnl, dollarPnl,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="projectX-trades-${date}.csv"`,
    },
  });
}
