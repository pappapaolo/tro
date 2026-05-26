"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { isSaved, onSavedChange, toggleSaved } from "@/lib/saved";

interface Props {
  eventId: string;
  label?: "icon" | "full";
  className?: string;
}

export default function SaveButton({
  eventId,
  label = "icon",
  className = "",
}: Props) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isSaved(eventId));
    return onSavedChange(() => setSaved(isSaved(eventId)));
  }, [eventId]);

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleSaved(eventId));
  }

  const icon = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      className={saved ? "fill-(--color-accent) stroke-(--color-accent)" : "stroke-current"}
      style={{ fill: saved ? "currentColor" : "none" }}
    >
      <path
        d="M12 21s-7-4.35-7-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7 4.5C19 16.65 12 21 12 21z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Pre-mount render is "not saved" — avoids a hydration flash for the
  // opposite state.
  if (label === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save for later"}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          saved
            ? "border-(--color-accent) text-(--color-accent)"
            : "border-(--color-line) text-black hover:border-black/60"
        } ${className}`}
      >
        {icon}
        {mounted ? (saved ? "Saved" : "Save") : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 ring-1 ring-black/10 text-black hover:bg-white transition-colors ${className}`}
    >
      {icon}
    </button>
  );
}
