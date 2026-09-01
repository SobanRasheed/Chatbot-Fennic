# FooterBar — ICP / legal footer (always visible, pinned to the first viewport)

**Screenshot:** `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-initial.png` (bottom of the initial viewport)
**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/FooterBar.tsx`

## Structure (from the live DOM)

```
div.home-legal-info            absolute (inside .layout-container), z-10
└── div.legal-footer.legal-footer--info   flex row, centered, wraps
    ├── "© 2026 Moonshot AI"
    ├── a 京ICP备2023011302号-14
    ├── a 京B2-20240852
    └── a 京公网安备11010802043150号
```

## Exact CSS values

`.home-legal-info` (the wrapper — rendered by the PAGE or by this component as its root)
- position: **absolute** against `.layout-container` (which is `position: relative`)
- left: 16px; right: 16px; **bottom: 58px** (desktop) / left: 12px; right: 12px; bottom: 58px (mobile)
- z-index: 10
- Because it is absolutely positioned inside the SCROLL container, it is pinned near the bottom of the FIRST viewport at scrollTop 0 and then slides away naturally with the content when scrolling. **There is NO opacity/transform fade — it is always opacity 1.** (Verified live: opacity 1 at scrollTop 0/30/100/300/834/1200.)

`.legal-footer--info` (inner row)
- display flex; align-items center; flex-wrap wrap; justify-content center
- column-gap **27px**; row-gap **4px**; padding `0 10px`
- font: **12px / 18px**, weight 400, color `rgba(0,0,0,0.3)` (`text-kimi-faint`)
- links: same color, `text-decoration: none`; `hover: underline`

## Content (real, exact)

- Text: `© 2026 Moonshot AI`
- Link `京ICP备2023011302号-14` → `https://beian.miit.gov.cn/`
- Link `京B2-20240852` → `https://tsm.miit.gov.cn/`
- Link `京公网安备11010802043150号` → `https://beian.mps.gov.cn/#/query/webSearch?code=11010802043150`

## Interaction model

INTERACTION MODEL: static (plain links). No scroll wiring, no props, no state.

## Responsive behavior

- Desktop (≥768px): one line, 26px tall, insets 16px
- Mobile (<768px): the links wrap to two rows (row-gap 4px, ~48px tall), insets 12px — same bottom 58px

## Implementation notes

- Plain function component, **no props, no "use client"** — the page simply renders it as a child of `.layout-container` (after the content flow) so it positions against the container.
- Render the wrapper and the row in this one component: root `div` absolute bottom-[58px] left-4 right-4 (mobile left-3 right-3) z-10, inner flex row as specced.
- This is the ICP footer only — the "AI-generated, for reference only" note is a DIFFERENT element (`.legal-footer--default`) that belongs to the page content flow (see KimiHomePage.md).
