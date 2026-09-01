"use client";

// Shared presentational parts for the My Fennic workspace panel.
//
// Same contract as page-ui.tsx: every colour, radius and shadow comes from a
// --fennic-* token so light and dark both work without a second thought. These
// are "use client" only because the panel's tabs are, and importing a server
// component into a client tree would force a boundary for no benefit.

import type { ReactNode } from "react";

/* ── Filter chips ───────────────────────────────────────────────────────── */

/**
 * The pill row under a tab's heading. Kimi renders the active chip as a filled
 * lozenge and the rest as bare text; ours does the same with the accent as the
 * fill so the selection is unambiguous in both colour schemes.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  /** Accessible name for the group, e.g. "Plugin categories". */
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1"
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] leading-5 font-medium whitespace-nowrap transition-colors duration-150 ${
              active
                ? "bg-fennic-accent text-fennic-icon-inverse"
                : "text-fennic-secondary hover:bg-fennic-hover hover:text-fennic-primary"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

/* ── Segmented control ──────────────────────────────────────────────────── */

/** Closeness / Growth — two mutually exclusive views of the same heatmap. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-[10px] bg-fennic-placeholder-bg p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex h-8 items-center rounded-[8px] px-3 text-[13px] leading-5 font-medium transition-colors duration-150 ${
              active
                ? "bg-fennic-panel text-fennic-primary shadow-fennic-raise"
                : "text-fennic-tertiary hover:text-fennic-primary"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tab heading ────────────────────────────────────────────────────────── */

export function TabHeading({
  title,
  lede,
  action,
}: {
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-fennic-primary">
          {title}
        </h1>
        {lede ? (
          <p className="text-sm leading-5 text-fennic-tertiary">{lede}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

/* ── Monogram tile ──────────────────────────────────────────────────────── */

/**
 * Stand-in for a plugin's real logo. Third-party marks are not ours to invent,
 * so an unbranded entry gets its initials on the accent wash instead of a
 * fabricated icon. Drop a file in and set `logo` to replace it — `image
 * specs.md` §9 has the sizes.
 */
export function MonogramTile({ text, size = 40 }: { text: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      className="flex shrink-0 items-center justify-center rounded-[10px] border border-fennic-border bg-fennic-accent-soft font-semibold tracking-[0.02em] text-fennic-accent"
    >
      {text}
    </span>
  );
}
