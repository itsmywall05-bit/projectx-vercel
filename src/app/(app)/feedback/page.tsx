import { PageIntro, SectionHeader } from "@/components/ui";
import ReviewViewer from "@/components/feedback/ReviewViewer";
import { getFeedbackEntries } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

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
      <SectionHeader title="EOD Reviews" sub="One review at a time" />
      <ReviewViewer allFeedback={feedback} nextSessionNumber={nextSessionNumber} today={today} />
    </>
  );
}
