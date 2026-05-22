import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import CitySwitcher from "./CitySwitcher";
import SearchInput from "./SearchInput";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--color-line) bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 sm:gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="tro home" className="flex items-center shrink-0">
          <Image
            src="/logo.svg"
            alt="tro"
            width={68}
            height={35}
            priority
            className="h-7 sm:h-8 w-auto"
          />
        </Link>
        <Suspense
          fallback={
            <div className="hidden sm:flex items-center text-sm">
              <span className="text-(--color-muted) mr-2">·</span>
              <span className="rounded-full px-3 py-1">Milan</span>
            </div>
          }
        >
          <div className="hidden sm:flex">
            <CitySwitcher />
          </div>
        </Suspense>
        <Suspense fallback={<div className="flex-1 h-10" />}>
          <div className="flex-1 max-w-md ml-auto sm:ml-2">
            <SearchInput />
          </div>
        </Suspense>
        <Link
          href="/about"
          className="hidden md:inline-block shrink-0 rounded-full px-3 py-1.5 text-sm text-(--color-muted) hover:bg-black/5 hover:text-black transition-colors"
        >
          About
        </Link>
      </div>
      <Suspense fallback={null}>
        <div className="sm:hidden border-t border-(--color-line)">
          <div className="mx-auto max-w-[1200px] px-4 py-2">
            <CitySwitcher />
          </div>
        </div>
      </Suspense>
    </header>
  );
}
