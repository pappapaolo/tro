import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import CitySwitcher from "./CitySwitcher";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--color-line) bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="tro home"
          className="flex items-center"
        >
          <Image
            src="/logo.svg"
            alt="tro"
            width={68}
            height={35}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <Suspense
          fallback={
            <div className="flex items-center text-sm">
              <span className="text-(--color-muted) mr-2">·</span>
              <span className="rounded-full px-3 py-1">Milan</span>
            </div>
          }
        >
          <CitySwitcher />
        </Suspense>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/about"
            className="hidden sm:inline-block rounded-full px-3 py-1.5 text-sm text-(--color-muted) hover:bg-black/5 transition-colors"
          >
            About
          </Link>
        </div>
      </div>
    </header>
  );
}
