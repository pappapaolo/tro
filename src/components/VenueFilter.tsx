"use client";

import { useEffect, useRef, useState } from "react";
import type { Venue } from "@/lib/types";

interface Props {
  venues: Venue[];
  value: string | null;
  onChange: (slug: string | null) => void;
}

export default function VenueFilter({ venues, value, onChange }: Props) {
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

  const current = venues.find((v) => v.slug === value);
  const label = current ? current.name : "Any venue";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
          current
            ? "border-black bg-black text-white"
            : "border-(--color-line) bg-white text-black hover:border-black/60"
        }`}
      >
        <span className="truncate">{label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-30 mt-2 min-w-[260px] max-h-[60vh] overflow-auto rounded-xl border border-(--color-line) bg-white shadow-lg"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-black/5 ${
                value === null ? "font-medium" : ""
              }`}
            >
              <span>Any venue</span>
              {value === null && (
                <span className="text-(--color-accent)">•</span>
              )}
            </button>
          </li>
          {venues.map((v) => (
            <li key={v.slug}>
              <button
                type="button"
                role="option"
                aria-selected={v.slug === value}
                onClick={() => {
                  onChange(v.slug);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-black/5 ${
                  v.slug === value ? "font-medium" : ""
                }`}
              >
                <span className="truncate">{v.name}</span>
                {v.slug === value && (
                  <span className="text-(--color-accent) shrink-0">•</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
