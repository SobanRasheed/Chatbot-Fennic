"use client";

// ExploreButton — "Explore inspiration" gateway per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/ExploreButton.md
// Clicking tells the page to mount the explore content and scroll to it.

import Image from "next/image";
import { KimiIcon } from "./icons";

const ASSETS = "/sites/kimi-com-185e587f/root-8a5edab2";

export interface ExploreButtonProps {
  onExplore: () => void;
}

export default function ExploreButton({ onExplore }: ExploreButtonProps) {
  return (
    <button
      type="button"
      onClick={onExplore}
      className="flex h-[52px] w-full items-center justify-between rounded-t-[24px] px-4 pt-4 pb-3 transition-all duration-150 hover:bg-kimi-hover"
    >
      <span className="flex items-center gap-1.5 text-kimi-secondary">
        <span className="relative block h-6 w-6 shrink-0">
          <Image
            src={`${ASSETS}/icons/icon-explore-light.svg`}
            alt=""
            width={24}
            height={24}
            className="absolute inset-0 h-6 w-6"
          />
          <Image
            src={`${ASSETS}/icons/icon-recommend-light.svg`}
            alt=""
            width={22}
            height={22}
            className="absolute top-[1px] left-[1px] h-[22px] w-[22px]"
          />
        </span>
        <span className="text-sm leading-5">Explore inspiration</span>
      </span>
      <span className="-mr-2 -mt-1 -mb-1 flex h-9 items-center gap-2 py-1 pr-2 pl-2.5 text-kimi-tertiary">
        <span className="text-sm">Scroll to explore</span>
        <KimiIcon name="explore-chevron" size={16} />
      </span>
    </button>
  );
}
