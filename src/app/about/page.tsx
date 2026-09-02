import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import {
  ActionButton,
  Badge,
  PageIntro,
  Section,
} from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who builds Fennic AI, and what we believe about agentic software.",
};

export default function AboutPage() {
  return (
    <PageShell title="About Us">
      <PageIntro
        eyebrow="About Us"
        title="Built for agentic coding and knowledge work"
        lede="Fennic AI turns one prompt into working software. The name is a nod to the fennec — the fox that hears what others can&#39;t — and that&#39;s the product: an agent that picks up on what you actually meant."
      >
        <ActionButton href="/features">See the features</ActionButton>
        <ActionButton href="/help" variant="secondary">
          Help Center
        </ActionButton>
      </PageIntro>

      <Section heading="What we believe">
        <div className="flex flex-col gap-6">
          <p className="text-sm leading-6 text-fennic-secondary">
            Software should ship from intent. You describe the outcome — a research
            report, a playable game, a dashboard — and the machine does the work of
            getting there, showing its reasoning and its sources on the way.
          </p>
          <p className="text-sm leading-6 text-fennic-secondary">
            Agents need boundaries, not just capabilities. Every tool Fennic can
            reach is a scoped grant you gave it, every call is on the record, and
            everything it remembers about you can be reviewed or cleared in one
            place. Power without auditability is a bug.
          </p>
          <p className="text-sm leading-6 text-fennic-secondary">
            And a companion should grow with you. The streak in My Fennic is a
            real record of the year you&#39;ve spent together — not a gamified
            retention hook, but a mirror.
          </p>
        </div>
      </Section>

      <Section heading="Where to find the rest" action={<Badge>Quick links</Badge>}>
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-6 text-fennic-secondary">
            Features covers the four modes and the plugin system; the Terms of
            Service and Privacy Policy are linked from this same menu; and
            Settings holds your theme, language and memory controls.
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
