"use client";

// PageShell — the frame every non-home route renders inside.
//
// KimiHomePage keeps its own bespoke shell because the hero's sticky/negative-
// margin choreography is measured against the viewport. Subpages don't need any
// of that, so they share this: the same AppShell (fixed 240px aside, single
// scroll container), the same 52px header row, then a normal document flow.
//
// Shell state lives in useAppShellState, shared with the workspace panel: the
// header trigger expands the sidebar on desktop and opens the drawer on mobile.

import type { ReactNode } from "react";
import AppShell from "./AppShell";
import { useAppShellState } from "./useAppShellState";
import { KimiIcon, type KimiIconName } from "./icons";

export interface PageShellProps {
  /** Page title shown in the header row and as the document heading. */
  title: string;
  /** Sidebar icon key, echoed next to the title. */
  icon?: KimiIconName;
  /** Optional trailing header content (buttons, status pills). */
  action?: ReactNode;
  children: ReactNode;
}

export default function PageShell({
  title,
  icon,
  action,
  children,
}: PageShellProps) {
  const {
    collapsed,
    onCollapse,
    mobileNavOpen,
    onCloseMobileNav,
    onHeaderToggle,
    scrollContainerRef,
  } = useAppShellState();

  return (
    <AppShell
      collapsed={collapsed}
      onCollapse={onCollapse}
      mobileNavOpen={mobileNavOpen}
      onCloseMobileNav={onCloseMobileNav}
      scrollContainerRef={scrollContainerRef}
    >
      <div className="relative flex min-h-full flex-col">
        <header className="sticky top-0 z-[11] flex h-[52px] shrink-0 items-center gap-2 border-b border-fennic-border bg-fennic-panel px-[10px]">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onHeaderToggle}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-fennic-primary transition-colors duration-150 hover:bg-fennic-hover ${
              collapsed ? "" : "lg:hidden"
            }`}
          >
            <KimiIcon name="hide-sidebar" size={20} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {icon ? (
              <KimiIcon
                name={icon}
                size={18}
                className="shrink-0 text-fennic-secondary"
              />
            ) : null}
            <span className="truncate text-sm leading-5 font-medium text-fennic-primary">
              {title}
            </span>
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </header>

        <main className="flex-1 px-4 pt-8 pb-24 md:px-6">
          <div className="mx-auto w-full max-w-[880px]">{children}</div>
        </main>
      </div>
    </AppShell>
  );
}
