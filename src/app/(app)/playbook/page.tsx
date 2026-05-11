import { PageIntro, SectionHeader, Highlight, Card } from "@/components/ui";
import { Tag, autoTagVariant } from "@/components/ui/Tag";
import { renderInline } from "@/components/ui/markdown";
import { getPlaybookRules } from "@/lib/data/queries";

export default async function PlaybookPage() {
  const rules = await getPlaybookRules();

  return (
    <>
      <PageIntro>Pre-defined responses to specific market scenarios. When X happens, you do Y. No in-the-moment decisions.</PageIntro>

      <Highlight tone="c">
        The Playbook removes decision-making under pressure. Each rule is a pre-committed response to a market condition that has been thought through in advance — when conditions are calm, not reactive.
      </Highlight>

      <SectionHeader title="Active Playbook Rules" sub={`${rules.length} rule${rules.length === 1 ? "" : "s"} live`} />

      {rules.map((rule, idx) => (
        <div key={rule.id} className="pb-card">
          <div className="pb-num">{String(idx + 1).padStart(2, "0")}</div>
          <div className="pb-trigger-label">{rule.trigger_label}</div>
          <div className="pb-trigger">{rule.trigger_title}</div>

          <div className="pb-condition">
            <div className="pb-cond-label">What &quot;Aggressive Bullish&quot; Means</div>
            <div className="pb-cond-text">{renderInline(rule.trigger_definition)}</div>
          </div>

          <div className="pb-actions">
            {rule.actions.map((action, ai) => (
              <div key={ai} className="pb-action">
                <div className="pb-a-icon">{action.icon}</div>
                <div className="pb-a-body">
                  <div className="pb-a-label">{action.label}</div>
                  <div className="pb-a-text">{renderInline(action.text)}</div>
                </div>
              </div>
            ))}
          </div>

          {rule.tags.length > 0 && (
            <div style={{ marginTop: 9 }}>
              {rule.tags.map((t) => (
                <Tag key={t} variant={autoTagVariant(t)}>{t}</Tag>
              ))}
            </div>
          )}
        </div>
      ))}

      <SectionHeader title="Playbook Backlog" sub="to be built" />
      <Card>
        <div className="fi">
          <div className="fd sm" />
          <div className="fb">
            <div className="ft" style={{ color: "var(--muted2)" }}>Aggressive bearish outright → pull long-side entries</div>
            <div className="fm">Mirror of Rule 01 — to be formalized</div>
          </div>
        </div>
        <div className="fi">
          <div className="fd sm" />
          <div className="fb">
            <div className="ft" style={{ color: "var(--muted2)" }}>Post-session limit hit → forced stop conditions</div>
            <div className="fm">How to handle session end procedurally</div>
          </div>
        </div>
        <div className="fi">
          <div className="fd sm" />
          <div className="fb">
            <div className="ft" style={{ color: "var(--muted2)" }}>False ORB signal confirmed → reverse playbook</div>
            <div className="fm">When the ORB breakout fails and reversal is in play</div>
          </div>
        </div>
      </Card>
    </>
  );
}
