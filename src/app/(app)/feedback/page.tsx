import { PageIntro, SectionHeader } from "@/components/ui";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { getFeedbackEntries } from "@/lib/data/queries";

export default async function FeedbackPage() {
  const feedback = await getFeedbackEntries();
  const nextSessionNumber =
    feedback.length > 0
      ? Math.max(...feedback.map((entry) => entry.session_number)) + 1
      : 1;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageIntro>Review. Learn. Adjust. The loop closes here.</PageIntro>
      <FeedbackForm initialSessionNumber={nextSessionNumber} initialDate={today} />

      <SectionHeader title="Feedback history" sub="Recent EOD reviews" />
      {feedback.map((entry) => (
        <div key={entry.id} className="card" style={{ marginBottom: 14 }}>
          <div className="cl">
            Session {entry.session_number} · {entry.session_date}
          </div>
          <div className="cv">Feedback review</div>
          <div className="cs" style={{ marginBottom: 10 }}>
            {entry.tags?.length ? entry.tags.join(" · ") : "No tags"}
          </div>
          {entry.went_well ? (
            <div style={{ marginBottom: 8 }}>
              <strong>What went well:</strong>
              <div>{entry.went_well}</div>
            </div>
          ) : null}
          {entry.didnt_go_well ? (
            <div style={{ marginBottom: 8 }}>
              <strong>What didn't go well:</strong>
              <div>{entry.didnt_go_well}</div>
            </div>
          ) : null}
          {entry.to_improve ? (
            <div style={{ marginBottom: 8 }}>
              <strong>What to improve:</strong>
              <div>{entry.to_improve}</div>
            </div>
          ) : null}
          {entry.mistake ? (
            <div style={{ marginBottom: 8 }}>
              <strong>Mistake:</strong>
              <div>{entry.mistake}</div>
            </div>
          ) : null}
          {entry.learning ? (
            <div style={{ marginBottom: 8 }}>
              <strong>Learning:</strong>
              <div>{entry.learning}</div>
            </div>
          ) : null}
          {!entry.went_well && !entry.didnt_go_well && !entry.to_improve && !entry.mistake && !entry.learning ? (
            <div>{entry.body}</div>
          ) : null}
        </div>
      ))}
    </>
  );
}
