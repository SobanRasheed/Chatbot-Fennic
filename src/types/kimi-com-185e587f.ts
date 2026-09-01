/** Types for the kimi-com-185e587f clone (kimi.com new-chat home). */

export interface KimiNavItem {
  /** Visible label */
  label: string;
  /** Route href (internal or external) */
  href: string;
  /** Icon key into the icon registry */
  icon: string;
  /** Small trailing badge, e.g. "Beta" */
  badge?: string;
  /** Render as external link */
  external?: boolean;
}

export interface KimiInspirationCard {
  /** Caption shown under the image */
  title: string;
  /** Local asset path under /sites/kimi-com-185e587f/root-8a5edab2/ */
  image: string;
  /** Destination href from the original site */
  href: string;
  /** Opens in a new tab (kimi.link / kimi.page shares) */
  external?: boolean;
}

export interface KimiInspirationRegion {
  /** Heading label; the first region has none */
  heading?: string;
  /** 24x24 heading icon (local path), only for named regions */
  icon?: string;
  cards: KimiInspirationCard[];
}

export interface KimiModelOption {
  /** Model name shown in menu and trigger */
  name: string;
  /** Description line in the menu */
  description: string;
}

export interface KimiShortcutPill {
  label: string;
  href: string;
  /** Icon key into the icon registry */
  icon: string;
}
