"use client";

// AppShell — application frame per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/AppShell.md
// Fixed 240px aside (main's margin-left reserves its space) + the main panel
// whose .layout-container is the ONLY scroll container.

import type { ReactNode, RefObject } from "react";
import Sidebar from "./Sidebar";

export interface AppShellProps {
  collapsed: boolean;
  onCollapse: () => void;
  mobileNavOpen: boolean;
  onCloseMobileNav: () => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export default function AppShell({
  collapsed,
  onCollapse,
  mobileNavOpen,
  onCloseMobileNav,
  scrollContainerRef,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen bg-fennic-ground">
      {/* aside — fixed; slides via translate. Same mechanism for desktop
          collapse (lg) and the mobile drawer (<lg). */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[240px] bg-fennic-ground transition-transform duration-300 ease-in-out ${
          mobileNavOpen
            ? "max-lg:translate-x-0"
            : "max-lg:-translate-x-full"
        } ${collapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
      >
        <Sidebar onCollapse={onCollapse} />
      </aside>

      {/* mobile backdrop */}
      <div
        aria-hidden
        onClick={onCloseMobileNav}
        className={`fixed inset-0 z-[29] bg-fennic-scrim transition-opacity duration-300 ease-in-out lg:hidden ${
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* main panel */}
      <div
        className={`relative m-1.5 flex min-w-0 flex-1 overflow-hidden rounded-[12px] border border-fennic-border bg-fennic-panel transition-[margin-left] duration-300 ease-in-out ${
          collapsed ? "lg:ml-1.5" : "lg:ml-[240px]"
        }`}
      >
        <div
          ref={scrollContainerRef}
          className="relative flex-1 basis-0 overflow-y-auto overscroll-contain"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
