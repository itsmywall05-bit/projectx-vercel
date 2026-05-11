import { PageIntro, StubPage } from "@/components/ui";

export default function PerformancePage() {
  return (
    <>
      <PageIntro>Numbers need context. Context requires data. Data comes with logging.</PageIntro>
      <StubPage
        icon="◈"
        title="Performance Lab"
        phase="Phase 3"
        text="P&L · Equity curve · Win rate · Expectancy · R:R distribution · Strategy breakdown · Process quality vs outcome analysis."
      />
    </>
  );
}
