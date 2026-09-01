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
  title: "Design",
  description:
    "Images, mockups and brand assets from a written brief — with a brand kit Fennic holds to across every request.",
};

const BRIEF_STEPS = [
  {
    title: "Say what it is for",
    body: "An app icon, a hero image, a slide background, a poster at A2. The medium sets the crop, the detail level and the file it hands back.",
  },
  {
    title: "Name the constraints, not the style",
    body: "'Must read at 32px', 'has to sit on a dark ground', 'no faces'. Constraints get respected literally; adjectives get interpreted.",
  },
  {
    title: "Direct the revision",
    body: "'Warmer', 'less busy in the top third', 'same composition, different palette'. Each pass keeps what you did not criticise.",
  },
] as const;

const PROMPTS = [
  "An app icon of a fennec fox in profile, flat, one accent colour, legible at 32px",
  "A hero image for a coffee subscription — warm, low contrast, room for text on the left",
  "Four social cards in the same family, one per feature, matching the brand kit",
] as const;

export default function DesignPage() {
  return (
    <PageShell title="Design" icon="design" action={<Badge>PNG · SVG · PDF</Badge>}>
      <PageIntro
        eyebrow="Visuals"
        title="Design"
        lede="Written briefs in, usable assets out — at the size and format you actually need, in a palette that stays consistent across every request you make."
      >
        <ActionButton href="/">Describe an asset</ActionButton>
        <ActionButton href="/websites" variant="secondary">
          Put it on a page
        </ActionButton>
      </PageIntro>

      <Section
        heading="What you can make"
        description="Each type comes back at the right dimensions for where it is going."
        icon="design"
      >
        <CardGrid columns={3}>
          <Card
            icon="design"
            title="Icons & marks"
            body="Flat, single-purpose shapes tested at 16, 32 and 512 pixels before they are handed over."
          />
          <Card
            icon="websites"
            title="Hero imagery"
            body="Wide crops with deliberate empty space, so the headline does not have to fight the picture."
            href="/websites"
          />
          <Card
            icon="new-chat"
            title="Social cards"
            body="1200×630 with the safe area respected, generated as a set so a launch looks like one launch."
          />
          <Card
            icon="sheets"
            title="Diagrams"
            body="Flows, architectures and timelines as vectors — editable text, not baked pixels."
            href="/sheets"
          />
          <Card
            icon="attach"
            title="Mockups"
            body="Your screenshot placed in a device or a room, lit to match the surrounding page."
          />
          <Card
            icon="my-kimi"
            title="Brand kits"
            body="A palette, a type pairing and the rules for using them, applied to everything you ask for afterwards."
            href="/my-fennic"
          />
        </CardGrid>
      </Section>

      <Section
        heading="How to brief it"
        description="The difference between one round and five is almost always the first message."
      >
        <Steps items={BRIEF_STEPS} />
      </Section>

      <Section
        heading="The Fennic kit"
        description="The palette this site is built from — a worked example of what a kit contains."
      >
        <CardGrid>
          <Card
            title="Palette"
            body="Terracotta carries every action. Cream and the two charcoals do the rest, and shadows are warm charcoal rather than neutral black so depth reads as warmth."
          >
            <div className="flex flex-wrap gap-1.5">
              <Tag>Terracotta #D8663A</Tag>
              <Tag>Cream #F2D6B8</Tag>
              <Tag>Charcoal #2C2320</Tag>
              <Tag>Deep charcoal #1C1613</Tag>
              <Tag>Warm off-white #F7F5F3</Tag>
            </div>
          </Card>
          <Card
            title="Rules"
            body="One accent per composition. Text sits at full charcoal or full off-white, never mid-grey. Nothing pure black, nothing pure white, and every asset is checked on both grounds before it ships."
          >
            <div className="flex flex-wrap gap-1.5">
              <Tag>Light ground #F7F5F3</Tag>
              <Tag>Dark ground #1C1613</Tag>
              <Tag>Warm shadows only</Tag>
            </div>
          </Card>
        </CardGrid>
      </Section>

      <Section heading="Briefs to steal">
        <div className="flex flex-col gap-2">
          {PROMPTS.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} />
          ))}
        </div>
      </Section>

      <Section heading="Your designs">
        <EmptyState
          icon="design"
          title="Nothing here yet"
          body="Describe one asset and the brief becomes reusable — everything after it inherits the palette and the rules you settled on."
        >
          <ActionButton href="/">Write a brief</ActionButton>
        </EmptyState>
      </Section>
    </PageShell>
  );
}
