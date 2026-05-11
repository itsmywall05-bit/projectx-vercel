import { PageIntro, StubPage } from "@/components/ui";

export default function WatchlistPage() {
  return (
    <>
      <PageIntro>What you&apos;re watching. What must happen before you act.</PageIntro>
      <StubPage
        icon="◓"
        title="Watchlist Engine"
        phase="Phase 2"
        text="Assets on radar with thesis and trigger conditions. For CL: specific spread levels, fly curvature setups, outright areas of interest."
      />
    </>
  );
}
