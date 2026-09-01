"use client";

// PluginsTab — the connector directory, fed from /api/workspace/plugins.
//
// Every filter change is a request, not a client-side array filter. That is the
// point of the tab: the chip row and the search box are the query, the backend
// owns the catalog, and swapping the seed module in
// `src/lib/workspace/catalog.ts` for a real service changes nothing here.
//
// The first page comes in as `initial` from the server render, so there is no
// spinner on arrival and the grid is in the HTML for anything that does not run
// JavaScript.

import { useCallback, useEffect, useRef, useState } from "react";
import { FilterChips, MonogramTile, TabHeading } from "./workspace-ui";
import { PLUGIN_CATEGORIES } from "@/types/fennic-workspace";
import type {
  Plugin,
  PluginCategory,
  PluginListResponse,
} from "@/types/fennic-workspace";

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("") || "··";

function PluginCard({
  plugin,
  onToggle,
  busy,
}: {
  plugin: Plugin;
  onToggle: (plugin: Plugin) => void;
  busy: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-[14px] border border-fennic-border bg-fennic-panel p-3.5 transition-[border-color,box-shadow] duration-[180ms] ease-fennic-card hover:border-fennic-line hover:shadow-fennic-raise">
      <MonogramTile text={plugin.monogram ?? initials(plugin.name)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="truncate text-[15px] leading-6 font-medium text-fennic-primary">
          {plugin.name}
        </h3>
        {/* Single line, clipped — the reference truncates rather than wraps, and
            it is what keeps every card the same height. */}
        <p className="truncate text-[13px] leading-5 text-fennic-tertiary">
          {plugin.description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(plugin)}
        disabled={busy}
        aria-label={`${plugin.installed ? "Remove" : "Install"} ${plugin.name}`}
        className={`inline-flex h-8 shrink-0 items-center rounded-[8px] px-3 text-[13px] leading-5 font-medium transition-[color,background-color,opacity] duration-150 disabled:opacity-50 ${
          plugin.installed
            ? "bg-fennic-accent-soft text-fennic-accent"
            : "text-fennic-secondary opacity-0 hover:bg-fennic-hover hover:text-fennic-primary group-hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        {plugin.installed ? "Installed" : "Install"}
      </button>
    </div>
  );
}

export default function PluginsTab({ initial }: { initial: PluginListResponse }) {
  const [category, setCategory] = useState<PluginCategory>("All");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Abort the previous request so a slow early response cannot land after a
  // faster later one and paint the wrong category.
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(
    async (nextCategory: PluginCategory, nextQuery: string) => {
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ category: nextCategory });
        if (nextQuery.trim()) params.set("q", nextQuery.trim());
        const response = await fetch(`/api/workspace/plugins?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setData((await response.json()) as PluginListResponse);
      } catch (cause) {
        if ((cause as Error).name === "AbortError") return;
        setError("Could not reach the plugin directory.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [],
  );

  // Debounced so typing does not fire a request per keystroke. The category
  // arrives through the same effect, which keeps one code path for both inputs.
  useEffect(() => {
    if (category === "All" && query === "") {
      setData(initial);
      return;
    }
    const timer = setTimeout(() => void load(category, query), 180);
    return () => clearTimeout(timer);
  }, [category, query, initial, load]);

  const onToggle = useCallback(
    async (plugin: Plugin) => {
      const installed = !plugin.installed;
      setBusySlug(plugin.slug);
      // Optimistic: flip the row now, reconcile with the response below.
      setData((current) => ({
        ...current,
        plugins: current.plugins.map((entry) =>
          entry.slug === plugin.slug ? { ...entry, installed } : entry,
        ),
        installedCount: current.installedCount + (installed ? 1 : -1),
      }));
      try {
        const response = await fetch("/api/workspace/plugins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: plugin.slug, installed }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await load(category, query);
      } catch {
        setError(`Could not ${installed ? "install" : "remove"} ${plugin.name}.`);
        await load(category, query);
      } finally {
        setBusySlug(null);
      }
    },
    [category, query, load],
  );

  return (
    <div className="flex flex-col gap-5">
      <TabHeading
        title="Plugins"
        lede="Connect external tools to Fennic so it can use apps and services to complete tasks"
        action={
          <span className="hidden text-[13px] leading-5 text-fennic-faint sm:inline">
            {data.installedCount} of {data.total} installed
          </span>
        }
      />

      <label className="flex h-10 items-center gap-2 rounded-[12px] border border-fennic-border bg-fennic-ground px-3">
        <span className="sr-only">Search plugins</span>
        <SearchGlyph />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the directory"
          className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-fennic-primary outline-none placeholder:text-fennic-faint"
        />
      </label>

      <FilterChips
        label="Plugin categories"
        options={PLUGIN_CATEGORIES}
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
        {data.plugins.map((plugin) => (
          <PluginCard
            key={plugin.slug}
            plugin={plugin}
            onToggle={onToggle}
            busy={busySlug === plugin.slug}
          />
        ))}
      </div>

      {data.plugins.length === 0 && !loading ? (
        <div className="rounded-[14px] border border-dashed border-fennic-line bg-fennic-ground px-6 py-12 text-center">
          <p className="text-[15px] leading-6 font-medium text-fennic-primary">
            {category === "Installed" ? "No plugins installed yet" : "Nothing matches"}
          </p>
          <p className="mt-1 text-sm leading-5 text-fennic-tertiary">
            {category === "Installed"
              ? "Browse All and install one — it appears here and Fennic may call it on your behalf."
              : "Try a broader category, or a different search term."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="h-4 w-4 shrink-0 text-fennic-faint"
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
