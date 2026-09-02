import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import { PageIntro, Section } from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Fennic AI.",
};

// Short-form clone content: the real legal page needs counsel review before
// anything ships. Every clause here is a summary, not advice.
const SECTIONS = [
  {
    heading: "1. Agreement",
    body: "By creating a Fennic account or using any Fennic service, you agree to these terms. If you use Fennic on behalf of an organisation, you confirm you have authority to bind it.",
  },
  {
    heading: "2. Your content",
    body: "You own the prompts you write and the files you upload. You grant Fennic the limited licence it needs to process them — to run your request and return a result. That licence ends when your content is deleted from your workspace.",
  },
  {
    heading: "3. Generated output",
    body: "Output from Fennic — research reports, sites, spreadsheets, designs — is yours to use. Output may be inaccurate: verify anything you rely on, and treat generated code and figures as drafts until reviewed.",
  },
  {
    heading: "4. Acceptable use",
    body: "Don't use Fennic to break the law, to generate content that harms identifiable people, to automate decisions with legal effect without human review, or to probe or disrupt the service itself.",
  },
  {
    heading: "5. Availability",
    body: "We aim for continuity but provide the service as-is. Modes, models and limits may change as the product evolves. Material changes to these terms will be announced in-app before they take effect.",
  },
  {
    heading: "6. Contact",
    body: "Questions about these terms can be sent from the Help Center. We read everything.",
  },
] as const;

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service">
      <PageIntro
        eyebrow="Legal"
        title="Terms of Service"
        lede="The agreement between you and Fennic AI, in language meant to be read."
      />
      <Section heading="The terms">
        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <div key={section.heading} className="flex flex-col gap-1.5">
              <h3 className="text-sm leading-5 font-medium text-fennic-primary">
                {section.heading}
              </h3>
              <p className="text-sm leading-6 text-fennic-secondary">{section.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
