import { PageIntro, StubPage } from "@/components/ui";

export default function MarketContextPage() {
  return (
    <>
      <PageIntro>Know the environment. Know the sea before you sail.</PageIntro>
      <StubPage
        icon="◒"
        title="Market Context"
        phase="Phase 3"
        text="Macro notes · Regime (trending/ranging/volatile) · Sector themes · Key events (EIA, FOMC, geopolitical) · Your current market narrative for CL."
      />
    </>
  );
}
