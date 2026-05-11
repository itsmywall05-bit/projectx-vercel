import { PageIntro, SectionHeader, Card } from "@/components/ui";

export default function GeneralPlanPage() {
  return (
    <>
      <PageIntro>The big picture. Where this journey is headed. How the trader grows.</PageIntro>

      <div className="g6040">
        <div>
          <SectionHeader title="Long-Term Timeline" />
          <Card className="mb">
            <div className="tl future">
              <div className="tl-h"><div className="tl-tm">Aspiration</div><div className="tl-ti">The trader I&apos;m building toward</div></div>
              <div className="tl-bd" style={{ color: "var(--muted2)" }}>
                Add your vision — what does the fully evolved version of your trading look like? What kind of book, what kind of P&L profile, what kind of consistency?
              </div>
            </div>
            <div className="tl future">
              <div className="tl-h"><div className="tl-tm">Wannabe Trades</div><div className="tl-ti">Setups to aspire toward</div></div>
              <div className="tl-bd" style={{ color: "var(--muted2)" }}>
                Complex flies, high-conviction outrights, large-R-multiple setups — trades you&apos;re not ready for yet but are building toward.
              </div>
            </div>
            <div className="tl active">
              <div className="tl-h"><div className="tl-tm">Now — Phase 0/1</div><div className="tl-ti">Systematic foundation being built</div></div>
              <div className="tl-bd">
                Instruments: CL WTI futures (Outrights, Spreads, Flies) · Strategies: ORB + VWAP Std Scalp documented · Rules: 5 core rules live · Data: Excel + TT RTD
              </div>
            </div>
            <div className="tl done">
              <div className="tl-h"><div className="tl-tm">Foundation</div><div className="tl-ti">projectX initialized</div></div>
              <div className="tl-bd">The mind has been built. Rules documented. Instruments mapped. System live.</div>
            </div>
          </Card>
          <SectionHeader title="Wannabe Trades Log" />
          <Card>
            <div className="fi">
              <div className="fd sp" />
              <div className="fb">
                <div className="ft" style={{ color: "var(--muted2)" }}>No wannabe trades logged yet</div>
                <div className="fm">Add aspirational setups — future-you territory</div>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <SectionHeader title="Trader Goals" />
          <Card className="mb">
            <div className="pw"><div className="plb"><span>Build consistent process</span><span style={{ color: "var(--accent)" }}>20%</span></div><div className="pb"><div className="pf pfy" style={{ width: "20%" }} /></div></div>
            <div className="pw"><div className="plb"><span>Strategy documentation</span><span style={{ color: "var(--blue)" }}>40%</span></div><div className="pb"><div className="pf pfb" style={{ width: "40%" }} /></div></div>
            <div className="pw"><div className="plb"><span>Live trade logging</span><span>0%</span></div><div className="pb"><div className="pf pfg" style={{ width: "0%" }} /></div></div>
            <div className="pw"><div className="plb"><span>Risk rules defined</span><span style={{ color: "var(--accent)" }}>80%</span></div><div className="pb"><div className="pf pfy" style={{ width: "80%" }} /></div></div>
            <div className="pw"><div className="plb"><span>Playbook rules</span><span style={{ color: "var(--cyan)" }}>10%</span></div><div className="pb"><div className="pf pfc" style={{ width: "10%" }} /></div></div>
          </Card>
          <SectionHeader title="Trader Attributes" />
          <Card>
            <div className="pw"><div className="plb"><span>Discipline</span><span style={{ color: "var(--muted2)" }}>pending data</span></div><div className="pb"><div className="pf pfp" style={{ width: "0%" }} /></div></div>
            <div className="pw"><div className="plb"><span>Process Quality</span><span style={{ color: "var(--muted2)" }}>pending data</span></div><div className="pb"><div className="pf pfg" style={{ width: "0%" }} /></div></div>
            <div className="pw"><div className="plb"><span>Consistency</span><span style={{ color: "var(--muted2)" }}>pending data</span></div><div className="pb"><div className="pf pfy" style={{ width: "0%" }} /></div></div>
            <div className="pw"><div className="plb"><span>Knowledge Depth</span><span style={{ color: "var(--blue)" }}>12%</span></div><div className="pb"><div className="pf pfb" style={{ width: "12%" }} /></div></div>
          </Card>
        </div>
      </div>
    </>
  );
}
