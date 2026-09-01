import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import {
  ActionButton,
  Card,
  CardGrid,
  EmptyState,
  PageIntro,
  PromptRow,
  Section,
  Tag,
} from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "My Fennic",
  description:
    "Your Fennic workspace — chats, projects, research reports, and the sites, sheets and designs you have shipped.",
};

const RECENT_PROMPTS = [
  "Summarise everything I saved about the Q3 pricing work",
  "Reopen the sheet I built for the shipping cost model",
  "What did I ask you about the onboarding redesign last week?",
] as const;

export default function MyFennicPage() {
  return (
    <PageShell title="My Fennic" icon="my-kimi">
      <PageIntro
        eyebrow="Workspace"
        title="My Fennic"
        lede="Everything you have made with Fennic in one place — chats, projects, research reports, and the sites, sheets and designs you shipped. Work stays on this device until you log in."
      >
        <ActionButton href="/">Start a chat</ActionButton>
        <ActionButton href="/plugins" variant="secondary">
          Connect a plugin
        </ActionButton>
      </PageIntro>

      <Section
        heading="Pick up where you left off"
        description="Your ten most recent threads, newest first."
        icon="new-chat"
      >
        <EmptyState
          icon="not-login"
          title="Nothing synced yet"
          body="Chats, projects and files live in this browser until you sign in. Log in once and the last 90 days of history appears here on every device."
        >
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <ActionButton href="/">Log in to sync</ActionButton>
            <ActionButton href="/" variant="secondary">
              Keep working locally
            </ActionButton>
          </div>
        </EmptyState>
      </Section>

      <Section
        heading="Your workspace"
        description="Each surface keeps its own history. Open one to see only what you made there."
        icon="new-project"
      >
        <CardGrid columns={3}>
          <Card
            icon="deep-research"
            title="Research reports"
            body="Long-form runs with their sources, working notes and revisions."
            href="/deep-research"
            meta="No reports yet"
          />
          <Card
            icon="websites"
            title="Websites"
            body="Every site you generated, with its live URL and deploy history."
            href="/websites"
            meta="No sites yet"
          />
          <Card
            icon="sheets"
            title="Sheets"
            body="Spreadsheets and dashboards Fennic built from your data."
            href="/sheets"
            meta="No sheets yet"
          />
          <Card
            icon="design"
            title="Design"
            body="Images, mockups and brand assets, grouped by the brief that made them."
            href="/design"
            meta="No designs yet"
          />
          <Card
            icon="plugins"
            title="Connected plugins"
            body="Tools Fennic may call on your behalf, and what each one can reach."
            href="/plugins"
            meta="None connected"
          />
          <Card
            icon="new-project"
            title="Projects"
            body="Group related chats and files so Fennic keeps one shared context."
            meta="Create your first project from the sidebar"
          />
        </CardGrid>
      </Section>

      <Section
        heading="Memory"
        description="What Fennic carries between chats — always yours to read, edit or delete."
        icon="my-kimi"
        action={
          <ActionButton href="/" variant="secondary">
            Manage memory
          </ActionButton>
        }
      >
        <CardGrid>
          <Card
            title="What Fennic remembers"
            body="Preferences you state once — tone, stack, units, the names of your projects — so you are not repeating yourself every session."
          >
            <div className="flex flex-wrap gap-1.5">
              <Tag>Writing tone</Tag>
              <Tag>Preferred stack</Tag>
              <Tag>Recurring projects</Tag>
              <Tag>Timezone</Tag>
            </div>
          </Card>
          <Card
            title="What it never keeps"
            body="Anything in a chat you delete, files you upload for a single run, and credentials passed to a plugin. Memory is opt-out per thread and can be cleared wholesale at any time."
          />
        </CardGrid>
      </Section>

      <Section
        heading="Jump back in"
        description="Recent-history prompts work as soon as you are signed in."
      >
        <div className="flex flex-col gap-2">
          {RECENT_PROMPTS.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} />
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
