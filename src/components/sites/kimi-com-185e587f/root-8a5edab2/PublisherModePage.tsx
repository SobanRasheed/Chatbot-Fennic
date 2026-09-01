"use client";

// PublisherModePage — the new-chat screen in one of the four publisher modes.
//
// This is what the sidebar's Deep Research / Websites / Sheets / Design rows now
// open: the same wordmark and composer as the home page, the mode named in the
// composer's toolbar, and the mode's gallery directly underneath.
//
// It is a sibling of KimiHomePage rather than a branch inside it. KimiHomePage's
// layout is a measured sticky/negative-margin choreography built around the
// hero's viewport share and a lazily-mounted explore grid; a mode screen has no
// sticky phase and shows its gallery immediately. Forcing one component to do
// both would mean two layouts behind conditionals in every wrapper. What they
// genuinely share — the shell, the wordmark, the composer — is shared.

import AppShell from "./AppShell";
import Composer from "./Composer";
import ModeGallery from "./ModeGallery";
import Wordmark from "./Wordmark";
import FooterBar from "./FooterBar";
import { KimiIcon } from "./icons";
import { useAppShellState } from "./useAppShellState";
import type { PublisherMode } from "@/types/fennic-modes";

export default function PublisherModePage({ mode }: { mode: PublisherMode }) {
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
        {/* Same 52px header row as every other surface. The trigger only shows
            when there is no sidebar to its left. */}
        <div className="sticky top-0 z-[11] flex h-[52px] shrink-0 items-center bg-fennic-panel pl-[10px]">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onHeaderToggle}
            className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-fennic-primary transition-colors duration-150 hover:bg-fennic-hover ${
              collapsed ? "" : "lg:hidden"
            }`}
          >
            <KimiIcon name="hide-sidebar" size={20} />
          </button>
        </div>

        {/* Hero: wordmark over the composer, vertically generous but not
            viewport-locked — the gallery below should be reachable by scrolling,
            and on a short window it is already partly in view. */}
        <div className="flex flex-col items-center px-3 pt-10 pb-8 md:px-4 md:pt-16 md:pb-12">
          <div className="mb-8 flex w-full justify-center">
            <Wordmark priority />
          </div>
          <div className="w-full">
            <Composer
              placeholder={mode.placeholder}
              mode={{ label: mode.label, icon: mode.icon }}
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[337px] pb-[100px] md:max-w-[768px]">
          <ModeGallery mode={mode} />
        </div>

        <div className="mb-2 flex justify-center opacity-70">
          <span className="px-2.5 text-[12px] leading-5 text-fennic-faint">
            AI-generated, for reference only
          </span>
        </div>
      </div>

      <FooterBar />
    </AppShell>
  );
}
