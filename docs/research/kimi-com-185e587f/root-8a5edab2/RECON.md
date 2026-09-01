# Kimi.com Home — Reconnaissance Summary

Target: `https://www.kimi.com/?chat_enter_method=new_chat` (logged-out, light theme, en-US)
All values from `getComputedStyle()` / `getBoundingClientRect()` on the live page.

## Page metadata

- Title: `Kimi AI with K3 | Built for Agentic Coding & Knowledge Work`
- Description: `Try Kimi K3 to build playable multiplayer and 3D games, create consulting grade slides, and run parallel tasks with Swarm and Goal to get more work done.`
- theme-color: `#fbfaf9`
- `html.light`, body bg `rgb(251,250,249)`
- Favicons: `/favicon.ico`, `/favicon-light.ico`, `/favicon-dark.ico`, apple-touch `/pwa-192.png`
- UI font stack (body): `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif, Arial, "PingFang SC", "Source Han Sans SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans CJK SC"` (no webfont for UI)

## Color system (light)

- App ground: `#fbfaf9` (251,250,249)
- Main panel: `#ffffff`, radius 12px, border 1px solid `rgba(0,0,0,0.05)`, margin 6px
- Text scale (alpha black): 0.9 primary · 0.6 secondary · 0.45 tertiary/labels · 0.3 faint (footer)
- Border/separator: `rgba(0,0,0,0.05)` (panel), `rgba(0,0,0,0.13)` (inputs, cards, pills)
- Hover fill: `rgba(0,0,0,0.03)`
- Send button disabled: `rgba(0,0,0,0.15)`; enabled: `rgba(0,0,0,0.9)` bg with `rgba(255,255,255,0.9)` icon
- Card image placeholder bg: `rgba(0,0,0,0.05)`

## Type scale

- Base: 14px / 20px, weight 400
- Composer text: 16px / 24px
- Footer + ICP links: 12px / 18px
- Menu item description: 13px
- Login button label: 14px / 500

## App shell (desktop ≥ ~1024px)

```
.app (flex, height 100vh)
├── aside.sidebar-slot  width 240px, bg #fbfaf9 (no border)
└── .main  flex:1, bg #fff, radius 12px, border 1px rgba(0,0,0,0.05),
    margin: 6px 6px 6px 240px;  transition: margin-left 0.3s ease-in-out
```

- Scroll container: `.layout-container` (overflow-y auto; desktop scrollHeight ≈ 2488 after explore content loads; initial publisher state ≈ 1053)
- Sidebar collapsed (`.app.fold`): aside slides to x=-240, `.main` margin → 6px, “Expand Sidebar” button (32x32, radius 8px, color rgba(0,0,0,0.9)) appears at top-left of main
- Mobile (390px): sidebar off-canvas by default (x=-240), main margin 6px, width 378

## Sidebar (240px)

- Header row 240x56, padding 15px 10px 9px 16px: logo link 32x32 + Hide Sidebar btn 32x32
- New Chat item: 224x46 (inner padding 12px 8px), icon 18px, label 14px/20px color rgba(0,0,0,0.9), “Ctrl K” badge color rgba(0,0,0,0.45)
- Nav body: padding 0 8px 8px, gap 12px; items 209x40 (inner padding 0 8px, gap 6px), icons 18x18, font 14px/20px
- **Nav item hover: bg rgba(0,0,0,0.03), radius 12px, transition background-color/color/box-shadow 0.15s**
- Section labels (Chats / Projects) 14px color rgba(0,0,0,0.45); Projects button 79x28 pill
- Nav items (final structure): My Kimi(/mykimi), Plugins(/plugins), Scheduled Tasks(/tasks), Slides(/slides), Swarm(/agent-swarm), Deep Research(/deep-research), Collapse btn, Docs(/docs), Websites(/websites), Sheets(/sheets), Design(/design), Kimi Work Beta (external /en/products/kimi-work, “Beta” badge), Kimi Code(/code?from=kimi_homepage_sidebar), Kimi Claw btn + Add Claw btn, Projects section (expandable, New project btn), Chats region with “Log in to sync chat history” btn (28x28 icon + 14px text)
- Footer area 240x60, padding 8px: Log in btn 180x44 (radius 12px, padding 8px; icon circle 28px + “Log in” 14px/500; color rgba(0,0,0,0.6) → hover 0.9, transition background-color/color/box-shadow 0.15s; bg transparent both states) + Get App btn 44x44

## Hero / composer (sticky, z-index 11, within 754px parent)

- Header row 52px (grid); Expand Sidebar btn 32x32 only when collapsed
- Content horizontal padding 0 16px; column centered, width 768px
- Doodle image `Kimi Doodle`: 400x82 desktop / 337x69 mobile (data-URI PNG → saved asset)
- Composer box `.chat-editor-content`: 768x130, bg white, radius 24px
  - Resting: border 1px rgba(0,0,0,0.13), shadow `rgba(0,0,0,0.07) 0px 5px 16px -4px`
  - **Focused: border rgba(0,0,0,0.173), shadow `rgba(0,0,0,0.03) 0px 4px 12px 0px, rgba(0,0,0,0.07) 0px 5px 16px -4px`**
  - Text area: padding 12px 16px 10px; placeholder “Ask anything, or task an agent...” color rgba(0,0,0,0.45), 16px/24px
- Bottom bar `.chat-editor-action` 36px, padding 0 8px:
  - Left: attach/toolkit btn 36x36 (radius 20px, icon 18px)
  - Right: model toggle `.current-model` 118x36 radius 20px (name 14px color 0.9 e.g. “Instant”, effort “High” 14px color 0.45, chevron 16px color 0.45) + send btn 36x36 radius 22px (28x28 arrow svg)
  - Send disabled: bg rgba(0,0,0,0.15); **enabled (has text): bg rgba(0,0,0,0.9), icon rgba(255,255,255,0.9)**
