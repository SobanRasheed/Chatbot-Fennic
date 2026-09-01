# ExploreButton — the "Explore inspiration" gateway button

**Screenshots:**
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-explore-button.png`
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/mobile-explore-button.png`

**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/ExploreButton.tsx`

## Structure (from the live DOM)

```
button.home-explore-button          768x52 (mobile 337x52)
├── span.explore-inspiration-title      144x24, flex, gap 6
│   ├── span title-icon                 24x24 relative box: TWO overlaid images
│   │   ├── img icon-explore-light      24x24 at inset 0
│   │   └── img icon-recommend-light    22x22 at ~1px offset (right/down)
│   └── span "Explore inspiration"      114x20
└── span.explore-inspiration-action     142x36, flex, gap 8
    ├── span "Scroll to explore"
    └── KimiIcon explore-chevron        16x16
```

## Exact CSS values

`button.home-explore-button`
- width 768px (100% of the 768px column); height **52px**; padding `16px 16px 12px`
- border-radius: **24px 24px 0 0** (top corners only — it visually "opens" into the explore list below)
- background: transparent; border: none; transition: all 0.15s
- hover: background `rgba(0,0,0,0.03)`
- display flex; align-items center; justify-content space-between

Left group `span.explore-inspiration-title`
- display flex; align-items center; gap **6px**; font 14px/400, color `rgba(0,0,0,0.6)`
- icon stack: a **24×24 relative box** containing two overlaid `next/image`s:
  - back layer: `/sites/kimi-com-185e587f/root-8a5edab2/icons/icon-explore-light.svg` — 24×24, `absolute inset-0`
  - front layer: `/sites/kimi-com-185e587f/root-8a5edab2/icons/icon-recommend-light.svg` — 22×22, `absolute` offset ~1px (right/down), over the back layer
- label "Explore inspiration": 14px/20px, color `rgba(0,0,0,0.6)`

Right group `span.explore-inspiration-action`
- display flex; align-items center; gap **8px**; height 36px
- padding `4px 8px 4px 10px`; margin `-4px -8px -4px 0` (expands the hit area beyond the visual bounds — keep these negative margins)
- text "Scroll to explore": 14px/400, color `rgba(0,0,0,0.45)`
- `KimiIcon name="explore-chevron" size={16}` color `rgba(0,0,0,0.45)`

## Interaction model

INTERACTION MODEL: click-driven scroll trigger.
- Clicking calls `props.onExplore()`. The page (see KimiHomePage.md): mounts the explore content if not yet mounted, then smooth-scrolls `.layout-container` to `stickySpaceHeight + 80` (measured 834 at 1440×900 where the space is 754).
- After activation the original disables itself (the button's job is done once content is revealed). In the clone: keep the button clickable but it should scroll to the explore anchor each time; visual disabled state not required.

## Responsive behavior

- Mobile: width 337px (100%), height 52px, same paddings.

## Implementation notes

- Client component (`onClick`).
- Props: `{ onExplore: () => void }`.
- Export as `ExploreButton`.
