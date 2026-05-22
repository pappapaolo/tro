"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES, type Category } from "@/lib/types";

export default function FilterPills() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("cat") as Category | null;

  function setCategory(cat: Category | null) {
    const q = new URLSearchParams(params.toString());
    if (cat) q.set("cat", cat);
    else q.delete("cat");
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const pillBase =
    "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors border";
  const active = "bg-black text-white border-black";
  const inactive =
    "bg-white text-black border-(--color-line) hover:border-black/60";

  return (
    <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto">
      <div className="flex gap-2 py-1 w-max min-w-full">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`${pillBase} ${current === null ? active : inactive}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`${pillBase} ${current === c.id ? active : inactive}`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
