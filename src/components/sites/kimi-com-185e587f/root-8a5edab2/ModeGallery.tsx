"use client";

// ModeGallery — what sits under the composer on a publisher-mode screen.
//
// Two treatments, both from the reference: Websites gets a filter tab row
// (All / Game / Visualization / Dashboard / Tool / Landing Page); every other
// mode gets a single caption ("Featured Deep Research cases"). Cards are the same
// 233:136 tiles the home page's explore grid uses, so the two read as one system.
//
// Filtering is client-side on purpose — unlike the workspace panel's catalog,
// this is a fixed, already-loaded list of a dozen items. A request per tab would
// be slower and buy nothing.

import { useMemo, useState } from "react";
import Image from "next/image";
import { WEBSITE_CATEGORIES } from "@/types/fennic-modes";
import type { ModeCard, PublisherMode, WebsiteCategory } from "@/types/fennic-modes";

function GalleryCard({ card }: { card: ModeCard }) {
  return (
    <a
      href={card.href}
      {...(card.external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group flex flex-col gap-1.5 md:gap-2"
    >
      <span className="relative block aspect-[233/136] overflow-hidden rounded-[16px] border border-fennic-line bg-fennic-placeholder-bg transition-opacity duration-[180ms] ease-fennic-card group-hover:opacity-90">
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 234px, 150px"
          className="object-cover"
        />
      </span>
      <p className="overflow-hidden px-1 text-sm leading-5 text-ellipsis whitespace-nowrap text-fennic-secondary transition-colors duration-200 group-hover:text-fennic-primary md:px-2">
        {card.title}
      </p>
    </a>
  );
}

export default function ModeGallery({ mode }: { mode: PublisherMode }) {
  const [category, setCategory] = useState<WebsiteCategory>("All");
  // Bind the union to a const so TypeScript narrows it in the branches below.
  // Hoisting `kind === "tabs"` into a boolean first does not narrow `mode.gallery`,
  // which is why `gallery.caption` has to be reached through this.
  const gallery = mode.gallery;
  const tabbed = gallery.kind === "tabs";

  const cards = useMemo(
    () =>
      tabbed && category !== "All"
        ? mode.cards.filter((entry) => entry.category === category)
        : mode.cards,
    [tabbed, category, mode.cards],
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {gallery.kind === "tabs" ? (
        <div
          role="tablist"
          aria-label="Website categories"
          className="-mx-1 flex items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {WEBSITE_CATEGORIES.map((option) => {
            const active = option === category;
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(option)}
                className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] leading-5 font-medium whitespace-nowrap transition-colors duration-150 ${
                  active
                    ? "bg-fennic-accent text-fennic-icon-inverse"
                    : "text-fennic-secondary hover:bg-fennic-hover hover:text-fennic-primary"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <h2 className="px-4 text-sm leading-5 font-normal text-fennic-secondary">
          {gallery.caption}
        </h2>
      )}

      <div className="grid grid-cols-2 gap-3 px-3 md:grid-cols-3 md:gap-4 md:px-4">
        {cards.map((entry) => (
          <GalleryCard key={`${entry.title}-${entry.href}`} card={entry} />
        ))}
      </div>

      {cards.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm leading-5 text-fennic-tertiary">
          Nothing in {category} yet — pick another category.
        </p>
      ) : null}
    </div>
  );
}
