import { PageIntro, SectionHeader, StatCard, Card } from "@/components/ui";
import { Tag, autoTagVariant, type TagVariant } from "@/components/ui/Tag";
import { renderInline } from "@/components/ui/markdown";
import PreTradeChecklist from "@/components/checklist/PreTradeChecklist";
import { getTradingRules, getChecklistItems } from "@/lib/data/queries";
import type { RuleCategory } from "@/lib/data/types";

const CATEGORY_CLASS: Record<RuleCategory, string> = {
  entry: "rc-entry",
  exit: "rc-exit",
  sizing: "rc-size",
  market: "rc-market",
  limit: "rc-limit",
};

const CATEGORY_TAG: Record<RuleCategory, { label: string; variant: TagVariant }> = {
  entry: { label: "Entry", variant: "y" },
  exit: { label: "Exit", variant: "g" },
  sizing: { label: "Sizing", variant: "b" },
  market: { label: "Market Conditions", variant: "a" },
  limit: { label: "Session Limit", variant: "r" },
};

export default async function TradingPlanPage() {
  const [rules, checklist] = await Promise.all([getTradingRules(), getChecklistItems()]);
  const entryRule = rules.find((r) => r.category === "entry");

  return (
    <>
      <PageIntro>The rules that govern every trade. No exceptions. No ambiguity.</PageIntro>

      <div className="g4" style={{ marginBottom: 14 }}>
        <StatCard label="Style" value="Systematic" sub="Process-driven" variant="at" valueColor="acc" valueSize="small" />
        <StatCard label="Instruments" value={<span style={{ color: "var(--blue)" }}>Futures</span>} sub="CL WTI · O/S/Fly" variant="bt" valueSize="small" />
        <StatCard label="Risk Per Trade" value={<span style={{ color: "var(--blue)" }}>1%</span>} sub="of capital" variant="bt" />
        <StatCard label="Daily Stop" value="2K" sub="or 2 failed trades" variant="rt" valueColor="neg" />
      </div>

      <SectionHeader title="Core Trading Rules" sub={`${rules.length} rules defined`} />

      {rules.map((rule) => {
        const tagMeta = CATEGORY_TAG[rule.category];
        return (
          <div key={rule.id} className={`rule-card ${CATEGORY_CLASS[rule.category]}`}>
            <div className="rc-label">
              <span>Rule {rule.rule_number}</span>
              <Tag variant={tagMeta.variant}>{tagMeta.label}</Tag>
            </div>
            <div className="rc-title">{rule.title}</div>
            <div className="rc-body">{renderInline(rule.body)}</div>
            {rule.tags.length > 0 && (
              <div className="rc-tags">
                {rule.tags.map((t) => (
                  <Tag key={t} variant={autoTagVariant(t)}>{t}</Tag>
                ))}
              </div>
            )}
            {rule.category === "entry" && entryRule?.id === rule.id && (
              <div style={{ marginTop: 12 }}>
                <PreTradeChecklist items={checklist} />
              </div>
            )}
          </div>
        );
      })}

      <SectionHeader title="Session Structure" />
      <Card>
        <div className="sess-row">
          <div className="sess-icon">◑</div>
          <div>
            <div className="sess-phase">Pre-Session</div>
            <div className="sess-items">
              Review market context · Check outright direction bias · Identify potential ORB range or VWAP levels · Confirm no session limit breach from prior day · Complete any pending reviews
            </div>
          </div>
        </div>
        <div className="sess-row">
          <div className="sess-icon">◉</div>
          <div>
            <div className="sess-phase">During Session</div>
            <div className="sess-items">
              Execute plan only · Run Pre-Trade Checklist before every entry · Monitor assumption validity · Apply Playbook rules in real time · Log all trades immediately
            </div>
          </div>
        </div>
        <div className="sess-row">
          <div className="sess-icon">◷</div>
          <div>
            <div className="sess-phase">Post-Session</div>
            <div className="sess-items">
              Review all trades · Tag process quality (Good/Bad/Lucky/Unlucky) · Note what assumption held/broke · Feed Feedback Loop · Update session P&L
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
