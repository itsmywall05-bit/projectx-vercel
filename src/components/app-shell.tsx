"use client";

import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  const pageNames: Record<string, string> = {
    "/": "Overview",
    "/trade-log": "Trade Log",
    "/products": "Products",
  };

  const title = pageNames[pathname] || "Overview";

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setDate(n.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }));
      setTime(n.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="shell">
      {/* ════ SIDEBAR ════ */}
      <Sidebar />

      {/* ════ MAIN ════ */}
      <div className="main">
        <div className="topbar">
          <div className="tb-bc">
            <span>projectX</span>
            <span className="tb-sep">/</span>
            <span className="tb-title">{title}</span>
          </div>
          <div className="tb-r">
            <div className="phase-pill">Phase 0 → 1</div>
            <div className="tb-date">{date}</div>
            <div className="tb-clk">{time}</div>
          </div>
        </div>

        <div className="content">
          <div className="page active">{children}</div>
        </div>
      </div>
    </div>
  );
}
