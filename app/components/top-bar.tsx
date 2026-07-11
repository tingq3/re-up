"use client";

import Link from "next/link";
import { CircleDashed, Heart, Sparkles } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-line bg-ash-100 px-[max(5vw,28px)] max-[700px]:px-[18px]">
      <Link
        className="flex items-center gap-2 text-xl font-bold tracking-[-0.02em] text-ink max-[700px]:text-[19px]"
        href="/"
      >
        <span className="flex rounded-[9px] bg-leaf px-1.5 py-[5px] text-white">
          <Sparkles size={14} />
        </span>
        PrepFridge
      </Link>
      <nav className="flex gap-2">
        <Link
          className="inline-flex items-center gap-2 rounded-lg px-3 py-[9px] text-sm text-[#526158] hover:bg-ash-200 hover:text-ink max-[700px]:px-[5px] max-[700px]:py-2 max-[700px]:text-xs"
          href="/favorites"
        >
          <Heart size={14} /> Favourites
        </Link>
        <button className="inline-flex items-center gap-2 rounded-lg bg-ash-200 px-3 py-[9px] text-sm text-ink max-[700px]:px-[5px] max-[700px]:py-2 max-[700px]:text-xs">
          <CircleDashed size={14} /> My impact
        </button>
      </nav>
    </header>
  );
}
