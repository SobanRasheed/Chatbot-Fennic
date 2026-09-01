// Seed backend for the My Fennic workspace panel.
//
// This is the single source of truth the route handlers under
// `src/app/api/workspace/` read and mutate. It stands in for whatever real
// service ships later: swap the module's internals and the wire contracts in
// `src/types/fennic-workspace.ts` keep every client honest.
//
// Two deliberate properties:
//
// 1. **Deterministic.** The activity year is generated from a fixed anchor date
//    and a seeded PRNG, never `Date.now()`. A random or today-relative heatmap
//    would differ between the server render and the client hydration — React
//    logs that as a mismatch — and would make the prerendered `/my-fennic`
//    stale a day after every build. Swap ANCHOR for `new Date()` at the point a
//    real backend supplies the series.
// 2. **Mutable in-process.** `installed` / `added` flags live in module state so
//    the POST handlers actually change what a later GET returns. That is enough
//    to make the "Installed" and "Added" filters real in dev; it resets on
//    server restart and does not survive across serverless instances, which is
//    exactly the seam a database fills.

import type {
  ActivityDay,
  CompanionProfile,
  Plugin,
  PluginListResponse,
  Skill,
  SkillListResponse,
} from "@/types/fennic-workspace";

/* ── Activity ───────────────────────────────────────────────────────────── */

/** Last day of the rolling window. See note 1 above. */
const ANCHOR = "2026-09-30";
const WINDOW_DAYS = 371; // 53 weeks, so the grid always starts on a Sunday column

/** mulberry32 — small, fast, and stable across Node versions. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Thresholds are set against the distribution `generateActivity` actually
 * produces (counts land in 1–11 after the ramp and weekend damping), not against
 * round numbers. Buckets calibrated to round numbers left level 4 permanently
 * empty, so the brightest shade in the palette never appeared on the grid.
 */
function bucket(count: number): ActivityDay["level"] {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  return 4;
}

/** The last `STREAK` days of the window are always active. The reference shows a
 *  live streak in the header line, and a window whose final day happened to roll
 *  inactive reports "0 days in a row", which reads as broken rather than quiet. */
const STREAK = 6;

/**
 * A year of plausible daily counts: quiet weekends, a warm-up ramp over the
 * first months, and a scattering of zero days so the grid reads as a real
 * habit rather than a gradient.
 */
function generateActivity(seed: number, intensity: number): ActivityDay[] {
  const random = seeded(seed);
  const end = new Date(`${ANCHOR}T00:00:00Z`);
  const days: ActivityDay[] = [];

  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - offset);
    const weekday = date.getUTCDay();
    // Ramp from 35% to 100% across the window — the relationship warms up.
    const ramp = 0.35 + 0.65 * ((WINDOW_DAYS - offset) / WINDOW_DAYS);
    const weekend = weekday === 0 || weekday === 6 ? 0.45 : 1;
    const roll = random();
    const active = offset < STREAK || roll < 0.62 * ramp * weekend;
    const count = active
      ? Math.max(1, Math.round(random() * intensity * ramp * weekend))
      : 0;
    days.push({
      date: date.toISOString().slice(0, 10),
      count,
      level: bucket(count),
    });
  }

  return days;
}

// Two independent series. The intensities differ so the toggle shows a real
// change of shape, and both are high enough to reach level 4 — a series that
// tops out at 3 quietly retires the brightest shade in the palette.
const CLOSENESS = generateActivity(0x5eed_1a7e, 11);
const GROWTH = generateActivity(0x5eed_9203, 10);

/** Consecutive active days ending at the window's last day. */
function trailingStreak(days: readonly ActivityDay[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0 && days[i].count > 0; i -= 1) streak += 1;
  return streak;
}

const state: { profile: CompanionProfile } = {
  profile: {
    owner: "Titumama",
    daysTogether: 212,
    chatCount: CLOSENESS.reduce((total, day) => total + day.count, 0),
    streakDays: trailingStreak(CLOSENESS),
    selfGrowthEnabled: false,
  },
};

export function getProfile(): CompanionProfile {
  return { ...state.profile };
}

export function setSelfGrowth(enabled: boolean): CompanionProfile {
  state.profile = { ...state.profile, selfGrowthEnabled: enabled };
  return getProfile();
}

export function getActivity(): { closeness: ActivityDay[]; growth: ActivityDay[] } {
  return { closeness: [...CLOSENESS], growth: [...GROWTH] };
}

/* ── Plugins ────────────────────────────────────────────────────────────── */

