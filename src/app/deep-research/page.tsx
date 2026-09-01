import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import {
  ActionButton,
  Badge,
  Card,
  CardGrid,
  PageIntro,
  PromptRow,
  Section,
  Steps,
} from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "Deep Research",
  description:
    "Give Fennic a question worth an afternoon. It plans, searches, reads, cross-checks and returns a cited report you can argue with.",
};

const RUN_STAGES = [
  {
    title: "It restates the question",
    body: "Before searching, Fennic writes back what it thinks you asked and what would count as an answer. Correct it here and the whole run changes course cheaply.",
  },
  {
    title: "It plans, then searches",
    body: "The question is decomposed into sub-questions, each with its own searches. You watch the plan fill in rather than staring at a spinner.",
  },
  {
    title: "It reads and cross-checks",
    body: "Sources are read in full, not skimmed from snippets. Claims that only one source makes are flagged as such instead of being laundered into fact.",
  },
  {
    title: "It writes with its work shown",
    body: "Every assertion carries a citation, and the working notes stay attached — including the searches that found nothing, which is often the useful part.",
  },
] as const;

const PROMPTS = [
  "How did on-device inference change phone hardware roadmaps between 2023 and today?",
  "Compare the three leading approaches to grid-scale storage on cost per delivered kWh",
  "What actually happened to the companies that raised Series A on no revenue in 2021?",
  "Trace the regulatory history of the right to repair in the EU, with primary sources",
] as const;

export default function DeepResearchPage() {
  return (
    <PageShell
      title="Deep Research"
      icon="deep-research"
      action={<Badge>Runs 5–40 min</Badge>}
    >
      <PageIntro
        eyebrow="Agentic research"
        title="Deep Research"
        lede="Ask something you would otherwise assign to a person for an afternoon. Fennic plans the enquiry, reads real sources end to end, contradicts itself where the evidence is thin, and hands back a report with every claim traceable."
      >
        <ActionButton href="/">Start a run</ActionButton>
        <ActionButton href="/plugins" variant="secondary">
          Give it your own sources
        </ActionButton>
      </PageIntro>

      <Section
        heading="What comes back"
        description="One run, four artefacts. All of them yours to export."
        icon="deep-research"
      >
        <CardGrid>
          <Card
            icon="new-chat"
            title="The report"
            body="Structured prose with inline citations, a stated methodology, and an explicit list of what it could not determine."
          />
          <Card
            icon="attach"
            title="The source ledger"
            body="Every document opened, when it was published, and which paragraph supports which claim. Dead links are recorded as dead, not silently dropped."
          />
          <Card
            icon="sheets"
            title="Extracted data"
            body="Any figures the report leans on, pulled into a sheet you can re-sort, chart or check by hand."
            href="/sheets"
          />
          <Card
            icon="websites"
            title="A shareable page"
            body="One click turns the report into a hosted, readable site — useful when the audience is a team rather than a chat."
            href="/websites"
          />
        </CardGrid>
      </Section>

      <Section
        heading="How a run works"
        description="You can interrupt at any stage; it resumes from where you cut in."
      >
        <Steps items={RUN_STAGES} />
      </Section>

      <Section
        heading="Questions that suit it"
        description="Broad, contested, or spread across more sources than one sitting allows."
      >
        <div className="flex flex-col gap-2">
          {PROMPTS.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} />
          ))}
        </div>
      </Section>

      <Section
        heading="Where it struggles"
        description="Stated plainly, because a research tool that hides its limits is worse than none."
      >
        <CardGrid>
          <Card
            title="Anything behind a paywall it cannot reach"
            body="Fennic will tell you a source exists and that it could not open it, rather than paraphrasing an abstract as if it read the paper."
          />
          <Card
            title="Very recent events"
            body="Reporting in the first hours is often wrong. Runs on breaking news are labelled provisional and will say so in the report."
          />
          <Card
            title="Numbers nobody published"
            body="If a figure only exists inside a private dataset, connect it as a plugin. Fennic estimates only when you ask it to, and marks the estimate."
          />
          <Card
            title="Questions with no answer"
            body="Some enquiries end in 'the evidence does not settle this'. That is a valid result here and the report will land on it."
          />
        </CardGrid>
      </Section>
    </PageShell>
  );
}
