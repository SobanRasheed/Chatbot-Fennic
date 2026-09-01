// page-ui — shared presentational primitives for the subpages.
//
// Why this file exists: five routes are authored in parallel, and without a
// shared vocabulary each one drifts into its own spacing/radius/shadow dialect.
// Everything here is a server component (no state, no effects) and every colour,
// shadow and easing comes from a --fennic-* token, so light/dark both work for
// free. If a page needs a new shape, add it here rather than hand-rolling
// classes in the route.

import Link from "next/link";
import type { ReactNode } from "react";
import { KimiIcon, type KimiIconName } from "./icons";

/* ── Page intro ─────────────────────────────────────────────────────────── */

export function PageIntro({
  eyebrow,
  title,
  lede,
  children,
}: {
  /** Small accent line above the title. */
  eyebrow?: string;
  title: string;
  lede?: string;
  /** CTA row or anything else that sits under the lede. */
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 pb-10">
      {eyebrow ? (
        <span className="text-[13px] leading-5 font-medium tracking-[0.04em] text-fennic-accent uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.01em] text-fennic-primary md:text-[36px] md:leading-[44px]">
        {title}
      </h1>
      {lede ? (
        <p className="max-w-[640px] text-[15px] leading-6 text-fennic-secondary md:text-base md:leading-7">
          {lede}
        </p>
      ) : null}
      {children ? <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────────────── */

export function Section({
  heading,
  description,
  icon,
  action,
  children,
}: {
  heading: string;
  description?: string;
  icon?: KimiIconName;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 pb-12">
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="flex items-center gap-2 text-[17px] leading-6 font-semibold text-fennic-primary md:text-xl md:leading-7">
            {icon ? (
              <KimiIcon name={icon} size={20} className="shrink-0 text-fennic-accent" />
            ) : null}
            {heading}
          </h2>
          {description ? (
            <p className="text-sm leading-5 text-fennic-tertiary">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/* ── Cards ──────────────────────────────────────────────────────────────── */

export function CardGrid({
  columns = 2,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-3 md:gap-4 ${
        columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
      }`}
    >
      {children}
    </div>
  );
}

/** Static panel. `href` turns it into a link with the hover lift. */
export function Card({
  title,
  body,
  icon,
  meta,
  href,
  children,
}: {
  title: string;
  body?: string;
  icon?: KimiIconName;
  /** Trailing footnote — counts, tags, timestamps. */
  meta?: string;
  href?: string;
  children?: ReactNode;
}) {
  const inner = (
    <>
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-fennic-accent-soft text-fennic-accent">
            <KimiIcon name={icon} size={18} />
          </span>
        ) : null}
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-[15px] leading-6 font-medium text-fennic-primary">
            {title}
          </h3>
          {body ? (
            <p className="text-sm leading-5 text-fennic-secondary">{body}</p>
          ) : null}
        </div>
      </div>
      {children}
      {meta ? (
        <p className="mt-auto pt-1 text-[13px] leading-5 text-fennic-faint">{meta}</p>
      ) : null}
    </>
  );

  const shell =
    "flex h-full flex-col gap-3 rounded-[16px] border border-fennic-border bg-fennic-panel p-4 shadow-fennic-raise";

  if (href) {
    return (
      <Link
        href={href}
        className={`${shell} transition-[box-shadow,border-color,transform] duration-[180ms] ease-fennic-card hover:-translate-y-0.5 hover:border-fennic-line hover:shadow-fennic-floating`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={shell}>{inner}</div>;
}

/* ── Small parts ────────────────────────────────────────────────────────── */

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-fennic-accent-soft px-2.5 text-[13px] leading-5 font-medium text-fennic-accent">
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-[6px] bg-fennic-placeholder-bg px-2 text-[12px] leading-5 text-fennic-tertiary">
      {children}
    </span>
  );
}

/** Terracotta primary / outlined secondary. Renders as a Link when href is set.
    Deliberately takes no onClick — these render inside server components. */
export function ActionButton({
  href,
  variant = "primary",
  children,
}: {
  href?: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  const base =
    "inline-flex h-10 items-center justify-center gap-1.5 rounded-[12px] px-4 text-sm leading-5 font-medium transition-colors duration-150";
  const skin =
    variant === "primary"
      ? "bg-fennic-accent text-fennic-icon-inverse hover:opacity-90"
      : "border border-fennic-line text-fennic-primary hover:bg-fennic-hover";
  const className = `${base} ${skin}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {children}
    </button>
  );
}

/** Numbered how-it-works list. */
export function Steps({ items }: { items: readonly { title: string; body: string }[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, index) => (
        <li
          key={item.title}
          className="flex gap-3 rounded-[14px] border border-fennic-border bg-fennic-panel p-4"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fennic-accent text-[13px] leading-5 font-semibold text-fennic-icon-inverse">
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-[15px] leading-6 font-medium text-fennic-primary">
              {item.title}
            </h3>
            <p className="text-sm leading-5 text-fennic-secondary">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Example-prompt row — the "try this" affordance. */
export function PromptRow({ prompt }: { prompt: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[12px] border border-fennic-border bg-fennic-ground px-3 py-2.5">
      <KimiIcon name="new-chat" size={16} className="shrink-0 text-fennic-accent" />
      <p className="min-w-0 flex-1 text-sm leading-5 text-fennic-secondary">{prompt}</p>
    </div>
  );
}

/** Zero-state block for lists that have nothing in them yet. */
export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon?: KimiIconName;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-fennic-line bg-fennic-ground px-6 py-12 text-center">
      {icon ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fennic-accent-soft text-fennic-accent">
          <KimiIcon name={icon} size={22} />
        </span>
      ) : null}
      <h3 className="text-[15px] leading-6 font-medium text-fennic-primary">{title}</h3>
      {body ? (
        <p className="max-w-[420px] text-sm leading-5 text-fennic-tertiary">{body}</p>
      ) : null}
      {children}
    </div>
  );
}