// No `logo` on any entry yet: these are third-party brands and inventing their
// marks would be worse than the monogram tile the UI falls back to. Drop real
// files under public/sites/…/plugins/ and set `logo` — see `image specs.md` §9.
const PLUGINS: Plugin[] = [
  { slug: "github", name: "GitHub", monogram: "GH", topic: "Developer Tools", featured: true, installed: false,
    description: "Code hosting and developer collaboration platform. Browse repositories, read diffs, and open pull requests against branches you nominate." },
  { slug: "video-generation", name: "Video Generation", monogram: "VG", topic: "Creativity & 3D", featured: true, installed: false,
    description: "Generate high-quality videos from text descriptions, complete with shot list, pacing and optional narration." },
  { slug: "musepool", name: "musepool", monogram: "MP", topic: "Creativity & 3D", featured: false, installed: false,
    description: "A design inspiration library for Fennic. For any web, product or brand brief it returns references worth stealing from." },
  { slug: "public-market-investing", name: "Public Market Investing", monogram: "PM", topic: "Finance", featured: true, installed: false,
    description: "Public markets research and portfolio workflows across equities, ETFs and fixed income, with filings and fundamentals attached." },
  { slug: "wind-financial-data", name: "Wind Financial Data Services", monogram: "WD", topic: "Finance", featured: false, installed: false,
    description: "A professional, comprehensive and authoritative financial data terminal covering Chinese and global markets." },
  { slug: "vivify", name: "Vivify", monogram: "VF", topic: "Productivity", featured: true, installed: false,
    description: "Turn static reports into a vivid, living web experience you can hand over as a single link." },
  { slug: "caixin-data", name: "Caixin Data", monogram: "CX", topic: "Finance", featured: false, installed: false,
    description: "Caixin Data Platform serves financial professionals with macro, industry and company-level datasets." },
  { slug: "pubmed-pmc", name: "PubMed & PMC", monogram: "PC", topic: "Research", featured: true, installed: false,
    description: "Search biomedical papers and retrieve metadata, abstracts and full text wherever it is openly licensed." },
  { slug: "notion", name: "Notion", monogram: "NO", topic: "Productivity", featured: false, installed: false,
    description: "Read and write pages and databases in a workspace you nominate, scoped to the pages you share." },
  { slug: "linear", name: "Linear", monogram: "LI", topic: "Developer Tools", featured: false, installed: false,
    description: "File, triage and update issues, and read a cycle's state without leaving the chat." },
  { slug: "figma", name: "Figma", monogram: "FI", topic: "Creativity & 3D", featured: false, installed: false,
    description: "Inspect frames, pull design tokens, and turn a selected node into code or a spec." },
  { slug: "arxiv", name: "arXiv", monogram: "AX", topic: "Research", featured: false, installed: false,
    description: "Full-text preprint search across physics, mathematics, computer science and quantitative biology." },
  { slug: "drive", name: "Google Drive", monogram: "GD", topic: "Productivity", featured: false, installed: false,
    description: "Read and write files in folders you pick. Folder-scoped by grant, never account-wide." },
  { slug: "postgres", name: "Postgres", monogram: "PG", topic: "Developer Tools", featured: false, installed: false,
    description: "Query a read replica by default; writes require a second explicit confirmation each time." },
  { slug: "semantic-scholar", name: "Semantic Scholar", monogram: "SS", topic: "Research", featured: false, installed: false,
    description: "Citation graph search — find what cites a paper, what it cites, and which claims moved the field." },
  { slug: "blender", name: "Blender", monogram: "BL", topic: "Creativity & 3D", featured: false, installed: false,
    description: "Drive a local Blender session: build scenes, set materials and render stills or turntables." },
  { slug: "stripe", name: "Stripe", monogram: "ST", topic: "Finance", featured: false, installed: false,
    description: "Read charges, subscriptions and payouts. Refunds and price changes always ask first." },
  { slug: "slack", name: "Slack", monogram: "SL", topic: "Productivity", featured: false, installed: false,
    description: "Summarise a channel or thread, and draft replies. Posting is never automatic." },
];

export function listPlugins(): Plugin[] {
  return PLUGINS.map((plugin) => ({ ...plugin }));
}

export function setPluginInstalled(slug: string, installed: boolean): Plugin | null {
  const plugin = PLUGINS.find((candidate) => candidate.slug === slug);
  if (!plugin) return null;
  plugin.installed = installed;
  return { ...plugin };
}

/* ── Skills ─────────────────────────────────────────────────────────────── */

