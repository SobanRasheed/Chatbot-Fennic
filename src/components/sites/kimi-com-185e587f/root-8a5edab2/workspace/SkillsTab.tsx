"use client";

// SkillsTab — reusable know-how, fed from /api/workspace/skills.
//
// Same shape as PluginsTab: chips and search are the query, the backend owns the
// list. The default category is "Added", which starts empty on a fresh
// workspace — that empty state is the reference's default view, not a bug.

import { useCallback, useEffect, useRef, useState } from "react";
import { FilterChips, TabHeading } from "./workspace-ui";
import { KimiIcon } from "../icons";
import { SKILL_CATEGORIES } from "@/types/fennic-workspace";
import type {
  Skill,
  SkillCategory,
  SkillListResponse,
} from "@/types/fennic-workspace";
import type { KimiIconName } from "../icons";

const CUSTOMIZE_ACTIONS = [
  { label: "Create a skill", hint: "Start from a blank brief" },
  { label: "From a document", hint: "Upload a file and keep its style" },
  { label: "From a past chat", hint: "Promote something that already worked" },
] as const;

function SkillCard({
  skill,
  onToggle,
  busy,
}: {
  skill: Skill;
  onToggle: (skill: Skill) => void;
  busy: boolean;
}) {
  return (
    <div className="group flex flex-col gap-2.5 rounded-[14px] border border-fennic-border bg-fennic-panel p-4 transition-[border-color,box-shadow] duration-[180ms] ease-fennic-card hover:border-fennic-line hover:shadow-fennic-raise">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-fennic-accent-soft text-fennic-accent">
          <KimiIcon name={skill.icon as KimiIconName} size={18} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-[15px] leading-6 font-medium text-fennic-primary">
            {skill.name}
          </h3>
          <span className="text-[12px] leading-4 text-fennic-faint">{skill.topic}</span>
        </div>
        <button
          type="button"
          onClick={() => onToggle(skill)}
          disabled={busy}
          aria-label={`${skill.added ? "Remove" : "Add"} ${skill.name}`}
          className={`inline-flex h-8 shrink-0 items-center rounded-[8px] px-3 text-[13px] leading-5 font-medium transition-[color,background-color,opacity] duration-150 disabled:opacity-50 ${
            skill.added
              ? "bg-fennic-accent-soft text-fennic-accent"
              : "text-fennic-secondary opacity-0 hover:bg-fennic-hover hover:text-fennic-primary group-hover:opacity-100 focus-visible:opacity-100"
          }`}
        >
          {skill.added ? "Added" : "Add"}
        </button>
      </div>
      <p className="text-[13px] leading-5 text-fennic-tertiary">{skill.description}</p>
    </div>
  );
}

