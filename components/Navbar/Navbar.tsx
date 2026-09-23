"use client";

import Link from "next/link";
import { SearchInput } from "..";

/**
 * Props for the Navbar component.
 */
export interface NavbarProps {
  /** Optional custom CSS class name */
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps = {}) {
  return (
    <nav
      aria-label="Main Navigation"
      className={`flex w-full flex-col sm:flex-row items-center justify-between gap-3 py-2 sm:py-3 px-4 md:px-[5%] xl:px-[8%] 2xl:px-[12.5%] ${className}`}
    >
      <Link
        href="/"
        aria-label="hawapani Home"
        className="group flex items-center gap-2.5 text-xl sm:text-2xl md:text-[28px] font-black leading-none -tracking-[1px] text-white hover:opacity-95 transition-all rounded-2xl p-1 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xs group-hover:scale-105 group-hover:bg-white/30 transition-all text-lg">
          ⛅
        </span>
        <span className="drop-shadow-xs">hawapani</span>
      </Link>

      <div className="w-full max-w-md">
        <SearchInput />
      </div>
    </nav>
  );
}
