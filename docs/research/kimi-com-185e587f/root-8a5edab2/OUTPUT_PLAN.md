# Output Plan — Kimi.com Clone

## Targets

| Target URL | app-root | site-key | page-key | Route |
|---|---|---|---|---|
| `https://www.kimi.com/?chat_enter_method=new_chat` | `.` (repo root) | `kimi-com-185e587f` | `root-8a5edab2` | `/` (replaces untouched scaffold `src/app/page.tsx`) |

- Origin normalized: `https://www.kimi.com` → SHA-256 first 8 hex: `185e587f`
- Pathname `/` → page-key `root-8a5edab2` (query `chat_enter_method=new_chat` is a non-visual entry-method param; it resolves to the same new-chat home state and is NOT stateful for rendering)
- Single URL, single origin → single app root, no multi-origin decisions needed.

## Status of repo before this clone

- Only the untouched template scaffold exists: `src/app/page.tsx` (placeholder), `src/components/ui/button.tsx` (shadcn primitive), template `globals.css` / `layout.tsx`.
- `npm run build` verified passing (exit 0) before work began.
- No prior cloned pages, research artifacts, or site asset namespaces exist → no collisions. Replacing `src/app/page.tsx` is the approved scaffold replacement.

## Artifact roots

- Research: `docs/research/kimi-com-185e587f/root-8a5edab2/` (+ `components/` specs)
- Screenshots: `docs/design-references/kimi-com-185e587f/root-8a5edab2/`
- Components: `src/components/sites/kimi-com-185e587f/root-8a5edab2/`
- Assets: `public/sites/kimi-com-185e587f/root-8a5edab2/`
- Downloader: `scripts/download-assets-kimi-com-185e587f-root-8a5edab2.mjs`

## Shared foundation files to change

- `src/app/globals.css` — add Kimi design tokens (light theme `#fbfaf9` ground, KM blue `#1a88ff`, label/fill/separator scales, type scale) alongside the shadcn base.
- `src/app/layout.tsx` — title/description from target metadata; system-UI font stack (target uses no webfont for UI text; Pixelify used only for the doodle logo image, KaTeX unused visually).
- `src/types/kimi-com-185e587f.ts` — nav item, inspiration card, region types.

## Page sections (from recon)

1. **Sidebar** (complementary): Kimi logo/New Chat, New Chat + Ctrl K item, primary nav links (My Kimi, Plugins, Scheduled Tasks, Slides, Swarm, Deep Research, Docs, Websites, Sheets, Design), Kimi Work (Beta), Kimi Code, Kimi Claw/Add Claw, Projects, Chats login prompt, bottom Log in + Get App.
2. **Main hero**: Kimi Doodle image, chat composer (contenteditable + placeholder "Ask anything, or task an agent...", attach button, Instant/High quality toggle), publisher shortcuts row.
3. **Explore inspiration**: sticky "Explore inspiration" scroll button + 6 card-row regions (Inspiration, Agent Swarm, Deep Research, Websites, Docs, Sheets) each with image cards + captions; "AI-generated, for reference only" note.
4. **Footer**: © 2026 Moonshot AI + three ICP registration links.

## Execution

- Foundation built sequentially in main worktree → per-section spec files → builder agents in worktrees → merge → assemble `/` route → `npm run build` → visual diff.
