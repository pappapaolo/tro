"use client";

import Link from "next/link";
import { useT } from "./I18nProvider";

export default function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-24 border-t border-(--color-line)">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 text-sm text-(--color-muted) flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-fg">tro</span> · {t("footer.tagline")}
        </div>
        <nav className="flex gap-5">
          <Link href="/about" className="hover:text-fg">
            {t("footer.about")}
          </Link>
          <a
            href="https://github.com/pappapaolo/tro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg"
          >
            {t("footer.github")}
          </a>
        </nav>
      </div>
    </footer>
  );
}
