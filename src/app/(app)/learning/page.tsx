import { PageIntro, SectionHeader, Card } from "@/components/ui";
import { Tag } from "@/components/ui/Tag";
import { getPrinciples } from "@/lib/data/queries";

export default async function LearningPage() {
  const principles = await getPrinciples();

  return (
    <>
      <PageIntro>projectX learns. What it learns, it surfaces. Knowledge compounds alongside the system.</PageIntro>

      <div className="g2">
        <div>
          <SectionHeader title="Principles — Live" sub={`${principles.length} absorbed`} />
          <Card className="mb">
            {principles.map((p) => (
              <div key={p.id} className="le-item">
                <div className="le-n">{p.number}</div>
                <div className="le-b">
                  <div className="le-t">{p.title}</div>
                  <div className="le-d">{p.body}</div>
                  {p.source && <div className="le-s">Source · {p.source}</div>}
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <SectionHeader title="Learning Queue" />
          <Card className="mb">
            <div className="fi"><div className="fd sm" /><div className="fb"><div className="ft">ORB edge validation by range size</div><div className="fm">Activates after 20+ ORB trades logged</div></div></div>
            <div className="fi"><div className="fd sm" /><div className="fb"><div className="ft">VWAP mean-reversion rate by market regime</div><div className="fm">Activates after 20+ VWAP trades logged</div></div></div>
            <div className="fi"><div className="fd sm" /><div className="fb"><div className="ft">Spread vs outright performance comparison</div><div className="fm">Activates when both types have 10+ trades</div></div></div>
            <div className="fi"><div className="fd sm" /><div className="fb"><div className="ft">Playbook Rule 1 effectiveness measurement</div><div className="fm">How often aggressive outright preceded failed short entries?</div></div></div>
            <div className="fi"><div className="fd sm" /><div className="fb"><div className="ft">Process quality → outcome correlation</div><div className="fm">Activates after 30+ tagged trades</div></div></div>
          </Card>

          <SectionHeader title="Knowledge Areas" />
          <Card>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <Tag variant="g">Risk management</Tag>
              <Tag variant="b">Futures structure</Tag>
              <Tag variant="y">Opening range dynamics</Tag>
              <Tag variant="c">VWAP theory</Tag>
              <Tag variant="p">Calendar spreads</Tag>
              <Tag variant="p">Butterfly spreads</Tag>
              <Tag variant="a">Session limits</Tag>
              <Tag variant="r">Assumption-based exits</Tag>
              <Tag>More as system grows</Tag>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
