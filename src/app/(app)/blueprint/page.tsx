import { PageIntro, SectionHeader, Card } from "@/components/ui";

export default function BlueprintPage() {
  return (
    <>
      <PageIntro>The source of truth. How projectX thinks about itself.</PageIntro>

      <div className="g2">
        <div>
          <SectionHeader title="Core Philosophy" />
          <Card className="mb">
            <div className="princ"><div className="pr-nn">1</div><div className="pr-b2"><div className="pr-t2">Process over outcome</div><div className="pr-tx">A bad trade done correctly is still a good trade. Process quality is logged independently of result. Always.</div></div></div>
            <div className="princ"><div className="pr-nn">2</div><div className="pr-b2"><div className="pr-t2">Everything gets logged</div><div className="pr-tx">No undocumented decision. The mind cannot learn from what it doesn&apos;t see.</div></div></div>
            <div className="princ"><div className="pr-nn">3</div><div className="pr-b2"><div className="pr-t2">Feedback closes the loop</div><div className="pr-tx">Review → learn → adjust. The loop must close or experience doesn&apos;t compound.</div></div></div>
            <div className="princ"><div className="pr-nn">4</div><div className="pr-b2"><div className="pr-t2">The mind evolves</div><div className="pr-tx">New features, context, and learnings fold in continuously. Nothing is static.</div></div></div>
            <div className="princ"><div className="pr-nn">5</div><div className="pr-b2"><div className="pr-t2">Defer gracefully</div><div className="pr-tx">Things not ready get parked, not forgotten. The Deferred Queue is first-class.</div></div></div>
          </Card>
        </div>
        <div>
          <SectionHeader title="What projectX Is — v0.3" />
          <Card className="mb">
            <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.85 }}>
              projectX is the trader&apos;s <span style={{ color: "var(--text)" }}>one stop place</span> for everything. Not a tool — a <span style={{ color: "var(--text)" }}>living mind</span> that operates alongside you.<br /><br />
              It knows your <span style={{ color: "var(--accent)" }}>rules</span> (PreTrade checklist, 1.5:1 minimum, 1% sizing, 2K stop). It knows your <span style={{ color: "var(--blue)" }}>instruments</span> (CL WTI — outrights, spreads, flies). It has your <span style={{ color: "var(--teal)" }}>strategies</span> (ORB, VWAP Std Scalp). It has your <span style={{ color: "var(--cyan)" }}>Playbook</span>.<br /><br />
              The <span style={{ color: "var(--purple)" }}>Side Brain</span> watches the whole system and surfaces gaps — right now it knows your checklist items need confirmation and your Playbook trigger needs quantification.<br /><br />
              As data flows in, the <span style={{ color: "var(--teal)" }}>Learning Engine</span> compounds. projectX gets smarter alongside you — not just a record-keeper, but a <span style={{ color: "var(--text)" }}>thinking companion</span>.
            </div>
          </Card>
          <SectionHeader title="Conventions" />
          <Card>
            <div className="fi"><div className="fd sy" /><div className="fb"><div className="ft">Sub-projects</div><div className="fm">SP-01 → SP-18 (growing)</div></div></div>
            <div className="fi"><div className="fd sm" /><div className="fb"><div className="ft">Deferred items</div><div className="fm">DQ-001, DQ-002 ...</div></div></div>
            <div className="fi"><div className="fd sg" /><div className="fb"><div className="ft">Strategies</div><div className="fm">ST-01 ORB · ST-02 VWAP Std Scalp</div></div></div>
            <div className="fi"><div className="fd" style={{ background: "var(--cyan)" }} /><div className="fb"><div className="ft">Playbook rules</div><div className="fm">PB-01 · PB-02 ... (growing)</div></div></div>
          </Card>
        </div>
      </div>
    </>
  );
}
