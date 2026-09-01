// InspirationSection — explore content modules per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/InspirationSection.md
// No note line inside — the "AI-generated, for reference only" note belongs to the page.

import Image from "next/image";
import type {
  KimiInspirationCard,
  KimiInspirationRegion,
} from "@/types/kimi-com-185e587f";
import { EXPLORE_SECTIONS } from "./explore-data";

function InspirationCard({ card }: { card: KimiInspirationCard }) {
  return (
    <a
      href={card.href}
      {...(card.external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group flex flex-col gap-1.5 md:gap-2"
    >
      <span className="relative block aspect-[233/136] overflow-hidden rounded-[16px] border border-kimi-line bg-kimi-placeholder-bg transition-opacity duration-[180ms] ease-kimi-card group-hover:opacity-90">
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 234px, 150px"
          className="object-cover"
        />
      </span>
      <p className="overflow-hidden px-1 text-sm leading-5 text-ellipsis whitespace-nowrap text-kimi-secondary transition-colors duration-200 group-hover:text-kimi-primary md:px-2">
        {card.title}
      </p>
    </a>
  );
}

export function InspirationSection({
  section,
}: {
  section: KimiInspirationRegion;
}) {
  return (
    <section className="flex flex-col gap-3">
      {section.heading ? (
        <h2 className="flex h-6 items-center gap-1.5 px-4 text-sm leading-5 font-normal text-kimi-secondary">
          {section.icon ? (
            <Image
              src={section.icon}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0"
            />
          ) : null}
          {section.heading}
        </h2>
      ) : null}
      <div className="grid grid-cols-2 gap-3 px-3 md:grid-cols-3 md:gap-4 md:px-4">
        {section.cards.map((card) => (
          <InspirationCard key={card.href} card={card} />
        ))}
      </div>
    </section>
  );
}

export function ExploreContent() {
  return (
    <div className="flex w-full flex-col gap-6">
      {EXPLORE_SECTIONS.map((section, index) => (
        <InspirationSection
          key={section.heading ?? `featured-${index}`}
          section={section}
        />
      ))}
    </div>
  );
}
