# SidebarNav — the scrollable nav body (3 sections)

**Screenshot:** `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-sidebar.png`
**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/SidebarNav.tsx`

## Structure (from the live DOM)

```
nav.sidebar-nav                     padding 0 8px 8px, flex column, gap 12px
├── Section 1: main list (209px wide)
│   ├── top-list (visible): My Kimi, Plugins, Scheduled Tasks, Slides, Swarm,
│   │   Deep Research, Collapse (button, expands more-list)
│   ├── more-list (expanded BY DEFAULT): Docs, Websites, Sheets, Design,
│   │   Kimi Work, Kimi Code, Kimi Claw (row)
├── Section 2: Projects (209x80)  — header (toggle) + "New project" button
└── Section 3: Chats (209x244)    — header (static title) + history empty state
```

## Nav item (link) — shared anatomy

`a.next-sidebar-nav-item` 209×40
- inner `span.next-sidebar-nav-item__content`: padding `0 8px`, flex align-center **gap 6px**, height 40px
- icon wrapper 18×18 (flex-shrink 0) + label span flex-1: 14px/400, line-height 20px, color `rgba(0,0,0,0.9)`, white-space nowrap, overflow hidden, text-overflow ellipsis
- **hover: bg `rgba(0,0,0,0.03)`, border-radius 12px; transition background-color/color/box-shadow 0.15s**
- Icon color inherits the row color (rgba(0,0,0,0.9)) — pass `text-kimi-primary` on the anchor.

## Section 1 content (order + hrefs, exact)

| label | href | icon (`KimiIcon name`) | notes |
|---|---|---|---|
| My Kimi | `/mykimi` | `my-kimi` | |
| Plugins | `/plugins` | `plugins` | |
| Scheduled Tasks | `/tasks` | `scheduled-tasks` | |
| Slides | `/slides` | `slides` | |
| Swarm | `/agent-swarm` | `swarm` | animated 227KB SVG |
| Deep Research | `/deep-research` | `deep-research` | |
| **Collapse** | — (button) | `collapse` size 20 | toggles more-list |
| Docs | `/docs` | `docs` | |
| Websites | `/websites` | `websites` | |
| Sheets | `/sheets` | `sheets` | |
| Design | `/design` | `design` | |
| Kimi Work | `https://www.kimi.com/en/products/kimi-work` | `kimi-work` size 18 | animated 132KB SVG |
| Kimi Code | `/code?from=kimi_homepage_sidebar` | `kimi-code` | |
| Kimi Claw | — (button row) | see below | |

- **Collapse row** (button, same 209×40 anatomy): `KimiIcon name="collapse" size={20}` + label "Collapse" + trailing `KimiIcon name="collapse-chevron" size={18}` (color rgba(0,0,0,0.45), rotates 180° when expanded, transition transform 0.15s `cubic-bezier(0.23,1,0.32,1)`). more-list is **expanded on load**; clicking toggles it (max-height or grid-rows animation is fine — original uses a Vue transition ~0.2s ease).
- **Kimi Work**: icon 18×18 (`flex-shrink:0`) + label "Kimi Work" (`flex-shrink:1`). The original also renders a badge/external-icon pair but they measure 0×0 (hidden) — do not render them.
- **Kimi Claw row** (209×40, a button + adjacent menu trigger in one flex row, gap 6px):
  - trigger button: flex `1 1 0%`, height 40px, padding 0 8px, radius 12px, gap 6px, align-center, color `rgba(0,0,0,0.9)`, hover bg `rgba(0,0,0,0.03)` → `KimiIcon name="kimi-claw" size={18}` + `span.next-sidebar-claw__label` "Kimi Claw" (60×20, 14px, flex 1, ellipsis)
  - menu-trigger wrapper: 40×40 flex center, hover bg `rgba(0,0,0,0.03)`, radius 12px → `KimiIcon name="claw-more" size={15}`
  - Both are inert (no menu in the clone) — render as buttons without action.

## Section 2 — Projects (209×80)

- `.next-sidebar-section__header` 209×40: padding `0 8px`, border-radius 8px, flex align-center justify-space-between, **gap 8px**
  - `button.next-sidebar-section__title` 79×28: padding `0 6px`, border-radius 8px, color `rgba(0,0,0,0.45)`, font 14px, flex align-center **gap 4px** → text "Projects" + `KimiIcon name="projects-chevron" size={14}` (opacity transitions 1 ↔ 0 with `transition opacity 0.15s cubic-bezier(0.23,1,0.32,1)`; hidden when section collapsed)
  - right side: `button` "new" 28×28, radius 8px, flex center, color `rgba(0,0,0,0.45)`, hover bg `rgba(0,0,0,0.03)` → `KimiIcon name="new-project" size={14}`
- `.next-sidebar-section__content` → project-list: **"New project" button** 209×40, border-radius 12px, padding 0 8px, gap 6px, align-center, color `rgba(0,0,0,0.9)`, hover bg `rgba(0,0,0,0.03)` → `KimiIcon name="new-project" size={18}` + label "New project" (14px/20px)
- The Projects section is collapsible via the title button; default **expanded**. Toggle only hides the content row.

## Section 3 — Chats (209×244)

- Header: same `.next-sidebar-section__header` anatomy, but the title is a **DIV, not a button** (no toggle): "Chats" text 14px color `rgba(0,0,0,0.45)` in the 79×28-style slot (no chevron). Right side is empty.
- `.next-sidebar-history-list` 209×204, padding-bottom 4px → `.next-sidebar-history-list__empty` 209×200 (plain block; its height comes from the parent) containing one button:
  - `button.next-sidebar-history-list__login` 209×40, display inline-block, padding `10px 8px`, border-radius 12px, color `rgba(0,0,0,0.6)`, font 14px/400, bg transparent; hover bg `rgba(0,0,0,0.03)` + color `rgba(0,0,0,0.9)`, transition background-color/color/box-shadow 0.15s; text content only: "Log in to sync chat history" (no icon — verified: the button has no element children).

## Interaction model

INTERACTION MODEL: click-driven. Collapse row toggles more-list; Projects title toggles its content; everything else is inert links (hrefs real, navigation not wired).

## Responsive behavior

- No internal changes; the aside handles breakpoints.

## Implementation notes

- Client component. Define the data as typed arrays using `KimiNavItem` from `@/types/kimi-com-185e587f` where it fits; the Collapse/Claw/New-project/login rows are buttons — model them explicitly rather than forcing them into the link list.
- Icons render via `KimiIcon` from `./icons`.
- Keep the 12px inter-section gap and 209px item width exact (`w-[209px]` or rely on padding 0 8px inside the 224px body — 224 − 8 − 8 = 208 ≈ 209 measured; use padding 0 8px and let width be fluid).
