"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { isSaved, onSavedChange, toggleSaved } from "@/lib/saved";
import { useT } from "./I18nProvider";
import HeartIcon from "./HeartIcon";

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
  const { t } = useT();
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

  const icon = <HeartIcon filled={saved} />;

  if (label === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? t("save.ariaRemove") : t("save.ariaSave")}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          saved
            ? "border-(--color-accent) text-(--color-accent)"
            : "border-(--color-line) text-fg hover:border-fg/60"
        } ${className}`}
      >
        {icon}
        {mounted ? (saved ? t("save.saved") : t("save.save")) : t("save.save")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? t("save.ariaRemove") : t("save.ariaSave")}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg/95 ring-1 ring-fg/10 transition-colors ${
        saved ? "text-(--color-accent)" : "text-fg hover:bg-bg"
      } ${className}`}
    >
      {icon}
    </button>
  );
}
