// Publisher-mode registry: the four modes the sidebar opens the composer in.
//
// Card artwork is the same scraped set `explore-data.ts` draws on — 21 images
// under cards/. They are split by mode here rather than duplicated, with one
// deliberate exception: a few of the design-forward landing pages appear under
// both Websites and Design, because a beautiful site genuinely is both. See
// `image specs.md` §6 for replacing the art with real Fennic outputs.

import type { PublisherMode } from "@/types/fennic-modes";

const ASSETS = "/sites/kimi-com-185e587f/root-8a5edab2";
const card = (slug: string) => `${ASSETS}/cards/${slug}.png`;

/** Every scraped share link opens off-site, so they all carry `external`. */
const KIMI_SHARE = {
  "balckhole-gargantua":
    "https://excdvtcdshcu4.ok.kimi.link/?id=2077780187474403328&share_id=19f6b93e-16c2-8346-8000-0000ab11dd88",
  "open-sea":
    "https://qdtipu6rd2myk.ok.kimi.link?id=2077778000455245824&share_id=19f6b13b-b432-8eb2-8000-0000c67df4cd",
  "global-market-dashboard":
    "https://s4ibp54hd7bwq.kimi.page/?id=2082748652610740224&share_id=19fb22f0-26d2-8857-8000-0000d5fbb82e",
  "3d-vintage-typewriter":
    "https://phfiw57ydjife.kimi.page/?id=2082130321188913152&share_id=19fa965d-2252-863b-8000-0000241e6b1c",
  cyberpunk:
    "https://zrlxxdaz56kym.ok.kimi.link?id=2077778746034724864&share_id=19f6b58f-a892-82d3-8000-0000cdb4a233",
  "3d-jet-engine-lab":
    "https://wa6krm6bznv44.kimi.page?id=2090431105530236928&share_id=1a01f452-1292-8930-8000-00004596aa9b",
  "42-years-of-silicon":
    "https://765dvagfhthwu.kimi.page?id=2079218881184206848&share_id=19f7fe81-b772-8788-8000-0000eb0a2a8a",
  "shipping-not-one-cycle":
    "https://nuesj4c5tehcg.kimi.page?id=2079218579525668864&share_id=19f7fe14-b372-82c3-8000-00006c6fc643",
  "the-interactive-paper":
    "https://7inif7p6jcz2y.kimi.page?id=2079217808532901888&share_id=19f7fd7e-2022-8739-8000-000014716a87",
  "4-surfaces-of-nature":
    "https://3kkb5uvxojhzy.ok.kimi.link?id=2045916676211630080&share_id=19d9a218-f2b2-8511-8000-00001f7dd725",
  "british-museum-review":
    "https://7scs4mlekxa32.ok.kimi.link?id=2045915724247228416&share_id=19da9705-b6d2-81dd-8000-0000034b61c0",
  "smoke-amber-ritual":
    "https://g7ensj2tqrynu.ok.kimi.link?id=2045916032000090112&share_id=19da611a-ed42-8283-8000-000022639773",
} as const;

/** Cards whose original share link was not captured get a local replay route. */
const replay = (id: string) => `/replay/${id}?e=1`;

