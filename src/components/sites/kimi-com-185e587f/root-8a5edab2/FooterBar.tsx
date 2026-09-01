// FooterBar — ICP/legal footer per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/FooterBar.md
// Absolute inside the scroll container: pinned near the bottom of the first
// viewport, then slides away with the content. Always opacity 1 — no fade.

const LINKS = [
  { label: "京ICP备2023011302号-14", href: "https://beian.miit.gov.cn/" },
  { label: "京B2-20240852", href: "https://tsm.miit.gov.cn/" },
  {
    label: "京公网安备11010802043150号",
    href: "https://beian.mps.gov.cn/#/query/webSearch?code=11010802043150",
  },
];

export default function FooterBar() {
  return (
    <div className="absolute bottom-[58px] left-3 right-3 z-10 md:left-4 md:right-4">
      <div className="flex flex-wrap items-center justify-center gap-x-[27px] gap-y-1 px-2.5 text-[12px] leading-[18px] text-kimi-faint">
        <span>© 2026 Moonshot AI</span>
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="no-underline hover:underline"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
