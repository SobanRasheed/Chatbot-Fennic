"use client";

// KimiHomePage — page assembly per docs/research/kimi-com-185e587f/root-8a5edab2/components/KimiHomePage.md
// Owns ALL page state: sidebar collapse, mobile drawer, lazy explore mount, FAB visibility.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import AppShell from "./AppShell";
import Composer from "./Composer";
import ShortcutPills from "./ShortcutPills";
import ExploreButton from "./ExploreButton";
import { ExploreContent } from "./InspirationSection";
import FloatingChatButton from "./FloatingChatButton";
import FooterBar from "./FooterBar";
import { KimiIcon } from "./icons";

// The hero wordmark: Fennic in place of Kimi's "KIMI" doodle, sized so its ink
// matches the doodle's measured 154×44 — see scripts/brand-fennic-assets.mjs.
// The bitmap master, not the traced SVG: the tracer punched grain into the
// letterforms that was visible at render size.
const WORDMARK_SRC =
  "/sites/kimi-com-185e587f/root-8a5edab2/brand/fennic-text.png";

export default function KimiHomePage() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const stickySpaceRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [exploreMounted, setExploreMounted] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    const space = stickySpaceRef.current;
    if (!container || !space) return;
    setFabVisible(container.scrollTop >= space.offsetHeight);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleExplore = useCallback(() => {
    const container = scrollContainerRef.current;
    const space = stickySpaceRef.current;
    setExploreMounted(true);
    if (!container || !space) return;
    // Let the freshly mounted content lay out before scrolling to it.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.scrollTo({ top: space.offsetHeight + 80, behavior: "smooth" });
      });
    });
  }, []);

  const handleBackToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Desktop: the trigger expands the sidebar. Mobile: it opens the drawer.
  const handleHeaderToggle = useCallback(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed(false);
    } else {
      setMobileNavOpen(true);
    }
  }, []);

  return (
    <AppShell
      collapsed={collapsed}
      onCollapse={() => setCollapsed(true)}
      mobileNavOpen={mobileNavOpen}
      onCloseMobileNav={() => setMobileNavOpen(false)}
      scrollContainerRef={scrollContainerRef}
    >
      <div className="relative min-h-full">
        {/* .layout-sticky-space — reserves the hero's viewport share */}
        <div
          ref={stickySpaceRef}
          className="flex h-[calc(100vh_-_130px)] flex-col md:h-[calc(100vh_-_146px)]"
        >
          {/* .layout-sticky-group — sticks for (space − group)px, then scrolls away */}
          <div className="sticky top-0 z-[11] flex flex-col bg-kimi-panel">
            <div className="grid h-[52px] grid-cols-[1fr_auto_1fr] items-center">
              <div
                className={`flex items-center pl-[10px] ${collapsed ? "" : "md:hidden"}`}
              >
                <button
                  type="button"
                  aria-label="Open sidebar"
                  onClick={handleHeaderToggle}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-kimi-primary transition-colors duration-150 hover:bg-kimi-hover"
                >
                  <KimiIcon name="hide-sidebar" size={20} />
                </button>
              </div>
            </div>
            {/* .publisher-stage */}
            <div className="flex flex-col">
              <div className="flex h-[calc((100vh_-_271px)_/_2)] flex-col items-center justify-end md:h-[calc((100vh_-_294px)_/_2)]">
                <div className="mb-8 flex w-full justify-center">
                  <Image
                    src={WORDMARK_SRC}
                    alt="Fennic"
                    width={166}
                    height={44}
                    priority
                    className="h-[37px] w-[139px] md:h-[44px] md:w-[166px]"
                  />
                </div>
              </div>
              <div className="flex shrink flex-col items-center justify-center">
                <Composer />
                <ShortcutPills />
              </div>
            </div>
          </div>
        </div>

        {/* .layout-content-body — pulled up under the hero by its negative margin */}
        <div className="mt-[calc(243px_-_50vh)] md:mt-[calc(273px_-_50vh)]">
          <div className="relative flex px-3 md:px-4">
            <div className="flex w-full flex-1 flex-col">
              {/* .home-explore-area */}
              <div className="flex flex-col">
                <div className="flex min-h-[calc(50vh_-_127px)] flex-col md:min-h-[calc(50vh_-_141px)]">
                  <div className="mt-[calc(50vh_-_211px)] h-8 md:mt-[calc(50vh_-_241px)] md:h-12" />
                  <div className="mx-auto w-full max-w-[337px] md:max-w-[768px]">
                    <ExploreButton onExplore={handleExplore} />
                  </div>
                </div>
                <div className="relative mx-auto w-full max-w-[337px] pb-[100px] md:max-w-[768px]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[223px] transition-opacity duration-300"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(0, 0, 0, 0.03) 13px, rgba(0, 0, 0, 0) 223px)",
                      opacity: exploreMounted ? 0 : 1,
                    }}
                  />
                  {exploreMounted ? (
                    <ExploreContent />
                  ) : (
                    /* Pre-mount, what the page scrolls into is the gradient
                       teaser band. The live spacer element here measures
                       max(0, (100vh − 641px)/2) — 129.5 @900, verified at two
                       heights — but the 223px band floors it, which is why
                       live's pre-mount scroll depth is 223px at 1440×900 and
                       not 129.5. The gradient itself is absolute, so the floor
                       has to be stated here. */
                    <div className="hidden h-[max(223px,calc((100vh_-_641px)_/_2))] md:block" />
                  )}
                </div>
              </div>
              {/* .legal-footer--default — AI note */}
              <div className="mb-2 flex justify-center opacity-70">
                <span className="px-2.5 text-[12px] leading-5 text-kimi-faint">
                  AI-generated, for reference only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ICP footer — absolute inside the scroll container, slides away with content */}
      <FooterBar />

      <FloatingChatButton
        visible={fabVisible}
        onBackToTop={handleBackToTop}
        collapsed={collapsed}
      />
    </AppShell>
  );
}
