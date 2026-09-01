# InspirationSection — explore content (modules, headings, card grid) + ExploreContent gallery

**Screenshots:**
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-inspiration-cards.png`
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-agent-swarm-section.png`
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/mobile-cards.png`

**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/InspirationSection.tsx`

## Structure (verified live DOM, post-mount)

```
div.home-explore-list-content        768px, block   ← rendered by the PAGE (lazy mount target)
└── div.explore-inspiration-gallery  768px, flex COLUMN, gap 24px   ← ExploreContent
    └── section.explore-inspiration-module ×6     flex column, gap 12px
        ├── h2.explore-inspiration-module-title   (only for named sections — first module has none)
        └── div.explore-inspiration-content       GRID, 3 cols, gap 16px, padding 0 16px
```

Measured module heights at 1440×900: first module 347 (grid only, one extra row), titled modules 201 (title 24 + gap 12 + grid 165).

## Exact CSS values

`.explore-inspiration-gallery` (ExploreContent root)
- width 768px (100%); display flex; flex-direction column; gap **24px**
- **No padding-bottom** — the surrounding `.home-explore-list` (rendered by the page) already carries `padding-bottom: 100px`. Do not double-pad.

`section.explore-inspiration-module`
- display flex; flex-direction column; gap **12px**

Heading `h2.explore-inspiration-module-title` (named sections only — first has no heading)
- height 24px; padding `0 16px`; display flex; align-items center; gap **6px**
- icon: 24×24 (`next/image`, local path from data)
- label: 14px/20px, color `rgba(0,0,0,0.6)`, weight 400

Card grid `div.explore-inspiration-content`
- padding `0 16px`; display grid; gap **16px**; grid-template-columns `repeat(3, 1fr)` (desktop)
- Mobile: padding `0 12px`; gap **12px**; `repeat(2, 1fr)`

Card (`<a>`)
- display flex; flex-direction column; gap **8px** (desktop) / **6px** (mobile)
- image wrapper: border-radius **16px**; border 1px solid `rgba(0,0,0,0.13)`; background `rgba(0,0,0,0.05)`; overflow hidden; `aspect-[233/136]`; image `object-cover` width 100%
- caption `p`: 14px/20px, color `rgba(0,0,0,0.6)`, padding `0 8px` (desktop) / `0 4px` (mobile); single-line ellipsis (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)
- **Hover: caption color → `rgba(0,0,0,0.9)` transition color 0.2s; image wrapper opacity → 0.9, transition 0.18s `cubic-bezier(0.23,1,0.32,1)` (`ease-kimi-card` token exists in globals.css)**
- External cards (`external: true`): `<a href target="_blank" rel="noreferrer">`; internal: plain `<a href>`

## Content

Import `EXPLORE_SECTIONS` from `./explore-data` (already written — 6 sections, 21 cards, real titles/hrefs/local image paths). Do not duplicate the data; do not add or reorder anything.

Heading icon images (local, from data `icon` field): `showcase/swarm.svg`, `deep-research.svg`, `website.svg`, `doc.svg`, `xlsx.svg` under the site asset root.

## Interaction model

INTERACTION MODEL: hover-driven (caption color + image opacity transitions). Static otherwise — no scroll reveal (cards are simply there once the explore content mounts).

## Responsive behavior

- `< 768px` (`< md:`): grid 2 cols, gap 12px, grid padding 0 12px, card gap 6px, caption padding 0 4px
- Desktop: 3 cols, gap 16px

## Implementation notes

- Plain function component (no state — CSS hovers only). No `"use client"` required.
- Export TWO things:
  1. `InspirationSection({ section }: { section: KimiInspirationRegion })` — one module (optional heading + grid)
  2. `ExploreContent()` — the `.explore-inspiration-gallery` wrapper: maps `EXPLORE_SECTIONS` to `InspirationSection`. **No note line inside** — the "AI-generated, for reference only" note is rendered by the PAGE after the list (see KimiHomePage.md).
- Use `next/image` for card images and heading icons (`fill` + `object-cover` inside the aspect-ratio wrapper).
- Types from `@/types/kimi-com-185e587f`: `KimiInspirationRegion`, `KimiInspirationCard`.
