"use client";

import { PageIntro } from "@/components/ui";
import DeltaMatrix from "@/components/DeltaMatrix";
import CurveShapes from "@/components/CurveShapes";

export default function WatchlistPage() {
  return (
    <>
      <PageIntro>What you&apos;re watching. What must happen before you act.</PageIntro>
      <DeltaMatrix />
      <CurveShapes product="CL" />
    </>
  );
}
