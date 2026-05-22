import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-(--color-line)">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 text-sm text-(--color-muted) flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-black">tro</span> · what&apos;s on
          in Milan
        </div>
        <nav className="flex gap-5">
          <Link href="/about" className="hover:text-black">
            About
          </Link>
          <a
            href="https://github.com/pappapaolo/tro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
