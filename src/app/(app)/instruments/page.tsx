import { PageIntro, SectionHeader, Highlight, Card } from "@/components/ui";
import { Tag } from "@/components/ui/Tag";
import { getInstruments } from "@/lib/data/queries";
import type { InstrumentType } from "@/lib/data/types";
import InstrumentRelationships from "@/components/instruments/InstrumentRelationships";

const TYPE_TAG: Record<InstrumentType, { variant: "c" | "y" | "b" | "p"; label: string }> = {
  underlying: { variant: "c", label: "CL" },
  outright: { variant: "y", label: "Outright" },
  spread: { variant: "b", label: "Spread" },
  fly: { variant: "p", label: "Fly" },
};

export default async function InstrumentsPage() {
  const instruments = await getInstruments();
  const root = instruments.find((i) => i.type === "underlying");
  const children = instruments.filter((i) => i.parent_id === root?.id);

  return (
    <>
      <PageIntro>The products you trade. The structure of the book. How instruments relate to each other.</PageIntro>

      <Highlight tone="c">
        Futures contracts on energy markets. Complexity hierarchy: Outright → Spread → Fly. Each level up adds a leg and changes the risk profile significantly.
      </Highlight>

      <SectionHeader title="Instrument Universe" sub="CL WTI Family" />

      <div className="inst-tree">
        {root && (
          <div className="it-root">
            <div className="it-root-label">
              <Tag variant="c">{root.symbol}</Tag>
              <span>{root.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--muted)" }}>TT · RTD via Excel</span>
            </div>
            {root.notes && <div className="it-root-sub">{root.notes}</div>}
          </div>
        )}

        <div className="it-children">
          {children.map((child) => {
            const meta = TYPE_TAG[child.type];
            return (
              <div key={child.id} className="it-child">
                <div className="it-child-name">
                  <Tag variant={meta.variant}>{meta.label}</Tag>
                  <span>
                    {child.symbol} — {child.name}
                  </span>
                </div>
                {child.formula && <div className="it-child-formula">{child.formula}</div>}
                {child.notes && (
                  <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.6 }}>
                    {child.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <SectionHeader title="Instrument Relationships" />
      <InstrumentRelationships />

      <Highlight tone="b">
        The Playbook Rule 1 is anchored to the <strong>main outright</strong> of the product currently in focus. When the outright is too aggressive in one direction, it distorts the spread and fly environment — pulling or holding short-side entries is the appropriate defensive response.
      </Highlight>
    </>
  );
}
