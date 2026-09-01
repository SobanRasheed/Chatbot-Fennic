/**
 * Publisher modes — the per-product variants of the new-chat screen.
 *
 * Clicking Deep Research, Websites, Sheets or Design in the sidebar does not open
 * a content page; it opens the composer *in that mode*: same wordmark, a
 * mode-specific placeholder, the mode named in the composer's toolbar, and that
 * mode's gallery underneath. These are the shapes that describes.
 */

import type { KimiIconName } from "@/components/sites/kimi-com-185e587f/root-8a5edab2/icons";

/** Websites filters its gallery by these; every other mode has no tab row. */
export const WEBSITE_CATEGORIES = [
  "All",
  "Game",
  "Visualization",
  "Dashboard",
  "Tool",
  "Landing Page",
] as const;

export type WebsiteCategory = (typeof WEBSITE_CATEGORIES)[number];

export interface ModeCard {
  title: string;
  /** Local asset path under /sites/kimi-com-185e587f/root-8a5edab2/. */
  image: string;
  href: string;
  /** Opens in a new tab (the scraped kimi.link / kimi.page shares do). */
  external?: boolean;
  /** Websites only — which filter tab this card belongs to. */
  category?: Exclude<WebsiteCategory, "All">;
}

/**
 * How the gallery under the composer is introduced. `tabs` is the Websites
 * treatment (a filter row); `featured` is everything else (a single caption).
 */
export type ModeGalleryStyle =
  | { kind: "tabs" }
  | { kind: "featured"; caption: string };

export interface PublisherMode {
  /** Route segment, and the key used to look the mode up. */
  slug: "deep-research" | "websites" | "sheets" | "design";
  /** Name in the sidebar, the composer chip and the document title. */
  label: string;
  icon: KimiIconName;
  /** Composer placeholder — the one line that tells you what this mode is for. */
  placeholder: string;
  /** Meta description for the route. */
  description: string;
  gallery: ModeGalleryStyle;
  cards: readonly ModeCard[];
}
