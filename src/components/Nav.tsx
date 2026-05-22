import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--color-line) bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="tro home"
          className="text-2xl font-black tracking-tight leading-none"
        >
          tro
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-sm text-(--color-muted)">
          <span className="select-none">·</span>
          <button
            type="button"
            className="rounded-full px-3 py-1 hover:bg-black/5 transition-colors"
            aria-label="Change city"
          >
            Milan
          </button>
        </div>
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
