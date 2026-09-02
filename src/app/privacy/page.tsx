import type { Metadata } from "next";
import PageShell from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PageShell";
import { PageIntro, Section } from "@/components/sites/kimi-com-185e587f/root-8a5edab2/page-ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Fennic AI collects, why, and the controls you have over it.",
};

const SECTIONS = [
  {
    heading: "What we collect",
    body: "Account details (name, email, sign-in method), the prompts and files you send us so we can process them, and technical telemetry — errors, latency, feature usage — kept in aggregate where possible.",
  },
  {
    heading: "What we don't do",
    body: "We don't sell your data. We don't use your private chats to train models. Your content stays yours, as the Terms of Service sets out.",
  },
  {
    heading: "Memory",
    body: "If you switch on Memory in Settings, Fennic keeps useful context across chats — your preferences, ongoing projects, stated constraints. Everything it keeps is reviewable in My Fennic, and switching Memory off clears it.",
  },
  {
    heading: "Plugins",
    body: "When Fennic calls a connected service on your behalf, it sends only what the request needs. Each call is logged with its arguments and result so you can audit it afterwards. Revoking a plugin ends its access immediately.",
  },
  {
    heading: "Retention and deletion",
    body: "Chats and files are kept until you delete them or close your account. Deleting is immediate from your workspace and final after the backup window closes.",
  },
  {
    heading: "Your controls",
    body: "Export your data, clear your memory, disconnect any plugin, or delete your account — all from Settings and My Fennic, without contacting support.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <PageIntro
        eyebrow="Legal"
        title="Privacy Policy"
        lede="What Fennic collects, what it never touches, and the controls that put you in charge of the difference."
      />
      <Section heading="The policy">
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
