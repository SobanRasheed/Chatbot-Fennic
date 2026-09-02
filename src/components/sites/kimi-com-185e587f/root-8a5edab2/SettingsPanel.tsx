"use client";

// SettingsPanel — /settings, the screen the profile menu's last item opens.
//
// Same shape as the reference: the signed-in account at the top ("the profile
// through which the user logged in"), then General (Theme, Notifications, Chat
// Presets, Expand Sidebar on Search, Language), Personalization (Memory), and
// Get Help (Help Center, About Us, Terms of Service, Privacy Policy, Features).
//
// Every control is real: Theme pins the palette (see preferences.ts for how the
// class lands on <html> before first paint), the switches persist, the language
// choice updates everywhere the menu shows it, and Chat Presets links to the
// four publisher modes the composer runs in.

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import PageShell from "./PageShell";
import { KimiIcon } from "./icons";
import { SegmentedControl } from "./workspace/workspace-ui";
import {
  LANGUAGES,
  languageLabel,
  setPreferences,
  usePreferences,
  type LanguageCode,
  type ThemePreference,
} from "./preferences";

const THEME_OPTIONS = [
  { value: "light" as ThemePreference, label: "Light" },
  { value: "dark" as ThemePreference, label: "Dark" },
  { value: "system" as ThemePreference, label: "System" },
];

const CHAT_PRESETS = [
  { slug: "deep-research", label: "Deep Research" },
  { slug: "websites", label: "Websites" },
  { slug: "sheets", label: "Sheets" },
  { slug: "design", label: "Design" },
] as const;

const HELP_LINKS = [
  { href: "/help", label: "Help Center" },
  { href: "/about", label: "About Us" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/features", label: "Features" },
] as const;

/* ── Row primitives ───────────────────────────────────────────────────────── */

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-fennic-border px-4 py-3.5 last:border-b-0">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm leading-5 text-fennic-primary">{label}</span>
        {description ? (
          <span className="mt-0.5 text-[13px] leading-5 text-fennic-tertiary">{description}</span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center">{control}</div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 ${
        checked ? "bg-fennic-accent" : "bg-fennic-placeholder-bg"
      }`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-fennic-panel shadow-fennic-raise transition-transform duration-150 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/** A row that folds open — the same interaction Chat Presets and Language use. */
function DisclosureRow({
  label,
  description,
  open,
  onToggle,
  trailing,
  children,
}: {
  label: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-fennic-border last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-fennic-hover"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-sm leading-5 text-fennic-primary">{label}</span>
          {description ? (
            <span className="mt-0.5 text-[13px] leading-5 text-fennic-tertiary">{description}</span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {trailing}
          <ChevronDown
            size={15}
            className={`text-fennic-faint transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>
      {open ? <div className="px-4 pb-3.5">{children}</div> : null}
    </div>
  );
}

function SectionCard({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 px-1 text-sm leading-5 font-medium text-fennic-secondary">{heading}</h2>
      <div className="overflow-hidden rounded-[16px] border border-fennic-border bg-fennic-panel">
        {children}
      </div>
    </section>
  );
}

/* ── The screen ───────────────────────────────────────────────────────────── */

export default function SettingsPanel() {
  const prefs = usePreferences();
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <PageShell title="Settings">
      <div className="mx-auto w-full max-w-[620px] pt-4">
        {/* The signed-in account — same owner the My Fennic panel reports. */}
        <div className="mb-8 flex items-center gap-4 px-1">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-fennic-accent-soft text-lg font-semibold tracking-[0.02em] text-fennic-accent"
          >
            T
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-lg leading-7 font-semibold text-fennic-primary">Titumama</span>
            <span className="text-[13px] leading-5 text-fennic-tertiary">
              Signed in · 212 days with Fennic
            </span>
          </div>
        </div>

        <SectionCard heading="General">
          <SettingRow
            label="Theme"
            description="Follow the system or pin one palette."
            control={
              <SegmentedControl
                label="Theme"
                options={THEME_OPTIONS}
                value={prefs.theme}
                onChange={(theme) => setPreferences({ theme })}
              />
            }
          />
          <SettingRow
            label="Notifications"
            description="Product updates and finished-run alerts."
            control={
              <Switch
                label="Notifications"
                checked={prefs.notifications}
                onChange={(notifications) => setPreferences({ notifications })}
              />
            }
          />
          <DisclosureRow
            label="Chat Presets"
            description="Composer modes for the work you do most."
            open={presetsOpen}
            onToggle={() => setPresetsOpen((v) => !v)}
          >
            <div className="flex flex-col gap-0.5">
              {CHAT_PRESETS.map((preset) => (
                <Link
                  key={preset.slug}
                  href={`/${preset.slug}`}
                  className="flex h-9 items-center gap-2 rounded-[10px] px-2 text-sm leading-5 text-fennic-secondary transition-colors duration-150 hover:bg-fennic-hover hover:text-fennic-primary"
                >
                  <KimiIcon name={preset.slug} size={16} />
                  {preset.label}
                </Link>
              ))}
            </div>
          </DisclosureRow>
          <SettingRow
            label="Expand Sidebar on Search"
            description="Reveal project search when the sidebar is collapsed."
            control={
              <Switch
                label="Expand Sidebar on Search"
                checked={prefs.expandSidebarOnSearch}
                onChange={(expandSidebarOnSearch) =>
                  setPreferences({ expandSidebarOnSearch })
                }
              />
            }
          />
          <DisclosureRow
            label="Language"
            open={languageOpen}
            onToggle={() => setLanguageOpen((v) => !v)}
            trailing={
              <span className="text-[13px] text-fennic-tertiary">
                {languageLabel(prefs.language)}
              </span>
            }
          >
            <div className="flex flex-col gap-0.5">
              {LANGUAGES.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  role="radio"
                  aria-checked={entry.code === prefs.language}
                  onClick={() => setPreferences({ language: entry.code as LanguageCode })}
                  className="flex h-9 items-center justify-between rounded-[10px] px-2 text-sm leading-5 text-fennic-secondary transition-colors duration-150 hover:bg-fennic-hover hover:text-fennic-primary"
                >
                  {entry.label}
                  {entry.code === prefs.language ? (
                    <Check size={15} className="text-fennic-accent" />
                  ) : null}
                </button>
              ))}
            </div>
          </DisclosureRow>
        </SectionCard>

        <SectionCard heading="Personalization">
          <SettingRow
            label="Memory"
            description="Let Fennic remember useful context across chats. You can review and clear what it keeps in My Fennic."
            control={
              <Switch
                label="Memory"
                checked={prefs.memory}
                onChange={(memory) => setPreferences({ memory })}
              />
            }
          />
        </SectionCard>

        <SectionCard heading="Get Help">
          {HELP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between border-b border-fennic-border px-4 py-3.5 text-sm leading-5 text-fennic-primary transition-colors duration-150 last:border-b-0 hover:bg-fennic-hover"
            >
              {link.label}
              <ChevronRight size={15} className="text-fennic-faint" />
            </Link>
          ))}
        </SectionCard>
      </div>
    </PageShell>
  );
}
