"use client";

import Link from "next/link";

export default function TopBar() {
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span>✦</span> PrepFridge
      </Link>
      <nav>
        <Link href="/favorites">♡ Favourites</Link>
        <button className="impact">◌ My impact</button>
      </nav>
    </header>
  );
}
