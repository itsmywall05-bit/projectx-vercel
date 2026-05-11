"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return "active";
    if (path !== "/" && pathname.startsWith(path)) return "active";
    return "";
  };

  return (
    <div className="sidebar">
      <div className="logo-wrap">
        <div className="logo">project<span className="logo-x">X</span></div>
        <div className="logo-v">V 0.3 — RULES LIVE</div>
      </div>
      
      <nav className="nav">
        <div className="nl">Core</div>
        <Link href="/" className={`ni ${isActive("/")}`}>
          <span className="ni-ico">◈</span><span className="ni-txt">Overview</span>
        </Link>
        <div className="ni"><span className="ni-ico">⟳</span><span className="ni-txt">Mind Feed</span><span className="nb live">live</span></div>
        <div className="ni"><span className="ni-ico">◫</span><span className="ni-txt">The Map</span></div>

        <div className="nl">Plan</div>
        <div className="ni"><span className="ni-ico">◎</span><span className="ni-txt">Trading Plan</span><span className="nb new">updated</span></div>
        <div className="ni"><span className="ni-ico">◰</span><span className="ni-txt">General Plan</span></div>

        <div className="nl">Instruments</div>
        <Link href="/products" className={`ni ${isActive("/products")}`}>
          <span className="ni-ico">◑</span><span className="ni-txt">Instruments</span><span className="nb new">new</span>
        </Link>

        <div className="nl">Strategy</div>
        <div className="ni"><span className="ni-ico">◧</span><span className="ni-txt">Strategy Vault</span><span className="nb new">2 live</span></div>
        <div className="ni"><span className="ni-ico">◐</span><span className="ni-txt">Playbook</span><span className="nb new">1 rule</span></div>
        <div className="ni"><span className="ni-ico">◉</span><span className="ni-txt">Backtesting</span><span className="nb new">2 shells</span></div>

        <div className="nl">Modules</div>
        <Link href="/trade-log" className={`ni ${isActive("/trade-log")}`}>
          <span className="ni-ico">▣</span><span className="ni-txt">Trade Log</span>
        </Link>
        <div className="ni"><span className="ni-ico">◬</span><span className="ni-txt">Risk Console</span></div>
        <div className="ni"><span className="ni-ico">◈</span><span className="ni-txt">Performance Lab</span></div>
        <div className="ni"><span className="ni-ico">◒</span><span className="ni-txt">Market Context</span></div>
        <div className="ni"><span className="ni-ico">◓</span><span className="ni-txt">Watchlist Engine</span></div>
        <div className="ni"><span className="ni-ico">◷</span><span className="ni-txt">Feedback Loop</span></div>

        <div className="nl">Intelligence</div>
        <div className="ni"><span className="ni-ico">◍</span><span className="ni-txt">Side Brain</span></div>
        <div className="ni"><span className="ni-ico">◔</span><span className="ni-txt">Learning Engine</span></div>

        <div className="nl">Data</div>
        <div className="ni"><span className="ni-ico">◫</span><span className="ni-txt">Data Connectivity</span><span className="nb warn">excel</span></div>

        <div className="nl">System</div>
        <div className="ni"><span className="ni-ico">⊡</span><span className="ni-txt">Deferred Queue</span><span className="nb warn">4</span></div>
        <div className="ni"><span className="ni-ico">⊞</span><span className="ni-txt">Feature Backlog</span><span className="nb">12</span></div>
        <div className="ni"><span className="ni-ico">◪</span><span className="ni-txt">Blueprint</span></div>
      </nav>

      <div className="sf">
        <div className="sys"><div className="pulse"></div><span>v0.3 · rules live</span></div>
      </div>
    </div>
  );
}
