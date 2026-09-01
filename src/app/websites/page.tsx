import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import {
  ActionButton,
  Badge,
  Card,
  CardGrid,
  EmptyState,
  PageIntro,
  PromptRow,
  Section,
  Steps,
  Tag,
} from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "Websites",
  description:
    "Describe a site and Fennic builds it, hosts it, and hands you the URL — then keeps editing it in plain language.",
};

const PIPELINE = [
  {
    title: "Describe it",
    body: "One paragraph is enough: what the page is for, who reads it, and anything non-negotiable about the look. Attach a logo or a screenshot if you have one.",
  },
  {
    title: "Watch it build",
    body: "Fennic writes real HTML, CSS and JavaScript in the open. No template picker, no drag-and-drop grid — you can read every line it produces.",
  },
  {
    title: "Get a live URL",
    body: "The site deploys as soon as the first pass finishes. Share it immediately; every later edit publishes over the same address.",
  },
  {
    title: "Keep talking to it",
    body: "'Make the hero warmer', 'add a pricing table', 'this is unreadable on my phone'. Changes are diffed, previewed and reversible.",
  },
] as const;

const PROMPTS = [
  "A one-page site for a two-person ceramics studio — warm, lots of photography, an enquiry form",
  "An interactive explainer of how a heat pump works, with a diagram I can scrub through",
  "A conference schedule page that survives being opened on a phone in a bad signal area",
] as const;

export default function WebsitesPage() {
  return (
    <PageShell
      title="Websites"
      icon="websites"
      action={<Badge>Hosted free</Badge>}
    >
      <PageIntro
        eyebrow="Publish"
        title="Websites"
        lede="From a sentence to a live address, usually inside a minute. Fennic writes the actual code, hosts it for you, and then edits it by conversation rather than by control panel."
      >
        <ActionButton href="/">Build a site</ActionButton>
        <ActionButton href="/design" variant="secondary">
          Start from a design
        </ActionButton>
      </PageIntro>

      <Section
        heading="How it goes"
        description="Four steps, and you can stop after any of them."
        icon="websites"
      >
        <Steps items={PIPELINE} />
      </Section>

      <Section
        heading="What it is good at"
        description="Anything that is one page or a small handful, and needs to look considered."
      >
        <CardGrid columns={3}>
          <Card
            icon="new-chat"
            title="Landing pages"
            body="Launches, waitlists, a product you want to explain properly before anyone signs up."
          />
          <Card
            icon="deep-research"
            title="Interactive explainers"
            body="Charts you can drag, simulations, diagrams that respond — the things a static document cannot do."
          />
          <Card
            icon="sheets"
            title="Dashboards"
            body="Point it at a sheet or a database and it builds the view, including the bits that update."
            href="/sheets"
          />
          <Card
            icon="design"
            title="Portfolios"
            body="Image-heavy layouts that load fast, with the typography actually set rather than defaulted."
            href="/design"
          />
          <Card
            icon="attach"
            title="Documentation"
            body="Readable, searchable, with code samples that are highlighted and copyable."
          />
          <Card
            icon="my-kimi"
            title="Personal sites"
            body="A CV, a wedding page, a shop with three products. Small sites deserve to be good too."
            href="/my-fennic"
          />
        </CardGrid>
      </Section>

      <Section heading="Under the hood">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Tag>Semantic HTML</Tag>
          <Tag>Responsive by default</Tag>
          <Tag>Keyboard navigable</Tag>
          <Tag>WCAG AA contrast</Tag>
          <Tag>No tracking scripts</Tag>
          <Tag>Full source export</Tag>
        </div>
        <CardGrid>
          <Card
            title="Yours to take away"
            body="Export the whole project as files at any point and host it wherever you like. Nothing generated here depends on Fennic staying online."
          />
          <Card
            title="Custom domains"
            body="Point a domain at the site and it serves over HTTPS with a certificate issued automatically. The generated address keeps working as an alias."
          />
        </CardGrid>
      </Section>

      <Section heading="Briefs to steal">
        <div className="flex flex-col gap-2">
          {PROMPTS.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} />
          ))}
        </div>
      </Section>

      <Section heading="Your sites">
        <EmptyState
          icon="websites"
          title="No sites yet"
          body="The first one takes about a minute. Describe what you want on the home page and it will be live before you finish reading this."
        >
          <ActionButton href="/">Describe a site</ActionButton>
        </EmptyState>
      </Section>
    </PageShell>
  );
}
