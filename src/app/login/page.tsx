"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });

    if (res.ok) {
      router.push("/trade-log");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Invalid passcode");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[320px]">
        <div className="text-center mb-8">
          <h1 className="font-heading font-[800] text-[28px] tracking-tight text-accent">
            project<span className="text-text2 font-normal">X</span>
          </h1>
          <p className="text-[10px] text-muted mt-1 font-serif italic">
            The trading mind, organized.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              className="w-full bg-bg3 border border-border2 rounded px-4 py-3 text-[13px] text-text placeholder:text-muted2 focus:outline-none focus:border-accent/40 transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red text-[10px]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-medium py-2.5 rounded hover:bg-accent/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
