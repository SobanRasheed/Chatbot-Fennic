"use client";

// SidebarNav — the scrollable nav body (3 sections) per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/SidebarNav.md

import { useState } from "react";
import type { KimiNavItem } from "@/types/kimi-com-185e587f";
import { KimiIcon, type KimiIconName } from "./icons";

const TOP_ITEMS = [
  { label: "My Fennic", href: "/my-fennic", icon: "my-kimi" },
  { label: "Plugins", href: "/plugins", icon: "plugins" },
  { label: "Deep Research", href: "/deep-research", icon: "deep-research" },
] as const satisfies readonly KimiNavItem[];

const MORE_ITEMS = [
  { label: "Websites", href: "/websites", icon: "websites" },
  { label: "Sheets", href: "/sheets", icon: "sheets" },
  { label: "Design", href: "/design", icon: "design" },
] as const satisfies readonly KimiNavItem[];

const ROW_TRANSITION =
  "transition-[background-color,color,box-shadow] duration-150 hover:bg-fennic-hover";

function NavItem({ item }: { item: KimiNavItem & { icon: KimiIconName } }) {
  return (
    <a
      href={item.href}
      className={`block w-full rounded-[12px] text-fennic-primary ${ROW_TRANSITION}`}
    >
      <span className="flex h-10 items-center gap-1.5 px-2">
        <KimiIcon name={item.icon} size={18} />
        <span className="flex-1 overflow-hidden text-sm leading-5 font-normal whitespace-nowrap text-ellipsis">
          {item.label}
        </span>
      </span>
    </a>
  );
}

export default function SidebarNav() {
  // more-list is expanded on load; Projects section starts expanded.
  const [moreOpen, setMoreOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <nav className="flex flex-col gap-3 pb-2 pl-2 pr-2">
      {/* Section 1 — main list */}
      <div className="flex flex-col">
        {TOP_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
        {/* text-left: <button> keeps the UA's center alignment (Tailwind
            preflight does not reset it), which would offset the label
            against the <a> rows. */}
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className={`flex h-10 w-full items-center gap-1.5 rounded-[12px] px-2 text-left text-fennic-primary ${ROW_TRANSITION}`}
        >
          <KimiIcon name="collapse" size={20} />
          <span className="flex-1 overflow-hidden text-sm leading-5 font-normal whitespace-nowrap text-ellipsis">
            Collapse
          </span>
          <KimiIcon
            name="collapse-chevron"
            size={18}
            className={`text-fennic-tertiary transition-transform duration-150 ease-fennic-card ${
              moreOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-in ${
            moreOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="flex flex-col overflow-hidden">
            {MORE_ITEMS.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Section 2 — Projects */}
      <div className="flex flex-col">
        <div className="flex h-10 items-center justify-between gap-2 rounded-[8px] px-2">
          <button
            type="button"
            onClick={() => setProjectsOpen((open) => !open)}
            className="flex h-7 items-center gap-1 rounded-[8px] px-1.5 text-left text-sm text-fennic-tertiary"
          >
            Projects
            <KimiIcon
              name="projects-chevron"
              size={14}
              className={`transition-opacity duration-150 ease-fennic-card ${
                projectsOpen ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
          <button
            type="button"
            aria-label="New project"
            className={`flex h-7 w-7 items-center justify-center rounded-[8px] text-fennic-tertiary ${ROW_TRANSITION}`}
          >
            <KimiIcon name="new-project" size={14} />
          </button>
        </div>
        {projectsOpen ? (
          <button
            type="button"
            className={`flex h-10 w-full items-center gap-1.5 rounded-[12px] px-2 text-left text-fennic-primary ${ROW_TRANSITION}`}
          >
            <KimiIcon name="new-project" size={18} />
            <span className="text-sm leading-5 font-normal">New project</span>
          </button>
        ) : null}
      </div>

      {/* Section 3 — Chats */}
      <div className="flex flex-col">
        <div className="flex h-10 items-center justify-between gap-2 rounded-[8px] px-2">
          <div className="flex h-7 items-center px-1.5 text-sm text-fennic-tertiary">
            Chats
          </div>
        </div>
        <div className="pb-1">
          <button
            type="button"
            className={`inline-block w-full rounded-[12px] px-2 py-2.5 text-left text-sm leading-5 font-normal text-fennic-secondary ${ROW_TRANSITION} hover:text-fennic-primary`}
          >
            Log in to sync chat history
          </button>
        </div>
      </div>
    </nav>
  );
}
