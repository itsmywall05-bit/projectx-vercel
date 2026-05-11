import { PageIntro, SectionHeader, Highlight } from "@/components/ui";
import { getDeferredItems } from "@/lib/data/queries";

export default async function DeferredPage() {
  const items = await getDeferredItems();

  return (
    <>
      <PageIntro>Parked with intention. Nothing disappears.</PageIntro>

      <Highlight tone="a">
        {items.length} items parked. DQ-001 has been updated — Excel + TT RTD is the current active stage. Direct TT integration remains deferred.
      </Highlight>

      <SectionHeader title="Deferred Items" sub={`${items.length} items`} />

      {items.map((item) => (
        <div key={item.id} className="dq">
          <div className="dq-id">{item.code}</div>
          <div className="dq-b">
            <div className="dq-t">{item.title}</div>
            {item.reason && <div className="dq-m">{item.reason}</div>}
          </div>
          <div className="dq-c">{item.category}</div>
        </div>
      ))}
    </>
  );
}
