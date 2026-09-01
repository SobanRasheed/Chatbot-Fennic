// Wordmark — the Fennic hero wordmark, in the one place that owns the dark swap.
//
// This was inline in KimiHomePage until the mode pages needed it too, and it is
// the one brand asset with real light/dark exposure: it has no ground of its own,
// so charcoal #2C2320 ink vanishes on the dark panel and warm off-white #F7F5F3
// vanishes on the light one. Two pixel-aligned files, picked by media query.
//
// <picture> rather than Tailwind's `dark:` variant, deliberately: the variant is
// class-based (&:is(.dark *)) and nothing in this app sets that class, so only a
// media query resolves. That mismatch already shipped a near-invisible wordmark
// once — duplicating this markup is how it would ship again, hence one component.
//
// The <source> serves the raw PNG (26 KB); the <img> under it keeps next/image's
// optimisation for the light path. Sizing matches the doodle's measured 154×44
// ink box — see scripts/brand-fennic-assets.mjs.

import Image from "next/image";

const BRAND = "/sites/kimi-com-185e587f/root-8a5edab2/brand";
const LIGHT_SRC = `${BRAND}/fennic-text.png`;
const DARK_SRC = `${BRAND}/fennic-text-dark.png`;

export default function Wordmark({ priority = false }: { priority?: boolean }) {
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={DARK_SRC} />
      <Image
        src={LIGHT_SRC}
        alt="Fennic"
        width={166}
        height={44}
        priority={priority}
        className="h-[37px] w-[139px] md:h-[44px] md:w-[166px]"
      />
    </picture>
  );
}
