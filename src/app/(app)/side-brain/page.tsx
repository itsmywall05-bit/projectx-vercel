import { PageIntro, SectionHeader, Card } from "@/components/ui";
import { Tag } from "@/components/ui/Tag";
import { getFeedbackEntries } from "@/lib/data/queries";

import type { TagVariant } from "@/components/ui/Tag";

const MODULE_HEALTH: { name: string; tag: string; variant: TagVariant; pct: number; pfClass: string }[] = [
  { name: "Trading Plan", tag: "rules live", variant: "y", pct: 75, pfClass: "pfy" },
  { name: "The Map", tag: "live", variant: "g", pct: 65, pfClass: "pfg" },
  { name: "Strategy Vault", tag: "2 strategies", variant: "b", pct: 55, pfClass: "pfb" },
  { name: "Instruments", tag: "mapped", variant: "c", pct: 70, pfClass: "pfc" },
  { name: "Playbook", tag: "1 rule", variant: "y", pct: 20, pfClass: "pfy" },
  { name: "Backtesting", tag: "shells", variant: "default", pct: 25, pfClass: "pfp" },
  { name: "Trade Log", tag: "phase 1", variant: "default", pct: 10, pfClass: "pfb" },
  { name: "Risk Console", tag: "phase 2", variant: "default", pct: 15, pfClass: "pfr" },
  { name: "Performance Lab", tag: "phase 3", variant: "default", pct: 0, pfClass: "pfp" },
  { name: "Feedback Loop", tag: "phase 4", variant: "default", pct: 0, pfClass: "pfg" },
];

export default async function SideBrainPage() {
  const feedback = await getFeedbackEntries();

  return (
    <>
      <PageIntro>The meta-layer. Watches the system. Surfaces gaps. Tracks evolution. Keeps the main brain healthy.</PageIntro>

      <div className="bs-wrap">
        <div className="bsr">
          <div className="bsr-v">38</div>
          <div className="bsr-l">/ 100</div>
        </div>
        <div className="bs-body">
          <div className="bs-title">System Health — 38/100</div>
          <div className="bs-desc">
            Significant progress from Phase 0 origin (was 24). Trading rules are now live. Two strategies documented. Instruments mapped. Playbook initialized. Remaining gaps: no live trade data yet, risk console not built, feedback loop not active.
          </div>
        </div>
      </div>

      <div className="g2">
        <div>
          <SectionHeader title="Module Health" />
          <Card className="mb">
            {MODULE_HEALTH.map((m) => (
              <div key={m.name} className="pw">
                <div className="plb">
                  <span>{m.name}</span>
                  <Tag variant={m.variant}>{m.tag}</Tag>
                </div>
                <div className="pb">
                  <div className={`pf ${m.pfClass}`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <SectionHeader title="Gaps Detected" sub="3 open" />
          <div className="gap-item">
            <div className="gi-icon">◎</div>
            <div className="gi-b">
              <div className="gi-t">Pre-Trade Checklist — items partially defined</div>
              <div className="gi-d">Checklist exists (7 draft items). Needs review and confirmation that these are your actual pre-trade conditions. Add/remove as needed.</div>
            </div>
            <div className="gi-tag"><Tag variant="y">Medium</Tag></div>
          </div>
          <div className="gap-item">
            <div className="gi-icon">◒</div>
            <div className="gi-b">
              <div className="gi-t">Playbook Rule 01 — &quot;Aggressive&quot; not yet quantified</div>
              <div className="gi-d">Rule is active but the trigger condition &quot;aggressively bullish&quot; needs a measurable definition. Without this, application will be subjective.</div>
            </div>
            <div className="gi-tag"><Tag variant="y">Medium</Tag></div>
          </div>
          <div className="gap-item">
            <div className="gi-icon">▣</div>
            <div className="gi-b">
              <div className="gi-t">No live trade data — system can&apos;t learn yet</div>
              <div className="gi-d">All modules that require trade data (Performance Lab, Backtesting, Feedback Loop) are pending. Phase 1 unlocks this.</div>
            </div>
            <div className="gi-tag"><Tag>Expected</Tag></div>
          </div>

          <SectionHeader title="Feedback Log" />
          <Card>
            {feedback.map((entry, idx) => {
              const borderColor =
                idx % 3 === 0 ? "var(--accent)" : idx % 3 === 1 ? "var(--purple)" : "var(--teal)";
              return (
                <div key={entry.id} className="fb-entry" style={{ borderLeftColor: borderColor }}>
                  <div className="fb-d">
                    Session {entry.session_number} · {entry.session_date}
                  </div>
                  <div className="fb-t">{entry.body}</div>
                  {entry.tags.length > 0 && (
                    <div className="fb-tags">
                      {entry.tags.map((t) => (
                        <Tag key={t} variant="default">{t}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </>
  );
}
