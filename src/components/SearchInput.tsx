"use client";

import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useT } from "./I18nProvider";

export default function SearchInput() {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";

  const [q, setQ] = useState(initial);
  const deferredQ = useDeferredValue(q);

  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const currentQ = paramsRef.current.get("q") ?? "";
    if (deferredQ === currentQ) return;
    const time = setTimeout(() => {
      const next = new URLSearchParams(paramsRef.current.toString());
      if (deferredQ) next.set("q", deferredQ);
      else next.delete("q");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 200);
    return () => clearTimeout(time);
  }, [deferredQ, pathname, router]);

  const urlQ = params.get("q") ?? "";
  useEffect(() => {
    if (urlQ !== q && urlQ !== deferredQ) setQ(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ]);

  return (
    <div className="relative w-full">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M20 20 L16.5 16.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("nav.searchPlaceholder")}
        className="w-full h-10 pl-10 pr-3 rounded-full border border-(--color-line) bg-bg text-sm placeholder:text-(--color-muted) focus:outline-none focus:border-fg transition-colors"
        aria-label={t("nav.searchPlaceholder")}
      />
    </div>
  );
}
