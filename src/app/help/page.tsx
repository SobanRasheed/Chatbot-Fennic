import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import {
  ActionButton,
  Card,
  CardGrid,
  PageIntro,
  PromptRow,
  Section,
  Steps,
} from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "How Fennic's modes, plugins and skills fit together — and where to look when something doesn't.",
};

const FIRST_STEPS = [
  {
    title: "Start in a mode",
    body: "New Chat is the general composer. Deep Research, Websites, Sheets and Design each open the same composer pre-set for that kind of work — the placeholder tells you what to describe.",
  },
  {
    title: "Give it the tools",
    body: "Plugins connect Fennic to search, storage, databases and calendars. Skills teach it a repeatable procedure. Both live in My Fennic.",
  },
  {
    title: "Keep what works",
    body: "A good result is a starting point. Ask for changes in the same chat — Fennic keeps the full context of what it just built.",
  },
  {
    title: "Watch the record",
    body: "Every plugin call is logged with its arguments and result. If an answer surprises you, the trail is in the run.",
  },
] as const;

const PROMPTS = [
  "What's the difference between a plugin and a skill?",
  "How do I get a research report with citations?",
  "Can Fennic remember things between chats?",
] as const;

export default function HelpPage() {
  return (
    <PageShell title="Help Center">
      <PageIntro
        eyebrow="Get Help"
        title="Help Center"
        lede="Short answers to how Fennic works, and where each piece lives. If your question isn't here, the shortcuts at the bottom of the sidebar all lead somewhere useful."
      >
        <ActionButton href="/features">See what Fennic can do</ActionButton>
        <ActionButton href="/settings" variant="secondary">
          Open Settings
        </ActionButton>
      </PageIntro>

      <Section heading="First steps" description="The ten-minute tour.">
        <Steps items={FIRST_STEPS} />
      </Section>

      <Section
        heading="The pieces"
        description="Which surface does what."
      >
        <CardGrid columns={3}>
          <Card
            icon="new-chat"
            title="New Chat"
            body="The general composer. Anything you can describe, it takes — from a question to a working site."
            meta="Sidebar · Ctrl K"
          />
          <Card
            icon="my-kimi"
            title="My Fennic"
            body="Your companion view: activity, the plugins it can reach, and the skills you've taught it."
            meta="Sidebar · My Fennic"
          />
          <Card
            icon="plugins"
            title="Plugins & Skills"
            body="Plugins connect services; skills encode procedures. Scoped, revocable, logged."
            meta="My Fennic · tabs"
          />
        </CardGrid>
      </Section>

      <Section heading="Common questions">
        <div className="flex flex-col gap-2">
          {PROMPTS.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} />
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
