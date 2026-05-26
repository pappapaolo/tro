"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useT } from "./I18nProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function select(l: Locale) {
    setLocale(l);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.languageAria")}
        className="shrink-0 inline-flex h-9 items-center justify-center rounded-full px-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-fg/5 transition-colors"
      >
        {locale.toUpperCase()}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-full right-0 mt-2 min-w-[160px] rounded-xl border border-(--color-line) bg-bg shadow-lg overflow-hidden z-50"
        >
          {LOCALES.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                role="option"
                aria-selected={l.id === locale}
                onClick={() => select(l.id)}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-fg/5 ${
                  l.id === locale ? "font-medium" : ""
                }`}
              >
                <span>{l.label}</span>
                {l.id === locale && (
                  <span className="text-(--color-accent)">•</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
