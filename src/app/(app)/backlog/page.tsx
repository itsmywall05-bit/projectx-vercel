import { PageIntro, SectionHeader, Card } from "@/components/ui";
import { getBacklogItems } from "@/lib/data/queries";

export default async function BacklogPage() {
  const items = await getBacklogItems();

  return (
    <>
      <PageIntro>Ideas surfaced as the mind evolves. Nothing lost.</PageIntro>

      <SectionHeader title="Feature Ideas" sub={`${items.length} ideas`} />

      <Card>
        {items.map((item) => (
          <div key={item.id} className="bl">
            <div className="bl-box" />
            <div className="bl-t">{item.title}</div>
            <div className="bl-c">{item.category}</div>
          </div>
        ))}
      </Card>
    </>
  );
}
