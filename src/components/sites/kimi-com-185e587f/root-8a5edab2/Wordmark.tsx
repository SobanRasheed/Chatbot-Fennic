"use client";

// Wordmark — the Fennic hero wordmark, in the one place that owns the dark swap.
//
// This was inline in KimiHomePage until the mode pages needed it too, and it is
// the one brand asset with real light/dark exposure: it has no ground of its
// own, so charcoal #2C2320 ink vanishes on the dark panel and warm off-white
// #F7F5F3 vanishes on the light one. Two pixel-aligned files, picked apart
// below.
//
// Two pickers, deliberately:
// - The `<picture>` media query covers the server render and the first client
//   frame — the OS preference, which is also the default "system" theme.
// - Once the preferences store has hydrated, the resolved theme takes over.
//   A user who pinned "dark" in Settings on a light OS is exactly the case the
//   media query cannot see, and the reason this is a client component.
//
// The <source> serves the raw PNG (26 KB); the <img> under it keeps next/image's
// optimisation for the light path. Sizing matches the doodle's measured 154×44
// ink box — see scripts/brand-fennic-assets.mjs.

import Image from "next/image";
import { useResolvedTheme } from "./preferences";

const BRAND = "/sites/kimi-com-185e587f/root-8a5edab2/brand";
const LIGHT_SRC = `${BRAND}/fennic-text.png`;
const DARK_SRC = `${BRAND}/fennic-text-dark.png`;

export default function Wordmark({ priority = false }: { priority?: boolean }) {
  const resolvedTheme = useResolvedTheme();

  // Not decided yet (server, or system theme before matchMedia has reported):
  // the media query is the correct answer, so let it stand.
  if (resolvedTheme === null) {
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

  return (
    <Image
      src={resolvedTheme === "dark" ? DARK_SRC : LIGHT_SRC}
      alt="Fennic"
      width={166}
      height={44}
      priority={priority}
      className="h-[37px] w-[139px] md:h-[44px] md:w-[166px]"
    />
  );
}
