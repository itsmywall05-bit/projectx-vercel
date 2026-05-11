import { PageIntro, SectionHeader, StatCard, Card } from "@/components/ui";

export default function MindFeedPage() {
  return (
    <>
      <PageIntro>What is happening now. What needs attention. Your daily check-in.</PageIntro>

      <div className="g4">
        <StatCard label="Open Positions" value="0" sub="No live trades" variant="tt" valueColor="pos" />
        <StatCard label="Watching" value="0" sub="Setups on radar" variant="at" valueColor="acc" />
        <StatCard label="Pending Reviews" value={<span style={{ color: "var(--amber)" }}>0</span>} sub="Sessions to review" variant="amt" />
        <StatCard label="Risk Used Today" value="—" sub="Excel feed ready" variant="rt" />
      </div>

      <SectionHeader title="Today's Feed" />
      <Card>
        <div className="fi">
          <div className="fd sg" />
          <div className="fb">
            <div className="ft">projectX v0.3 — Trading rules now live in system</div>
            <div className="fm">5 rules documented · ORB + VWAP strategies defined · Playbook Rule 1 active</div>
          </div>
          <div className="fti">Today</div>
        </div>
        <div className="fi">
          <div className="fd sy" />
          <div className="fb">
            <div className="ft">Action: Fill in Pre-Trade Checklist items</div>
            <div className="fm">Trading Plan Rule 1 references a checklist — checklist fields not yet defined</div>
          </div>
          <div className="fti">Now</div>
        </div>
        <div className="fi">
          <div className="fd sb" />
          <div className="fb">
            <div className="ft">Data: Excel + TT RTD connection mapped</div>
            <div className="fm">DQ-001 updated — Excel is current connectivity stage</div>
          </div>
          <div className="fti">Today</div>
        </div>
        <div className="fi">
          <div className="fd sm" />
          <div className="fb">
            <div className="ft">No active trades logged</div>
            <div className="fm">Trade Log building Phase 1</div>
          </div>
          <div className="fti">—</div>
        </div>
      </Card>
    </>
  );
}