- Model menu (popover `.kimi-menu`): 274px, bg white, radius 16px, padding 8px, shadow `rgba(0,0,0,0.13) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.1) 0px 4px 16px 0px`
  - Items 258px, radius 10px, padding 8px, name 14px/0.9, desc 13px/0.45
  - Items: Instant (checked, “Fast chat, quick replies”), K3 (“Chat & Agent, flagship all-rounder”), K3 Swarm (“Massive search, batch processing, and more in one go”), separator, “Thinking effort · High”

## Publisher shortcuts (768px row)

- Nav 768x36, margin-top 24px; pills: `.linear-icon-button` h36, radius 20px, border 1px rgba(0,0,0,0.13), padding 0 12px 0 10px, gap 4px inside, font 14px
- Pill resting: bg white, color rgba(0,0,0,0.6)
- **Pill hover: bg rgba(0,0,0,0.03), color rgba(0,0,0,0.9); transition background-color/border-color/color 0.15s**
- Pills (icon + label): Slides, Swarm, Deep Research, Docs, Websites, Sheets, Design
- Desktop: single row, gap 12px. Mobile: same pill sizes, row overflows horizontally (clipped)

## Explore inspiration

- Explore button 768x52 (padding 16px 16px 12px), radius 24px 24px 0 0: left icon stack (two overlaid 24x24 svg) + “Explore inspiration” (color 0.6); right “Scroll to explore” + double-chevron 16x16 (color 0.45)
- **Click: smooth-scrolls `.layout-container` to explore content (desktop scrollTop 834), then button disables**
- Content container `.explore-inspiration-content`: 768px, flex column gap 24px, padding-bottom 100px
- Sections: flex column gap 12px; h2 heading row: padding 0 16px, gap 6px, 24x24 icon + 14px/20px label color rgba(0,0,0,0.6)
- Card grid: desktop padding 0 16px, gap 16px, 3 cols (235px); mobile padding 0 12px, gap 12px, 2 cols (150.5px)
- Card (`<a>`): flex column gap 8px (desktop) / 6px (mobile); image wrap radius 16px, border 1px rgba(0,0,0,0.13), bg rgba(0,0,0,0.05); img object-fit cover (desktop 233x136, mobile 149x87); caption p 14px/20px color rgba(0,0,0,0.6), padding 0 8px desktop / 0 4px mobile
- **Card hover: caption color → rgba(0,0,0,0.9) (transition color 0.2s); image opacity transition 0.18s cubic-bezier(0.23,1,0.32,1)**
- Sections & cards:
  - Inspiration (no heading): Balckhole：GARGANTUA, Open Sea, Global Market Dashboard, 3D Vintage Typewriter, Cyberpunk, 3D Jet Engine Lab
  - Agent Swarm (icon statics.kimi.ai/kimi-showcase/swarm.svg): 200 Papers Citespace, 30 LA Storefront Websites, Earth Radio
  - Deep Research (icon statics.kimi.ai/kimi-showcase/deep-research.svg): 42 Years of Silicon, Shipping: Not One Cycle, The Interactive Paper
  - Websites: 4 Surfaces of Nature, British Museum Review, Smoke, Amber, Ritual
  - Docs: Tesla tear sheet, Portfolio Hedging Toolkit, Summer Dress Design
  - Sheets: Hermès 20-Year Panorama, Bibliometric Knowledge Graph, Personal Health Dashboard
- Card images host: kimi-file.kimi.ai/prod-chat-kimi/kfs/...
- Note below content: “AI-generated, for reference only” — centered, 14px, color rgba(0,0,0,0.3)

## Footer

- Absolute bottom 58px, left/right 16px, centered row, padding 0 10px, gap 4px 27px
- “© 2026 Moonshot AI” + links: 京ICP备2023011302号-14 (beian.miit.gov.cn), 京B2-20240852 (tsm.miit.gov.cn), 京公网安备11010802043150号 (beian.gov.cn)
- 12px/18px, color rgba(0,0,0,0.3)

## Floating “Chat with Kimi” button

- Appears when scrolled into explore area (fixed): 162x44, bg rgba(255,255,255,0.7), radius 28px, shadow `rgba(0,0,0,0.15) 0px 4px 15px 2px`
- Wrapper `.home-back-to-publisher-wrap` fixed bottom 32px right 6px, z-index 12, horizontally centered in main panel

## Icons

- All icons are inline SVGs, stroke/fill `currentColor`; inventory serialized in `svg-inventory.json` (33 entries, dedupes to ~24 unique)
- Sizes: nav icons 18x18; hide/expand sidebar 20x20; collapse more 20x20 + 18x18 chevron; model chevron 16x16; send arrow 28x28; get-app 18x18; not-login 28x28; explore double-chevron 16x16
- Two giant animated icons: Swarm (~227KB) and Kimi Work (~132KB) — save as .svg asset files, do not inline as JSX

## Mobile (390px) summary

- Sidebar off-canvas (x=-240); main 378px, margin 6px
- Composer 337px wide (h 130), doodle 337x69, pills row overflows, explore button 337x52
- Explore grid 2 cols (150.5px), gap 12px, padding 0 12px; cards 151x114, img 87px; caption padding 0 4px
- scrollHeight after load: 2815

## Artifacts

- `raw-sidebar.json` — full sidebar DOM dump with computed styles
- `svg-inventory.json` — all inline SVGs serialized (with size/color/context)
- Screenshots in `docs/design-references/kimi-com-185e587f/root-8a5edab2/`: desktop-initial, desktop-fullpage, desktop-sidebar-collapsed, mobile-initial, mobile-fullpage, mobile-explore-fullpage