export const PUBLISHER_MODES: readonly PublisherMode[] = [
  {
    slug: "deep-research",
    label: "Deep Research",
    icon: "deep-research",
    placeholder: "Ask Fennic to get an in-depth research report",
    description:
      "Ask Fennic for an in-depth research report — sources, working notes and revisions included.",
    gallery: { kind: "featured", caption: "Featured Deep Research cases" },
    cards: [
      { title: "42 Years of Silicon", image: card("42-years-of-silicon"), href: KIMI_SHARE["42-years-of-silicon"], external: true },
      { title: "Shipping: Not One Cycle", image: card("shipping-not-one-cycle"), href: KIMI_SHARE["shipping-not-one-cycle"], external: true },
      { title: "The Interactive Paper", image: card("the-interactive-paper"), href: KIMI_SHARE["the-interactive-paper"], external: true },
      { title: "200 Papers in CiteSpace", image: card("200-papers-citespace"), href: replay("19e02b19-2212-819d-8000-0000010a1f01") },
      { title: "Tesla Tear Sheet", image: card("tesla-tear-sheet"), href: replay("19e02982-aa52-87d1-8000-00004e67c691") },
    ],
  },
  {
    slug: "websites",
    label: "Websites",
    icon: "websites",
    placeholder: "Beautiful design, real backend. Just describe your site",
    description:
      "Describe a site and Fennic builds it — design, content and a real backend, deployed to a live URL.",
    gallery: { kind: "tabs" },
    cards: [
      { title: "Balckhole：GARGANTUA", image: card("balckhole-gargantua"), href: KIMI_SHARE["balckhole-gargantua"], external: true, category: "Visualization" },
      { title: "Open Sea", image: card("open-sea"), href: KIMI_SHARE["open-sea"], external: true, category: "Game" },
      { title: "Global Market Dashboard", image: card("global-market-dashboard"), href: KIMI_SHARE["global-market-dashboard"], external: true, category: "Dashboard" },
      { title: "3D Vintage Typewriter", image: card("3d-vintage-typewriter"), href: KIMI_SHARE["3d-vintage-typewriter"], external: true, category: "Visualization" },
      { title: "Cyberpunk", image: card("cyberpunk"), href: KIMI_SHARE.cyberpunk, external: true, category: "Game" },
      { title: "3D Jet Engine Lab", image: card("3d-jet-engine-lab"), href: KIMI_SHARE["3d-jet-engine-lab"], external: true, category: "Visualization" },
      { title: "4 Surfaces of Nature", image: card("4-surfaces-of-nature"), href: KIMI_SHARE["4-surfaces-of-nature"], external: true, category: "Landing Page" },
      { title: "British Museum Review", image: card("british-museum-review"), href: KIMI_SHARE["british-museum-review"], external: true, category: "Landing Page" },
      { title: "Smoke, Amber, Ritual", image: card("smoke-amber-ritual"), href: KIMI_SHARE["smoke-amber-ritual"], external: true, category: "Landing Page" },
      { title: "30 LA Storefront Websites", image: card("30-la-storefront-websites"), href: replay("19e02953-48c2-8937-8000-00002a9014b2"), category: "Landing Page" },
      { title: "Earth Radio", image: card("earth-radio"), href: replay("19e02b19-2212-819d-8000-000001072e51"), category: "Tool" },
      { title: "Portfolio Hedging Toolkit", image: card("portfolio-hedging-toolkit"), href: replay("19e02982-aa52-87d1-8000-00004e67c6a3"), category: "Tool" },
    ],
  },
  {
    slug: "sheets",
    label: "Sheets",
    icon: "sheets",
    placeholder: "Describe the spreadsheet or dashboard you need",
    description:
      "Fennic builds spreadsheets and dashboards from your data — formulas, pivots and charts included.",
    gallery: { kind: "featured", caption: "Featured Sheets cases" },
    cards: [
      { title: "Hermès 20-Year Panorama", image: card("hermes-20-year-panorama"), href: replay("19e02b19-2212-819d-8000-000001072e46") },
      { title: "Bibliometric Knowledge Graph", image: card("bibliometric-knowledge-graph"), href: replay("19e02982-aa52-87d1-8000-00004e67c68d") },
      { title: "Personal Health Dashboard", image: card("personal-health-dashboard"), href: replay("19e02953-48c2-8937-8000-00002a9014a6") },
    ],
  },
  {
    slug: "design",
    label: "Design",
    icon: "design",
    placeholder: "Describe an image, mockup or brand asset",
    description:
      "Images, mockups and brand assets from a brief — grouped by the brief that made them.",
    gallery: { kind: "featured", caption: "Featured Design cases" },
    cards: [
      { title: "Summer Dress Design", image: card("summer-dress-design"), href: replay("19e02953-48c2-8937-8000-00002a9014c7") },
      { title: "Smoke, Amber, Ritual", image: card("smoke-amber-ritual"), href: KIMI_SHARE["smoke-amber-ritual"], external: true },
      { title: "4 Surfaces of Nature", image: card("4-surfaces-of-nature"), href: KIMI_SHARE["4-surfaces-of-nature"], external: true },
      { title: "3D Vintage Typewriter", image: card("3d-vintage-typewriter"), href: KIMI_SHARE["3d-vintage-typewriter"], external: true },
    ],
  },
];

export function findMode(slug: string): PublisherMode | undefined {
  return PUBLISHER_MODES.find((mode) => mode.slug === slug);
}
