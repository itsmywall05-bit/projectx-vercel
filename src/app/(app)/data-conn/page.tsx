import { PageIntro, SectionHeader, Highlight } from "@/components/ui";

export default function DataConnPage() {
  return (
    <>
      <PageIntro>How projectX receives market data. Current stage and future path.</PageIntro>

      <SectionHeader title="Current Stage" />

      <div className="dc-card">
        <div className="dc-header">
          <div className="dc-icon">📊</div>
          <div className="dc-name">Excel File + TT RTD</div>
          <div className="dc-status dc-active">Active Stage</div>
        </div>
        <div className="dc-body">
          Excel file fetches live prices from <strong>Trading Technologies (TT)</strong> via RTD (Real-Time Data) feature. The Excel file acts as the current data layer — maintaining relevant market data and prices.<br /><br />
          <strong>The Bridge (Active):</strong> We have established a live data bridge! Excel runs a background macro that continuously pushes (POSTs) the RTD prices to our new <code>/api/prices</code> endpoint. The Live Risk Engine in the Trade Log listens to this endpoint to calculate your real-time <code>Curr_Risk</code> and <code>Max_Risk</code>.<br /><br />
          <strong>What Excel + TT RTD provides:</strong> Live futures prices (CL outrights, spreads, flies), triggering real-time risk updates in the web application without a direct TT API.
        </div>
      </div>

      <SectionHeader title="Future Path" />
      <div className="dc-card">
        <div className="dc-header">
          <div className="dc-icon">⚡</div>
          <div className="dc-name">TT Direct API / Websocket</div>
          <div className="dc-status dc-parked">Deferred → DQ-001</div>
        </div>
        <div className="dc-body">
          Direct integration with TT platform API — live prices, order flow, position data streamed directly into projectX without the Excel intermediary. Enables real-time Risk Console, live P&L in Mind Feed, and automated Playbook triggers.<br /><br />
          <strong>Parked until:</strong> Excel stage is working smoothly and the need for direct connectivity is clearly felt.
        </div>
      </div>

      <Highlight tone="a">
        DQ-001 has been updated — it&apos;s no longer just &quot;decide connectivity later.&quot; Current stage is Excel + TT RTD. Direct TT integration remains deferred for Phase 5+.
      </Highlight>
    </>
  );
}
