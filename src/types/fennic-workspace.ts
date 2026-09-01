/**
 * Types for the My Fennic workspace panel (`/my-fennic`) — the three-tab surface
 * behind the sidebar's "My Fennic" row: My Fennic, Plugins, Skills.
 *
 * These are the wire contracts, shared by the route handlers under
 * `src/app/api/workspace/` and the client tabs that fetch them. Keep them in
 * sync with `src/lib/workspace/catalog.ts`, which is the seed backend.
 */

/* ── Tabs ───────────────────────────────────────────────────────────────── */

export const WORKSPACE_TABS = ["my-fennic", "plugins", "skills"] as const;

export type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

export function isWorkspaceTab(value: string | undefined): value is WorkspaceTab {
  return WORKSPACE_TABS.includes(value as WorkspaceTab);
}

/* ── My Fennic tab ──────────────────────────────────────────────────────── */

/** Which relationship metric the heatmap is showing. */
export type CompanionMetric = "closeness" | "growth";

/**
 * One day in the activity heatmap. `level` is a 0–4 bucket rather than a raw
 * count so the palette stays the client's business and the backend never has to
 * know how many shades exist.
 */
export interface ActivityDay {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  /** Interactions on that day. */
  count: number;
  /** 0 = nothing, 4 = the busiest bucket in the window. */
  level: 0 | 1 | 2 | 3 | 4;
}

/** The companion's standing with this user — the header block's numbers. */
export interface CompanionProfile {
  /** Display name of the account, e.g. "Titumama". */
  owner: string;
  /** Days since the account was created. */
  daysTogether: number;
  /** Lifetime chat count. */
  chatCount: number;
  /** Current consecutive-day streak. */
  streakDays: number;
  /** Whether self-growth has been switched on. */
  selfGrowthEnabled: boolean;
}

export interface WorkspaceProfileResponse {
  profile: CompanionProfile;
  /** One entry per day, oldest first — a full rolling year. */
  activity: {
    closeness: ActivityDay[];
    growth: ActivityDay[];
  };
}

/* ── Plugins tab ────────────────────────────────────────────────────────── */

export const PLUGIN_CATEGORIES = [
  "Installed",
  "All",
  "Featured",
  "Finance",
  "Productivity",
  "Creativity & 3D",
  "Developer Tools",
  "Research",
] as const;

export type PluginCategory = (typeof PLUGIN_CATEGORIES)[number];

/** A catalog category a plugin can actually belong to — not a view filter. */
export type PluginTopic = Exclude<PluginCategory, "Installed" | "All" | "Featured">;

export interface Plugin {
  /** Stable url-safe id; the mutation route's path segment. */
  slug: string;
  name: string;
  /** One line, shown truncated to a single line in the card. */
  description: string;
  topic: PluginTopic;
  featured: boolean;
  installed: boolean;
  /**
   * Optional logo under `/sites/kimi-com-185e587f/root-8a5edab2/plugins/`.
   * Omitted entries fall back to a monogram tile — see `image specs.md` §9.
   */
  logo?: string;
  /** Two-letter monogram for the fallback tile. Derived if absent. */
  monogram?: string;
}

export interface PluginListResponse {
  plugins: Plugin[];
  /** Total before filtering, for the "N available" count. */
  total: number;
  installedCount: number;
}

/* ── Skills tab ─────────────────────────────────────────────────────────── */

export const SKILL_CATEGORIES = [
  "Added",
  "Featured",
  "Productivity",
  "Finance",
  "Academic",
  "Marketing",
  "Engineering",
  "Creative",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type SkillTopic = Exclude<SkillCategory, "Added" | "Featured">;

export interface Skill {
  slug: string;
  name: string;
  description: string;
  topic: SkillTopic;
  featured: boolean;
  /** Whether the user has added it to their own set. */
  added: boolean;
  /** How many times it has been run in this workspace. */
  runs: number;
  /** Registry icon key rendered in the card tile. */
  icon: string;
}

export interface SkillListResponse {
  skills: Skill[];
  total: number;
  addedCount: number;
}
