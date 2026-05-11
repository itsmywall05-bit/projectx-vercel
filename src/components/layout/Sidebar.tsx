"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BadgeKind = "live" | "new" | "warn" | "red" | "default";

type NavItem = {
    href: string;
    icon: string;
    label: string;
    badge?: { text: string; kind?: BadgeKind };
};

type NavSection = {
    title: string;
    items: NavItem[];
};

const NAV: NavSection[] = [
    {
        title: "Core",
        items: [
            { href: "/overview", icon: "◈", label: "Overview" },
            { href: "/mind-feed", icon: "⟳", label: "Mind Feed", badge: { text: "live", kind: "live" } },
            { href: "/the-map", icon: "◫", label: "The Map" },
        ],
    },
    {
        title: "Plan",
        items: [
            { href: "/plan/trading", icon: "◎", label: "Trading Plan", badge: { text: "updated", kind: "new" } },
            { href: "/plan/general", icon: "◰", label: "General Plan" },
        ],
    },
    {
        title: "Instruments",
        items: [
            { href: "/instruments", icon: "◑", label: "Instruments", badge: { text: "new", kind: "new" } },
        ],
    },
    {
        title: "Strategy",
        items: [
            { href: "/strategy-vault", icon: "◧", label: "Strategy Vault", badge: { text: "2 live", kind: "new" } },
            { href: "/strategy-taxonomy", icon: "◐", label: "Strategy Taxonomy" },
            { href: "/playbook", icon: "◐", label: "Playbook", badge: { text: "1 rule", kind: "new" } },
            { href: "/backtest", icon: "◉", label: "Backtesting", badge: { text: "2 shells", kind: "new" } },
        ],
    },
    {
        title: "Modules",
        items: [
            { href: "/trade-log", icon: "▣", label: "Trade Log" },
            { href: "/trade-log-legacy", icon: "▦", label: "Trade Log (Legacy)", badge: { text: "v0.1", kind: "default" } },
            { href: "/products", icon: "◭", label: "Products" },
            { href: "/risk-console", icon: "◬", label: "Risk Console" },
            { href: "/performance", icon: "◈", label: "Performance Lab" },
            { href: "/market-context", icon: "◒", label: "Market Context" },
            { href: "/watchlist", icon: "◓", label: "Watchlist Engine" },
            { href: "/feedback", icon: "◷", label: "Feedback Loop" },
        ],
    },
    {
        title: "Intelligence",
        items: [
            { href: "/side-brain", icon: "◍", label: "Side Brain" },
            { href: "/learning", icon: "◔", label: "Learning Engine" },
        ],
    },
    {
        title: "Data",
        items: [
            { href: "/data-conn", icon: "◫", label: "Data Connectivity", badge: { text: "excel", kind: "warn" } },
        ],
    },
    {
        title: "System",
        items: [
            { href: "/deferred", icon: "⊡", label: "Deferred Queue", badge: { text: "4", kind: "warn" } },
            { href: "/backlog", icon: "⊞", label: "Feature Backlog", badge: { text: "12", kind: "default" } },
            { href: "/blueprint", icon: "◪", label: "Blueprint" },
        ],
    },
];

function badgeClass(kind?: BadgeKind): string {
    switch (kind) {
        case "live": return "px-nb px-nb-live";
        case "new": return "px-nb px-nb-new";
        case "warn": return "px-nb px-nb-warn";
        case "red": return "px-nb px-nb-red";
        default: return "px-nb";
    }
}

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            style={{
                width: "var(--sidebar-w)",
                minWidth: "var(--sidebar-w)",
                background: "var(--bg2)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
            }}
        >
            <div style={{ padding: "20px 18px 15px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 18, letterSpacing: "-.5px", color: "var(--accent)" }}>
                    project<span style={{ color: "var(--text2)", fontWeight: 400 }}>X</span>
                </div>
                <div style={{ fontSize: 8.5, letterSpacing: 2, color: "var(--muted)", marginTop: 3 }}>V 0.3 — RULES LIVE</div>
            </div>

            <nav className="px-nav">
                {NAV.map((section) => (
                    <div key={section.title} className="px-section">
                        <div className="px-section-title">{section.title}</div>
                        <div className="px-section-items">
                            {section.items.map((item) => {
                                const active =
                                    pathname === item.href ||
                                    (item.href !== "/" && pathname.startsWith(item.href + "/"));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={active ? "px-ni px-ni-active" : "px-ni"}
                                    >
                                        <span className="px-ni-icon">{item.icon}</span>
                                        <span className="px-ni-label">{item.label}</span>
                                        {item.badge && <span className={badgeClass(item.badge.kind)}>{item.badge.text}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: "var(--muted)" }}>
                    <div className="px-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--teal)" }} />
                    <span>v0.3 · rules live</span>
                </div>
            </div>

            <style jsx>{`
        .px-ni {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          margin: 0 6px;
          cursor: pointer;
          border-left: 2px solid transparent;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.2;
          border-radius: 6px;
          transition: all 0.1s;
          user-select: none;
          text-decoration: none;
        }
        .px-ni:hover {
          color: var(--text);
          background: rgba(184, 240, 80, 0.04);
        }
        .px-ni-active {
          color: var(--accent);
          border-left-color: var(--accent);
          background: rgba(184, 240, 80, 0.08);
        }
        .px-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 0 16px;
        }
        .px-section {
          padding-bottom: 6px;
        }
        .px-section-title {
          font-size: 8px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--muted2);
          padding: 14px 18px 6px;
        }
        .px-section-items {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 6px;
        }
        .px-ni-icon {
          width: 16px;
          text-align: center;
          font-size: 12px;
          color: var(--muted);
          flex-shrink: 0;
        }
        .px-ni-label {
          flex: 1;
          min-width: 0;
          font-family: var(--font-syne);
          font-weight: 500;
          letter-spacing: 0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .px-ni-active .px-ni-icon {
          color: var(--accent);
        }
        .px-nb {
          font-size: 7px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 999px;
          background: var(--border2);
          color: var(--muted);
        }
        .px-nb-live { background: rgba(56, 240, 176, 0.1); color: var(--teal); }
        .px-nb-new { background: rgba(184, 240, 80, 0.1); color: var(--accent); }
        .px-nb-warn { background: rgba(240, 160, 48, 0.1); color: var(--amber); }
        .px-nb-red { background: rgba(240, 60, 92, 0.1); color: var(--red); }
      `}</style>
        </aside>
    );
}
