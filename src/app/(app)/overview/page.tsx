import Link from "next/link";
import { PageIntro, SectionHeader, Card } from "@/components/ui";

type ModuleCard = {
  id: string;
  name: string;
  desc: string;
  href: string;
  status: string;
  variant: "nx" | "pl" | "ac" | "br" | "qu";
};

const MODULES: ModuleCard[] = [
  { id: "SP-10", name: "The Map", desc: "Spatial canvas — all zones, all connections", href: "/the-map", status: "Live", variant: "nx" },
  { id: "SP-15", name: "Instruments", desc: "Futures: CL WTI · Outrights, Spreads, Flies", href: "/instruments", status: "New", variant: "nx" },
  { id: "SP-11", name: "Trading Plan", desc: "5 rules live — entry, exit, sizing, conditions, limits", href: "/plan/trading", status: "Rules Live", variant: "nx" },
  { id: "SP-02", name: "Strategy Vault", desc: "ORB + VWAP Std Scalp — documented", href: "/strategy-vault", status: "2 strategies", variant: "nx" },
  { id: "SP-16", name: "Playbook", desc: "Rule 1: Aggressive outright → hold short entries", href: "/playbook", status: "1 rule live", variant: "nx" },
  { id: "SP-17", name: "Backtesting", desc: "ORB + VWAP Std Scalp shells ready for data", href: "/backtest", status: "Shells live", variant: "nx" },
  { id: "SP-13", name: "Side Brain", desc: "Health · Gaps · Feedback · Evolution", href: "/side-brain", status: "Online", variant: "br" },
  { id: "SP-14", name: "Learning Engine", desc: "Principles live · Queue building", href: "/learning", status: "Active", variant: "br" },
  { id: "SP-18", name: "Data Connectivity", desc: "Excel + TT RTD — active stage", href: "/data-conn", status: "Excel active", variant: "br" },
  { id: "SP-01", name: "Trade Log", desc: "Full entry logging — Phase 1", href: "/trade-log", status: "Phase 1", variant: "pl" },
  { id: "SP-03", name: "Risk Console", desc: "1% sizing, 2K/2-trade limits defined", href: "/risk-console", status: "Phase 2", variant: "pl" },
  { id: "SP-06", name: "Performance Lab", desc: "P&L · Equity curve · Expectancy", href: "/performance", status: "Phase 3", variant: "pl" },
  { id: "SP-04", name: "Market Context", desc: "Regime · Macro · Events", href: "/market-context", status: "Phase 3", variant: "pl" },
  { id: "SP-05", name: "Watchlist Engine", desc: "Thesis · Triggers · Time horizon", href: "/watchlist", status: "Phase 2", variant: "pl" },
  { id: "SP-07", name: "Feedback Loop", desc: "Post-session · Mistakes · Insights", href: "/feedback", status: "Phase 4", variant: "pl" },
  { id: "SP-09", name: "Deferred Queue", desc: "4 items parked · Nothing lost", href: "/deferred", status: "Always Active", variant: "ac" },
];

export default function OverviewPage() {
  return (
    <>
      <PageIntro>The trading mind — organized, filled with real rules, evolving toward Phase 1.</PageIntro>

      <div className="sr">
        <div className="sc"><div className="sd sg" />Trading rules live</div>
        <div className="sc"><div className="sd sy" />2 strategies documented</div>
        <div className="sc"><div className="sd sb" />Instruments mapped</div>
        <div className="sc"><div className="sd" style={{ background: "var(--cyan)" }} />Playbook: 1 rule</div>
        <div className="sc"><div className="sd sp" />Side Brain online</div>
        <div className="sc"><div className="sd sm" />4 items deferred</div>
      </div>

      <SectionHeader title="Build Phases" />
      <Card className="mb">
        <div className="pr"><div className="pr-n">Phase 0</div><div className="pr-nm">Origin — Blueprint · Shell · Map · Rules · Instruments · Strategies · Playbook</div><div className="pr-b prb-a">In Progress</div></div>
        <div className="pr"><div className="pr-n">Phase 1</div><div className="pr-nm">Mind Feed (live) · Trade Log (entry/logging) · Trading Plan (full rules)</div><div className="pr-b prb-n">Next</div></div>
        <div className="pr"><div className="pr-n">Phase 2</div><div className="pr-nm">Risk Console · Strategy Vault (full) · Watchlist Engine</div><div className="pr-b prb-q">Queued</div></div>
        <div className="pr"><div className="pr-n">Phase 3</div><div className="pr-nm">Performance Lab · Market Context</div><div className="pr-b prb-q">Queued</div></div>
        <div className="pr"><div className="pr-n">Phase 4</div><div className="pr-nm">Feedback Loop · Learning Engine (deep)</div><div className="pr-b prb-q">Queued</div></div>
        <div className="pr"><div className="pr-n">Phase 5+</div><div className="pr-nm">TT Direct integration · Alerting · Advanced backtesting</div><div className="pr-b prb-d">Deferred</div></div>
      </Card>

      <SectionHeader title="All Modules" sub={`${MODULES.length} sub-projects`} />
      <div className="mg">
        {MODULES.map((m) => (
          <Link key={m.id} href={m.href} className={`mc mc-${m.variant}`}>
            <div className="mc-id">{m.id}</div>
            <div className="mc-n">{m.name}</div>
            <div className="mc-d">{m.desc}</div>
            <div className={`mc-s ms-${m.variant}`}>{m.status}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
