import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Debug endpoint to inspect all feedback entries with detailed diagnostics
 * GET /api/debug/feedback
 */
export async function GET() {
  try {
    // Get raw data
    const { data, error } = await supabaseAdmin
      .from("feedback_log")
      .select("*");

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    // Analyze each entry
    const analysis = (data || []).map((entry, idx) => ({
      index: idx,
      id: entry.id,
      session_number: entry.session_number,
      session_date: entry.session_date,
      dateType: typeof entry.session_date,
      session_numberType: typeof entry.session_number,
      isValidDate: entry.session_date ? !isNaN(new Date(entry.session_date).getTime()) : false,
      hasAllFields: {
        session_number: entry.session_number !== null && entry.session_number !== undefined,
        session_date: entry.session_date !== null && entry.session_date !== undefined,
        went_well: !!entry.went_well,
        didnt_go_well: !!entry.didnt_go_well,
        to_improve: !!entry.to_improve,
        mistake: !!entry.mistake,
        learning: !!entry.learning,
      },
      tags: entry.tags,
      created_at: entry.created_at,
    }));

    return NextResponse.json({
      totalEntries: data?.length || 0,
      entries: analysis,
      rawData: data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 }
    );
  }
}
