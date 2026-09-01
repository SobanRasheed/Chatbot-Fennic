"use client";

// WorkspacePanel — the three-tab frame behind the sidebar's "My Fennic" row.
//
// Layout note: the reference shows this as a rounded, inset panel with a tab row
// across the top and a close button at its right. AppShell's main panel is
// already exactly that shape (m-1.5, rounded-[12px], its own border), so this
// renders *as* the page rather than as a modal over one — no portal, no scrim,
// no focus trap to get wrong, and the sidebar stays where the user left it.
//
// Tab state is local, and mirrored into `?tab=` with history.replaceState (the
// documented shallow-update escape hatch) so a tab is linkable and survives a
// reload without every switch paying for a server round trip.

import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../AppShell";
import { useAppShellState } from "../useAppShellState";
import { KimiIcon } from "../icons";
import MyFennicTab from "./MyFennicTab";
import PluginsTab from "./PluginsTab";
import SkillsTab from "./SkillsTab";
import { WORKSPACE_TABS } from "@/types/fennic-workspace";
import type {
  PluginListResponse,
  SkillListResponse,
  WorkspaceProfileResponse,
  WorkspaceTab,
} from "@/types/fennic-workspace";

const TAB_LABEL: Record<WorkspaceTab, string> = {
  "my-fennic": "My Fennic",
  plugins: "Plugins",
  skills: "Skills",
};

export interface WorkspacePanelProps {
  initialTab: WorkspaceTab;
  profile: WorkspaceProfileResponse;
  plugins: PluginListResponse;
  skills: SkillListResponse;
}

export default function WorkspacePanel({
  initialTab,
  profile,
  plugins,
  skills,
}: WorkspacePanelProps) {
  const [tab, setTab] = useState<WorkspaceTab>(initialTab);
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const {
    collapsed,
    onCollapse,
    mobileNavOpen,
    onCloseMobileNav,
    onHeaderToggle,
    scrollContainerRef,
  } = useAppShellState();

  const selectTab = useCallback((next: WorkspaceTab) => {
    setTab(next);
    const url = next === "my-fennic" ? "/my-fennic" : `/my-fennic?tab=${next}`;
    window.history.replaceState(null, "", url);
  }, []);

  // ←/→ move between tabs, which is what a tablist owes a keyboard user.
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (delta === 0) return;
      event.preventDefault();
      const index = WORKSPACE_TABS.indexOf(tab);
      const next =
        WORKSPACE_TABS[(index + delta + WORKSPACE_TABS.length) % WORKSPACE_TABS.length];
      selectTab(next);
      const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]");
      buttons?.[WORKSPACE_TABS.indexOf(next)]?.focus();
    },
    [tab, selectTab],
  );

  return (
    <AppShell
      collapsed={collapsed}
      onCollapse={onCollapse}
      mobileNavOpen={mobileNavOpen}
      onCloseMobileNav={onCloseMobileNav}
      scrollContainerRef={scrollContainerRef}
    >
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-[11] flex h-[52px] shrink-0 items-center gap-1 border-b border-fennic-border bg-fennic-panel px-3">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onHeaderToggle}
            className={`mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-fennic-primary transition-colors duration-150 hover:bg-fennic-hover ${
              collapsed ? "" : "lg:hidden"
            }`}
          >
            <KimiIcon name="hide-sidebar" size={20} />
          </button>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Workspace"
            onKeyDown={onKeyDown}
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          >
            {WORKSPACE_TABS.map((candidate) => {
              const active = candidate === tab;
              return (
                <button
                  key={candidate}
                  type="button"
                  role="tab"
                  id={`workspace-tab-${candidate}`}
                  aria-selected={active}
                  aria-controls={`workspace-panel-${candidate}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectTab(candidate)}
                  className={`relative h-[51px] shrink-0 px-2.5 text-sm leading-5 font-medium whitespace-nowrap transition-colors duration-150 ${
                    active
                      ? "text-fennic-primary"
                      : "text-fennic-tertiary hover:text-fennic-primary"
                  }`}
                >
                  {TAB_LABEL[candidate]}
                  {/* Underline sits on the header's own border row, so the active
                      tab reads as continuous with the content below it. */}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2.5 bottom-0 h-[2px] rounded-full transition-opacity duration-150 ${
                      active ? "bg-fennic-accent opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Close workspace"
            onClick={() => router.push("/")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-fennic-tertiary transition-colors duration-150 hover:bg-fennic-hover hover:text-fennic-primary"
          >
            <CloseGlyph />
          </button>
        </header>

        <main className="flex-1 px-4 pt-7 pb-20 md:px-8">
          <div className="mx-auto w-full max-w-[820px]">
            <div
              role="tabpanel"
              id={`workspace-panel-${tab}`}
              aria-labelledby={`workspace-tab-${tab}`}
            >
              {tab === "my-fennic" ? <MyFennicTab initial={profile} /> : null}
              {tab === "plugins" ? <PluginsTab initial={plugins} /> : null}
              {tab === "skills" ? <SkillsTab initial={skills} /> : null}
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </svg>
  );
}
