// FooterBar — legal footer per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/FooterBar.md
// Absolute inside the scroll container: pinned near the bottom of the first
// viewport, then slides away with the content. Always opacity 1 — no fade.

// The original carried Moonshot AI's Chinese ICP/MPS filing numbers. Those are
// that company's actual government registrations, so they are gone rather than
// re-labelled — add Fennic's own filings/legal links here when they exist.

export default function FooterBar() {
  return (
    <div className="absolute bottom-[58px] left-3 right-3 z-10 md:left-4 md:right-4">
      <div className="flex flex-wrap items-center justify-center gap-x-[27px] gap-y-1 px-2.5 text-[12px] leading-[18px] text-fennic-faint">
        <span>© 2026 Fennic AI</span>
      </div>
    </div>
  );
}
