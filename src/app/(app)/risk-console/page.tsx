import { PageIntro, Highlight, StubPage } from "@/components/ui";

export default function RiskConsolePage() {
  return (
    <>
      <PageIntro>Know your limits. Enforce them without exception.</PageIntro>
      <StubPage
        icon="◬"
        title="Risk Console"
        phase="Phase 2"
        text="Rules are already defined: 1% per trade, 2K daily stop, 2-trade fail limit. Phase 2 builds the live tracking interface against these rules."
      />
      <Highlight tone="r">
        Rules defined: 1% risk per trade · Daily stop: 2K loss OR 2 failed trades, whichever comes first · No override conditions.
      </Highlight>
    </>
  );
}
