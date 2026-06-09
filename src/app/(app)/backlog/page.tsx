import { PageIntro, SectionHeader, Card } from "@/components/ui";
import TDForm from "@/components/backlog/TDForm";
import BacklogList from "@/components/backlog/BacklogList";
import { getBacklogItems } from "@/lib/data/queries";

export default async function BacklogPage() {
  const items = await getBacklogItems();

  return (
    <>
      <PageIntro>Ideas surfaced as the mind evolves. Nothing lost.</PageIntro>

      <SectionHeader title="Feature Ideas" sub={`${items.length} ideas`} />

      <Card>
        <BacklogList items={items} />
      </Card>

      <div className="mt-6">
        <TDForm />
      </div>
    </>
  );
}
