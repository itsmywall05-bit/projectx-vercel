import { PageIntro, SectionHeader, Highlight, Card } from "@/components/ui";

export default function BacktestPage() {
  return (
    <>
      <PageIntro>Validate the edge. Two strategies documented. Awaiting data to run.</PageIntro>

      <Highlight tone="a">
        Data source for backtesting: Excel file fetching prices via TT RTD. When sufficient historical data is available, both strategies will be run against it. Results feed back into Strategy Vault and edge hypotheses.
      </Highlight>

      <SectionHeader title="Backtest Frameworks" sub="2 strategies" />

      <Card variant="at" className="mb">
        <div className="cl">ST-01 Backtest</div>
        <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
          Opening Range Breakout — Test Framework
        </div>
        <div className="g2" style={{ marginBottom: 10 }}>
          <div className="sc-section">
            <div className="sc-section-label">What to Test</div>
            <div className="sc-section-body">
              · Win rate on continuation breakouts<br />
              · Win rate on false signal reversals<br />
              · Average R:R achieved vs 1.5 target<br />
              · Best time-of-day for setup quality<br />
              · Behavior in different market regimes
            </div>
          </div>
          <div className="sc-section">
            <div className="sc-section-label">Parameters to Track</div>
            <div className="sc-section-body">
              · Opening range size (small vs large)<br />
              · Time of breakout candle (early vs late session)<br />
              · Outright directional context at time of setup<br />
              · Volume at breakout point<br />
              · False signal frequency by range size
            </div>
          </div>
        </div>
        <div className="g4" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>TRADES NEEDED</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--amber)" }}>30+</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>DATA STATUS</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--muted)" }}>Pending</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>WIN RATE</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--muted)" }}>—</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>AVG R:R</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--muted)" }}>—</div>
          </div>
        </div>
      </Card>

      <Card variant="bt" className="mb">
        <div className="cl">ST-02 Backtest</div>
        <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
          VWAP Std Scalp — Test Framework
        </div>
        <div className="g2" style={{ marginBottom: 10 }}>
          <div className="sc-section">
            <div className="sc-section-label">What to Test</div>
            <div className="sc-section-body">
              · Reversion success rate from ±2 SD<br />
              · Reversion success rate from ±1 SD<br />
              · How often price reaches full opposite SD target<br />
              · Performance in ranging vs trending days<br />
              · Optimal entry timing (touch vs close beyond band)
            </div>
          </div>
          <div className="sc-section">
            <div className="sc-section-label">Parameters to Track</div>
            <div className="sc-section-body">
              · Market regime at time of trade (ranging / trending)<br />
              · Distance from VWAP at entry<br />
              · Time of day (intraday VWAP drift factor)<br />
              · SD band touched (±1 vs ±2)<br />
              · Outright context at time of setup
            </div>
          </div>
        </div>
        <div className="g4" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>TRADES NEEDED</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--amber)" }}>30+</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>DATA STATUS</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--muted)" }}>Pending</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>WIN RATE</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--muted)" }}>—</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: "var(--muted)", marginBottom: 4 }}>AVG R:R</div>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "var(--muted)" }}>—</div>
          </div>
        </div>
      </Card>

      <Highlight tone="t">
        Once trading data flows in via Excel + TT RTD, these frameworks get populated. The backtest results directly update the Strategy Vault edge hypotheses and feed the Learning Engine.
      </Highlight>
    </>
  );
}
