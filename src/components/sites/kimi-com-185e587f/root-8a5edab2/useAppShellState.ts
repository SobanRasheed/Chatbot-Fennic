"use client";

// useAppShellState — the sidebar collapse / mobile drawer state that every shell
// needs and none of them should re-implement.
//
// Three shells wrap AppShell: KimiHomePage (bespoke, the hero's sticky
// choreography), PageShell (the five content routes), and the workspace panel.
// All three want the same three things — a collapse flag, a drawer flag, and a
// header trigger that means "expand" on desktop and "open the drawer" below it.
// This is that, once.

import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";

export interface AppShellState {
  collapsed: boolean;
  onCollapse: () => void;
  mobileNavOpen: boolean;
  onCloseMobileNav: () => void;
  /** Desktop: expand the rail. Below lg: open the drawer. */
  onHeaderToggle: () => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export function useAppShellState(): AppShellState {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const onHeaderToggle = useCallback(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed(false);
    } else {
      setMobileNavOpen(true);
    }
  }, []);

  return {
    collapsed,
    onCollapse: useCallback(() => setCollapsed(true), []),
    mobileNavOpen,
    onCloseMobileNav: useCallback(() => setMobileNavOpen(false), []),
    onHeaderToggle,
    scrollContainerRef,
  };
}
