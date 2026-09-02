"use client";

// preferences.ts — the account-level choices a signed-in user makes: theme,
// language, and the switches on the settings screen.
//
// One module-level store, no provider: the profile menu, the wordmark and the
// settings screen all subscribe through useSyncExternalStore, so a change in
// one surface is seen by the others in the same tab, and localStorage carries
// it across reloads. The very first paint is handled by the inline script in
// layout.tsx, which sets the `light`/`dark` class before anything renders —
// without that there would be a flash of the OS-preferred palette whenever the
// user has pinned a theme.
//
// The theme mechanism reuses what globals.css already defines: `.dark` forces
// the dark palette, `.light` forces light (the media mirror is
// `:root:not(.light)`, so `.light` wins even under a dark OS), and no class
// follows the OS. Nothing here needs a CSS change.

import { useSyncExternalStore } from "react";

/* ── Languages ────────────────────────────────────────────────────────────── */

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function languageLabel(code: LanguageCode): string {
  return LANGUAGES.find((entry) => entry.code === code)?.label ?? "English";
}

/* ── Store ────────────────────────────────────────────────────────────────── */

export type ThemePreference = "light" | "dark" | "system";

export interface Preferences {
  theme: ThemePreference;
  language: LanguageCode;
  notifications: boolean;
  expandSidebarOnSearch: boolean;
  memory: boolean;
}

const DEFAULTS: Preferences = {
  theme: "system",
  language: "en",
  notifications: true,
  expandSidebarOnSearch: false,
  memory: true,
};

const STORAGE_KEY = "fennic-preferences";

const isTheme = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const isLanguage = (value: unknown): value is LanguageCode =>
  typeof value === "string" && LANGUAGES.some((entry) => entry.code === value);

function readStored(): Preferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      theme: isTheme(parsed.theme) ? parsed.theme : DEFAULTS.theme,
      language: isLanguage(parsed.language) ? parsed.language : DEFAULTS.language,
      notifications:
        typeof parsed.notifications === "boolean"
          ? parsed.notifications
          : DEFAULTS.notifications,
      expandSidebarOnSearch:
        typeof parsed.expandSidebarOnSearch === "boolean"
          ? parsed.expandSidebarOnSearch
          : DEFAULTS.expandSidebarOnSearch,
      memory: typeof parsed.memory === "boolean" ? parsed.memory : DEFAULTS.memory,
    };
  } catch {
    return DEFAULTS;
  }
}

function writeStored(next: Preferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or storage disabled — the session still works,
    // the choice just won't survive a reload.
  }
}

function applyThemeClass(theme: ThemePreference) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

// The store hydrates from localStorage on the first client subscription —
// never at import time, which would run on the server during prerender.
let current: Preferences = DEFAULTS;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  current = readStored();
}

function subscribe(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Server snapshot: the defaults. Hydration renders these, then the post-mount
// re-read swaps in whatever was stored — the standard useSyncExternalStore
// pattern, and the reason nothing here flashes.
const SERVER_SNAPSHOT: Preferences = DEFAULTS;

export function usePreferences(): Preferences {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => SERVER_SNAPSHOT,
  );
}

export function setPreferences(patch: Partial<Preferences>) {
  current = { ...current, ...patch };
  writeStored(current);
  if (patch.theme !== undefined) applyThemeClass(current.theme);
  listeners.forEach((listener) => listener());
}

/* ── Derived: the theme actually in effect ───────────────────────────────── */

export type ResolvedTheme = "light" | "dark";

/**
 * The palette the page is on right now: the user's pinned theme, or the OS
 * preference when set to "system". `null` until known — on the server, and on
 * the client for the hydration frame — which is exactly when the wordmark falls
 * back to its `<picture>` media query. Consumers treat null as "not decided
 * yet", never as a third theme.
 *
 * The OS preference is itself an external store: matchMedia with a `null`
 * server snapshot, so the hydration frame renders the same `null` the server
 * did and React swaps in the live value immediately after mount.
 */
function subscribeSystemDark(listener: () => void): () => void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

const getSystemDarkSnapshot = (): boolean | null =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const getSystemDarkServerSnapshot = (): boolean | null => null;

export function useResolvedTheme(): ResolvedTheme | null {
  const { theme } = usePreferences();
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot,
  );

  if (theme !== "system") return theme;
  return systemDark === null ? null : systemDark ? "dark" : "light";
}
