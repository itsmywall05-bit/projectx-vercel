import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();

  if (!passcode) {
    return NextResponse.json({ error: "Passcode required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("auth_config")
    .select("passcode_hash")
    .eq("id", 1)
    .single();

  if (error || !data) {
    let roleStr = "UNKNOWN";
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.includes(".")) {
      try {
        const payload = Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY.split(".")[1], 'base64').toString();
        roleStr = JSON.parse(payload).role;
      } catch (e) {}
    }
    return NextResponse.json({ error: "Auth not configured: " + (error?.message || "No data") + ` | Role parsed from Key: ${roleStr}` }, { status: 500 });
  }

  // If placeholder, set the passcode for first time
  if (data.passcode_hash === "PLACEHOLDER") {
    const hash = await bcrypt.hash(passcode, 10);
    await supabaseAdmin
      .from("auth_config")
      .update({ passcode_hash: hash })
      .eq("id", 1);

    const cookieStore = await cookies();
    cookieStore.set("projectx-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true, firstTime: true });
  }

  const valid = await bcrypt.compare(passcode, data.passcode_hash);

  if (!valid) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("projectx-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
