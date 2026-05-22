import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;
    const adminPass = process.env.RISK_ADMIN_PASS || process.env.NEXT_PUBLIC_RISK_ADMIN_PASS;
    if (!adminPass) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }
    if (password === adminPass) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
