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
  Tag,
} from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "Plugins",
  description:
    "Connect Fennic to the tools you already use — search, storage, databases, calendars and your own HTTP endpoints.",
};

const HOW_IT_WORKS = [
  {
    title: "Connect once",
    body: "Authorise a plugin from this page. Fennic stores the grant, never the password, and shows you exactly which scopes it received.",
  },
  {
    title: "Fennic decides when to call it",
    body: "You keep writing in plain language. If a request needs a connected tool, Fennic reaches for it and tells you which one it used.",
  },
  {
    title: "Every call is on the record",
    body: "Each invocation is logged with its arguments and result, so you can audit a run afterwards or replay it against different inputs.",
  },
  {
    title: "Revoke instantly",
    body: "Disconnecting kills the grant immediately. In-flight calls fail closed rather than finishing with stale access.",
  },
] as const;

const PROMPTS = [
  "Pull last quarter's invoices from Drive and total them by client",
  "Check my calendar and draft three meeting slots that work for Berlin and Denver",
  "Query the staging database for users who signed up but never returned",
] as const;

export default function PluginsPage() {
  return (
    <PageShell title="Plugins" icon="plugins">
      <PageIntro
        eyebrow="Connectors"
        title="Plugins"
        lede="Fennic is more useful when it can reach your actual work. Plugins give it scoped, revocable access to the services you already pay for — and to anything of your own that speaks HTTP."
      >
        <ActionButton href="/plugins">Browse the directory</ActionButton>
        <ActionButton href="/deep-research" variant="secondary">
          See them used in research
        </ActionButton>
      </PageIntro>

      <Section
        heading="Featured"
        description="Vetted connectors, reviewed for scope creep before they ship."
        icon="plugins"
        action={<Badge>18 available</Badge>}
      >
        <CardGrid columns={3}>
          <Card
            icon="websites"
            title="Web search"
            body="Live results with citations, so answers about this week are about this week."
            meta="Read-only · no auth"
          />
          <Card
            icon="attach"
            title="Cloud storage"
            body="Read and write files in Drive, Dropbox or S3. Folder-scoped, never account-wide."
            meta="Read + write · OAuth"
          />
          <Card
            icon="sheets"
            title="Databases"
            body="Postgres, MySQL and SQLite over a read replica by default. Writes need a second confirmation."
            meta="Read-only by default"
          />
          <Card
            icon="new-chat"
            title="Calendar & mail"
            body="Check availability, draft invitations, summarise a thread. Sending always asks first."
            meta="Draft-only · OAuth"
          />
          <Card
            icon="deep-research"
            title="Code repositories"
            body="Browse a repo, read diffs, open pull requests against branches you nominate."
            meta="Branch-scoped"
          />
          <Card
            icon="get-app"
            title="Custom HTTP"
            body="Point Fennic at an OpenAPI schema and it learns your internal service in one step."
            meta="Bring your own endpoint"
          />
        </CardGrid>
      </Section>

      <Section heading="Categories">
        <div className="flex flex-wrap gap-1.5">
          <Tag>Search</Tag>
          <Tag>Storage</Tag>
          <Tag>Databases</Tag>
          <Tag>Productivity</Tag>
          <Tag>Developer tools</Tag>
          <Tag>Analytics</Tag>
          <Tag>Design</Tag>
          <Tag>Finance</Tag>
          <Tag>Custom</Tag>
        </div>
      </Section>

      <Section
        heading="How plugins work"
        description="Four rules, and they do not bend."
      >
        <Steps items={HOW_IT_WORKS} />
      </Section>

      <Section
        heading="Try one"
        description="Each of these needs a connector. Fennic will ask before it reaches for anything."
      >
        <div className="flex flex-col gap-2">
          {PROMPTS.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} />
          ))}
        </div>
      </Section>

      <Section
        heading="Build your own"
        description="If it has an HTTP API, it can be a plugin by this afternoon."
      >
        <CardGrid>
          <Card
            icon="get-app"
            title="From an OpenAPI schema"
            body="Paste a schema URL. Fennic derives the tool list, argument types and descriptions, then asks you to approve the scopes it wants."
          />
          <Card
            icon="new-project"
            title="From scratch"
            body="Declare tools in a manifest, host it anywhere, and keep it private to your workspace or publish it to the directory."
          />
        </CardGrid>
      </Section>
    </PageShell>
  );
}
