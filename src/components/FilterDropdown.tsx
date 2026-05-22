"use client";

import { useEffect, useRef, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  options: FilterOption[];
  value: string | null;
  emptyLabel: string;
  onChange: (value: string | null) => void;
}

export default function FilterDropdown({
  options,
  value,
  emptyLabel,
  onChange,
}: Props) {
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

  const current = options.find((o) => o.value === value);
  const label = current ? current.label : emptyLabel;
  const active = !!current;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
          active
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
          <path
            d="M1 3 L5 7 L9 3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-30 mt-2 min-w-[220px] max-h-[60vh] overflow-auto rounded-xl border border-(--color-line) bg-white shadow-lg"
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
              <span>{emptyLabel}</span>
              {value === null && (
                <span className="text-(--color-accent)">•</span>
              )}
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-black/5 ${
                  opt.value === value ? "font-medium" : ""
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && (
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
