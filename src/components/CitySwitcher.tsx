"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CITIES, type CityId, DEFAULT_CITY } from "@/lib/cities";
import { useT } from "./I18nProvider";

export default function CitySwitcher() {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get("city") as CityId) ?? DEFAULT_CITY;
  const currentCity = CITIES.find((c) => c.id === current) ?? CITIES[0];
  const currentLabel = t(`city.${currentCity.id}` as never);

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

  function select(id: CityId) {
    const q = new URLSearchParams(params.toString());
    if (id === DEFAULT_CITY) q.delete("city");
    else q.set("city", id);
    q.delete("venue"); // venue list changes with city
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative flex items-center text-sm">
      <span className="text-(--color-muted) select-none mr-2">·</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full px-3 py-1 hover:bg-black/5 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.cityAria")}
      >
        {currentLabel}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 mt-2 min-w-[180px] rounded-xl border border-(--color-line) bg-white shadow-lg overflow-hidden z-50"
        >
          {CITIES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={c.id === current}
                onClick={() => select(c.id)}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-black/5 ${
                  c.id === current ? "font-medium" : ""
                }`}
              >
                <span>{t(`city.${c.id}` as never)}</span>
                {c.id === current && (
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