// Every entry starts `added: false`, which is what makes the default "Added"
// filter land on the empty state. Adding one is a POST away.
const SKILLS: Skill[] = [
  { slug: "meeting-to-actions", name: "Meeting notes to actions", topic: "Productivity", featured: true, added: false, runs: 0, icon: "new-chat",
    description: "Turn a transcript into owners, deadlines and a one-paragraph summary for people who missed it." },
  { slug: "inbox-triage", name: "Inbox triage", topic: "Productivity", featured: false, added: false, runs: 0, icon: "new-chat",
    description: "Sort a morning's mail into reply-now, delegate, and archive, with drafts for the first pile." },
  { slug: "weekly-review", name: "Weekly review", topic: "Productivity", featured: false, added: false, runs: 0, icon: "my-kimi",
    description: "Pull the week's threads and projects into a review you can read in four minutes." },
  { slug: "dcf-model", name: "DCF model", topic: "Finance", featured: true, added: false, runs: 0, icon: "sheets",
    description: "Build a discounted cash-flow model from filings, with the assumptions broken out on their own tab." },
  { slug: "invoice-reconcile", name: "Invoice reconciliation", topic: "Finance", featured: false, added: false, runs: 0, icon: "sheets",
    description: "Match invoices against statements, flag the gaps, and total what is genuinely outstanding." },
  { slug: "literature-review", name: "Literature review", topic: "Academic", featured: true, added: false, runs: 0, icon: "deep-research",
    description: "Survey a field, group the papers by claim, and say plainly where the evidence disagrees." },
  { slug: "cite-and-format", name: "Cite and format", topic: "Academic", featured: false, added: false, runs: 0, icon: "deep-research",
    description: "Normalise every reference to APA, MLA or Chicago and catch the ones with no source at all." },
  { slug: "landing-copy", name: "Landing page copy", topic: "Marketing", featured: true, added: false, runs: 0, icon: "design",
    description: "Write a hero, three proof blocks and a close, in the voice your existing site already uses." },
  { slug: "seo-brief", name: "SEO brief", topic: "Marketing", featured: false, added: false, runs: 0, icon: "websites",
    description: "One page per target query: intent, the headings to cover, and what the top results leave out." },
  { slug: "code-review", name: "Code review checklist", topic: "Engineering", featured: true, added: false, runs: 0, icon: "plugins",
    description: "Walk a diff for correctness, then for the reuse and simplification passes reviewers skip." },
  { slug: "postmortem", name: "Incident postmortem", topic: "Engineering", featured: false, added: false, runs: 0, icon: "plugins",
    description: "Timeline, contributing causes and the two follow-ups worth doing — blameless by construction." },
  { slug: "brand-voice", name: "Brand voice guide", topic: "Creative", featured: true, added: false, runs: 0, icon: "design",
    description: "Derive a voice guide from writing you already like, with do/don't pairs rather than adjectives." },
  { slug: "storyboard", name: "Storyboard from script", topic: "Creative", featured: false, added: false, runs: 0, icon: "design",
    description: "Break a script into shots with framing, duration and a line of art direction each." },
];

export function listSkills(): Skill[] {
  return SKILLS.map((skill) => ({ ...skill }));
}

export function setSkillAdded(slug: string, added: boolean): Skill | null {
  const skill = SKILLS.find((candidate) => candidate.slug === slug);
  if (!skill) return null;
  skill.added = added;
  return { ...skill };
}

/* ── Queries ────────────────────────────────────────────────────────────────
   One implementation, used by both the route handlers and the server page's
   first paint, so an SSR list and a fetched list can never disagree.        */

const matches = (needle: string, ...haystack: string[]) =>
  needle.length === 0 ||
  haystack.some((text) => text.toLowerCase().includes(needle.toLowerCase().trim()));

export function queryPlugins({
  category = "All",
  q = "",
}: { category?: string; q?: string } = {}): PluginListResponse {
  const all = listPlugins();
  const plugins = all.filter((plugin) => {
    if (!matches(q, plugin.name, plugin.description, plugin.topic)) return false;
    if (category === "All") return true;
    if (category === "Installed") return plugin.installed;
    if (category === "Featured") return plugin.featured;
    return plugin.topic === category;
  });
  return {
    plugins,
    total: all.length,
    installedCount: all.filter((plugin) => plugin.installed).length,
  };
}

export function querySkills({
  category = "Added",
  q = "",
}: { category?: string; q?: string } = {}): SkillListResponse {
  const all = listSkills();
  const skills = all.filter((skill) => {
    if (!matches(q, skill.name, skill.description, skill.topic)) return false;
    if (category === "Added") return skill.added;
    if (category === "Featured") return skill.featured;
    return skill.topic === category;
  });
  return {
    skills,
    total: all.length,
    addedCount: all.filter((skill) => skill.added).length,
  };
}
