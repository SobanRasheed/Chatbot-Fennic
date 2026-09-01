# ShortcutPills — the publisher shortcut row under the composer

**Screenshot:** `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-composer-resting.png`
**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/ShortcutPills.tsx`

## Structure (from the live DOM)

```
nav.publisher-shortcut       768x36, margin 32px auto 0 (gap 24px below composer top area)
└── a.linear-icon-button ×7  Slides, Swarm, Deep Research, Docs, Websites, Sheets, Design
```

## Exact CSS values

`nav.publisher-shortcut`
- `mx-auto w-full max-w-[337px] md:max-w-[768px]`; margin-top: **32px desktop / 24px mobile** (`mt-6 md:mt-8`); display flex; align-items center; **gap 12px desktop / 8px mobile** (`gap-2 md:gap-3`); flex-wrap: nowrap
- **Desktop:** content is CENTERED in the 768 column when it fits (`md:justify-center md:px-0`; measured 731.8px of pills → symmetric 18.1px insets, first pill x=463.6 @1440)
- **Mobile:** row is a horizontal carousel — leading inset **12px** (`px-3`, first pill x=31 in the 337 column), `overflow-x: auto` with hidden scrollbars, content overflows right (live `carousel-container at-start`)

`a.linear-icon-button` (each pill)
- height: **36px**; padding: `0 12px 0 10px`; border-radius: **20px**
- border: 1px solid `rgba(0,0,0,0.13)` (`border-kimi-line`)
- display flex; align-items center; gap **4px**
- font: 14px/400; white-space nowrap
- **Resting:** background `#ffffff`; color `rgba(0,0,0,0.6)`
- **Hover:** background `rgba(0,0,0,0.03)`; color `rgba(0,0,0,0.9)`
- **transition: background-color 0.15s, border-color 0.15s, color 0.15s**
- icon: `KimiIcon size={18}` (color inherits)
- label span: 14px/20px

Measured widths (for sanity-checking, do not hard-code): Slides 82, Swarm 87, Deep Research 137, Docs 76.

## Content (real, in order)

| label | href | `KimiIcon name` |
|---|---|---|
| Slides | `/slides` | `slides` |
| Swarm | `/agent-swarm` | `swarm` |
| Deep Research | `/deep-research` | `deep-research` |
| Docs | `/docs` | `docs` |
| Websites | `/websites` | `websites` |
| Sheets | `/sheets` | `sheets` |
| Design | `/design` | `design` |

(Verified live: the pill icons are the same SVG designs as the sidebar nav icons — PptTimeline2, TaskSubagentTask, Microscope, PublisherDocs, BrowserB2, Excel, ImageCreate — so the existing icon registry covers them.)

## Interaction model

INTERACTION MODEL: hover-driven (bg + color shift, 0.15s). Clicks are inert links.

## Responsive behavior

- Mobile: pills keep their sizes; the row scrolls horizontally (`overflow-x-auto`, scrollbars hidden, no wrap) with a 12px leading inset and 8px gaps. Column width 337px.

## Implementation notes

- Server-compatible component (no state) — but keep it a plain function component, no `"use client"` needed.
- Data typed as `KimiShortcutPill[]` from `@/types/kimi-com-185e587f` (icon field = registry name).
- No props; self-contained const.