export default function SkillsTab({ initial }: { initial: SkillListResponse }) {
  const [category, setCategory] = useState<SkillCategory>("Added");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (nextCategory: SkillCategory, nextQuery: string) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ category: nextCategory });
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      const response = await fetch(`/api/workspace/skills?${params}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData((await response.json()) as SkillListResponse);
    } catch (cause) {
      if ((cause as Error).name === "AbortError") return;
      setError("Could not reach the skill library.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (category === "Added" && query === "") {
      setData(initial);
      return;
    }
    const timer = setTimeout(() => void load(category, query), 180);
    return () => clearTimeout(timer);
  }, [category, query, initial, load]);

  // Dismiss the Customize menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const onToggle = useCallback(
    async (skill: Skill) => {
      const added = !skill.added;
      setBusySlug(skill.slug);
      setData((current) => ({
        ...current,
        skills: current.skills.map((entry) =>
          entry.slug === skill.slug ? { ...entry, added } : entry,
        ),
        addedCount: current.addedCount + (added ? 1 : -1),
      }));
      try {
        const response = await fetch("/api/workspace/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: skill.slug, added }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } catch {
        setError(`Could not ${added ? "add" : "remove"} ${skill.name}.`);
      } finally {
        setBusySlug(null);
        await load(category, query);
      }
    },
    [category, query, load],
  );

  return (
    <div className="flex flex-col gap-5">
      <TabHeading
        title="Skills"
        lede="Turn know-how into skills. Reuse them anytime."
        action={
          <>
            <button
              type="button"
              aria-label="Search skills"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-fennic-border bg-fennic-ground text-fennic-secondary transition-colors duration-150 hover:bg-fennic-hover hover:text-fennic-primary"
            >
              <SearchGlyph />
            </button>
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-fennic-accent px-3.5 text-[13px] leading-5 font-medium text-fennic-icon-inverse transition-opacity duration-150 hover:opacity-90"
              >
                Customize
                <KimiIcon
                  name="model-chevron"
                  size={14}
                  className={`transition-transform duration-150 ease-fennic-card ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute top-[calc(100%+6px)] right-0 z-20 flex w-[260px] flex-col rounded-[12px] border border-fennic-border bg-fennic-panel p-1 shadow-fennic-menu"
                >
                  {CUSTOMIZE_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-start gap-0.5 rounded-[8px] px-2.5 py-2 text-left transition-colors duration-150 hover:bg-fennic-hover"
                    >
                      <span className="text-sm leading-5 font-medium text-fennic-primary">
                        {action.label}
                      </span>
                      <span className="text-[12px] leading-4 text-fennic-tertiary">
                        {action.hint}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        }
      />

      {searchOpen ? (
        <label className="flex h-10 items-center gap-2 rounded-[12px] border border-fennic-border bg-fennic-ground px-3">
          <span className="sr-only">Search skills</span>
          <SearchGlyph />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search every skill"
            className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-fennic-primary outline-none placeholder:text-fennic-faint"
          />
        </label>
      ) : null}

      <DocumentToSkills />

      <FilterChips
        label="Skill categories"
        options={SKILL_CATEGORIES}
        value={category}
        onChange={setCategory}
      />

      {error ? (
        <p role="alert" className="text-[13px] leading-5 text-fennic-accent">
          {error}
        </p>
      ) : null}

      <div
        aria-busy={loading}
        className={`grid grid-cols-1 gap-3 transition-opacity duration-150 md:grid-cols-2 ${
          loading ? "opacity-60" : "opacity-100"
        }`}
      >
        {data.skills.map((skill) => (
          <SkillCard
            key={skill.slug}
            skill={skill}
            onToggle={onToggle}
            busy={busySlug === skill.slug}
          />
        ))}
      </div>

      {data.skills.length === 0 && !loading ? (
        <div className="rounded-[14px] border border-dashed border-fennic-line bg-fennic-ground px-6 py-14 text-center">
          <p className="text-[15px] leading-6 font-medium text-fennic-primary">
            {category === "Added" ? "You have not added a skill yet" : "Nothing matches"}
          </p>
          <p className="mx-auto mt-1 max-w-[420px] text-sm leading-5 text-fennic-tertiary">
            {category === "Added"
              ? "Open Featured to see what is worth keeping, or turn a document you already trust into one."
              : "Try a broader category, or a different search term."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** The upload promo above the chips. */
function DocumentToSkills() {
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-[14px] border border-fennic-border bg-fennic-ground p-3.5">
      <DocumentArt />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="text-[15px] leading-6 font-medium text-fennic-primary">
          Document to skills
        </h2>
        <p className="truncate text-[13px] leading-5 text-fennic-tertiary">
          Replicate styles easily by turning documents into skills.
        </p>
      </div>
      <button
        type="button"
        className="inline-flex h-9 shrink-0 items-center rounded-[10px] border border-fennic-line px-3.5 text-[13px] leading-5 font-medium text-fennic-primary transition-colors duration-150 hover:bg-fennic-hover"
      >
        Upload
      </button>
    </div>
  );
}

/** Two stacked sheets with a file badge — drawn rather than shipped as a PNG so
    it inherits the palette and stays crisp at any density. */
function DocumentArt() {
  return (
    <svg
      viewBox="0 0 64 44"
      aria-hidden
      className="h-11 w-16 shrink-0"
      fill="none"
    >
      <rect
        x="4.5"
        y="8.5"
        width="34"
        height="31"
        rx="4"
        fill="var(--fennic-panel)"
        stroke="var(--fennic-line)"
      />
      <rect
        x="16.5"
        y="3.5"
        width="34"
        height="31"
        rx="4"
        fill="var(--fennic-panel)"
        stroke="var(--fennic-line)"
      />
      <g stroke="var(--fennic-text-faint)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M22 12h16" />
        <path d="M22 17h22" />
        <path d="M22 22h12" />
      </g>
      <rect x="40" y="22" width="18" height="12" rx="3" fill="var(--fennic-accent)" />
      <path
        d="M45 28h8M49 25v6"
        stroke="var(--fennic-icon-inverse)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.2 10.2 13.5 13.5" />
    </svg>
  );
}
