import type { ReactNode } from "react";

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-10 pb-20">
      {children}
    </div>
  );
}
