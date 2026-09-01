// ShortcutPills — publisher shortcut row under the composer per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/ShortcutPills.md

import type { KimiShortcutPill } from "@/types/kimi-com-185e587f";
import { KimiIcon } from "./icons";

const PILLS = [
  { label: "Deep Research", href: "/deep-research", icon: "deep-research" },
  { label: "Websites", href: "/websites", icon: "websites" },
  { label: "Sheets", href: "/sheets", icon: "sheets" },
  { label: "Design", href: "/design", icon: "design" },
] as const satisfies readonly KimiShortcutPill[];

export default function ShortcutPills() {
  return (
    <nav
      aria-label="Publisher shortcuts"
      className="mx-auto mt-6 flex w-full max-w-[337px] items-center gap-2 overflow-x-auto px-3 [scrollbar-width:none] md:mt-8 md:max-w-[768px] md:justify-center md:gap-3 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {PILLS.map((pill) => (
        <a
          key={pill.href}
          href={pill.href}
          className="flex h-9 shrink-0 items-center gap-1 rounded-[20px] border border-fennic-line bg-fennic-panel pr-3 pl-2.5 text-fennic-secondary whitespace-nowrap transition-colors duration-150 hover:bg-fennic-hover hover:text-fennic-primary"
        >
          <KimiIcon name={pill.icon} size={18} />
          <span className="text-sm leading-5">{pill.label}</span>
        </a>
      ))}
    </nav>
  );
}
