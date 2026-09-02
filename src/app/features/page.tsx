import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import {
  ActionButton,
  Card,
  CardGrid,
  PageIntro,
  PromptRow,
  Section,
} from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "Features",
  description:
    "The four publisher modes, the plugin directory, and the skills system — what Fennic AI does.",
};

const PROMPTS = [
  "Research the market for home batteries and give me a report with citations",
  "Build a playable snake game with a leaderboard",
  "Turn last quarter's numbers into a dashboard I can filter",
] as const;

export default function FeaturesPage() {
  return (
    <PageShell title="Features">
      <PageIntro
        eyebrow="About Us"
        title="Features"
        lede="One composer, four modes of work. Everything below opens from the sidebar and runs in the same chat."
      >
        <ActionButton href="/deep-research">Try Deep Research</ActionButton>
        <ActionButton href="/websites" variant="secondary">
          Browse Websites
        </ActionButton>
      </PageIntro>

      <Section heading="The modes">
        <CardGrid columns={2}>
          <Card
            icon="deep-research"
            title="Deep Research"
            body="Describe a question, get a sourced report — literature, market or due-diligence — with citations you can follow."
            meta="Featured cases under the composer"
          />
          <Card
            icon="websites"
            title="Websites"
            body="Describe a site and get one: playable games, visualisations, dashboards, tools and landing pages, each with a real backend."
            meta="Filterable by category"
          />
          <Card
            icon="sheets"
            title="Sheets"
            body="Spreadsheets and dashboards built from a description — formulas wired, filters working, data populated."
            meta="Three starting points"
          />
          <Card
            icon="design"
            title="Design"
            body="Images, mockups and brand assets in the browser. What you approve can move straight into a Website build."
            meta="Shared with Websites"
          />
        </CardGrid>
      </Section>

      <Section
        heading="The system underneath"
        description="What every mode can draw on."
      >
        <CardGrid columns={3}>
          <Card
            icon="plugins"
            title="Plugins"
            body="Scoped, revocable connections to search, storage, databases and anything that speaks HTTP. Every call is logged."
            meta="18 in the directory"
          />
          <Card
            icon="my-kimi"
            title="Skills"
            body="Repeatable procedures you add once and reuse everywhere — report formats, review checklists, deployment recipes."
            meta="Featured registry"
          />
          <Card
            icon="new-project"
            title="Projects"
            body="Group related chats so a mode's output — a site, a report — stays with the conversation that made it."
            meta="Select project in the composer"
          />
        </CardGrid>
      </Section>

      <Section
        heading="Try one now"
        description="Each of these opens a mode's composer with the work already framed."
      >
        <div className="flex flex-col gap-2">
          {PROMPTS.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} />
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
