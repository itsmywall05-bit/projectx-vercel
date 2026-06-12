import { PageIntro, SectionHeader, Highlight } from "@/components/ui";
import { Tag } from "@/components/ui/Tag";
import { getInstruments } from "@/lib/data/queries";
import InstrumentTiersSection from "@/components/instruments/InstrumentTiersSection";

export default async function InstrumentsPage() {
  const instruments = await getInstruments();
  const root = instruments.find((i) => i.type === "underlying");

  // Dedup by type — DB may have duplicate rows; keep first of each
  const seenTypes = new Set<string>();
  const uniqueChildren = instruments
    .filter((i) => i.parent_id === root?.id)
    .filter((i) => { if (seenTypes.has(i.type)) return false; seenTypes.add(i.type); return true; });

  const outright = uniqueChildren.find((i) => i.type === "outright") ?? null;

  return (
    <>
      <PageIntro>The products you trade. The structure of the book. How instruments relate to each other.</PageIntro>

      <Highlight tone="c">
        Futures contracts on energy markets. Complexity hierarchy: Outright → Spread → Fly → Double Fly → Drone → … Each level up adds a leg and removes one degree of directional exposure — isolating purer structural signals in the forward curve.
      </Highlight>

      {/* Root: CL underlying */}
      <SectionHeader title="Product" sub="CL WTI Family" />
      {root && (
        <div className="inst-tree">
          <div className="it-root">
            <div className="it-root-label">
              <Tag variant="c">{root.symbol}</Tag>
              <span>{root.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--muted)" }}>TT · RTD via Excel</span>
            </div>
            {root.notes && <div className="it-root-sub">{root.notes}</div>}
          </div>
        </div>
      )}

      {/* Universe + Relationships — shared limit dropdown (client component) */}
      <InstrumentTiersSection outright={outright} />

      <Highlight tone="b">
        The Playbook Rule 1 is anchored to the <strong>main outright</strong> of the product currently in focus. When the outright is too aggressive in one direction, it distorts the spread and fly environment — pulling or holding short-side entries is the appropriate defensive response.
      </Highlight>
    </>
  );
}
