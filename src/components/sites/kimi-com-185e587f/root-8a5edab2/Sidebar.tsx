"use client";

// Sidebar — the 240px aside (header, New Chat row, nav, footer) per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/Sidebar.md
// AppShell owns the width/collapse transform; this is the inner column.

import Image from "next/image";
import Link from "next/link";
import { KimiIcon } from "./icons";
import SidebarNav from "./SidebarNav";

const LOGO_SRC = "/sites/kimi-com-185e587f/root-8a5edab2/brand/fennic-mark.png";

export interface SidebarProps {
  onCollapse: () => void;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col bg-fennic-ground">
      {/* .sidebar-header — 240×56 */}
      <div className="flex h-14 items-center justify-between pt-[15px] pr-[10px] pb-[9px] pl-4">
        <Link
          href="/"
          aria-label="Fennic"
          className="flex h-8 w-8 shrink-0 items-center justify-center"
        >
          <Image
            src={LOGO_SRC}
            alt="Fennic"
            width={28}
            height={28}
            className="h-7 w-7 rounded-[8px]"
            priority
          />
        </Link>
        <button
          type="button"
          aria-label="Hide sidebar"
          onClick={onCollapse}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-fennic-primary transition-colors duration-150 hover:bg-fennic-hover"
        >
          <KimiIcon name="hide-sidebar" size={20} />
        </button>
      </div>

      {/* .sidebar-new-chat — 240×52, padding 6px 8px 0 */}
      <div className="px-2 pt-1.5">
        <Link
          href="/"
          className="flex h-[46px] items-center rounded-[12px] bg-fennic-panel text-fennic-primary transition-[box-shadow,background-color] duration-150 hover:bg-fennic-hover hover:shadow-fennic-raise"
        >
          <span className="flex h-11 w-full items-center justify-between px-2">
            <span className="flex items-center gap-1.5">
              <KimiIcon name="new-chat" size={18} />
              <span className="text-sm leading-5 font-medium">New Chat</span>
            </span>
            <span className="flex items-center gap-0.5">
              <kbd className="inline-flex h-5 items-center justify-center rounded-[4px] bg-fennic-placeholder-bg px-1 text-sm leading-5 font-normal text-fennic-tertiary">
                Ctrl
              </kbd>
              <kbd className="inline-flex h-5 items-center justify-center rounded-[4px] bg-fennic-placeholder-bg px-1 text-sm leading-5 font-normal text-fennic-tertiary">
                K
              </kbd>
            </span>
          </span>
        </Link>
      </div>

      {/* .sidebar-nav — the only scrolling region */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav />
      </div>

      {/* .next-sidebar__footer — 240×60 */}
      <div className="h-[60px] bg-fennic-ground p-2">
        <div className="flex h-11 items-center">
          <button
            type="button"
            className="flex h-11 flex-1 items-center rounded-[12px] p-2 text-fennic-primary transition-colors duration-150 hover:bg-fennic-hover"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <KimiIcon name="not-login" size={28} />
              </span>
              <span className="text-sm leading-5 font-medium">Log in</span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Get App"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] p-[13px] text-fennic-tertiary transition-colors duration-150 hover:bg-fennic-hover"
          >
            <KimiIcon name="get-app" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
