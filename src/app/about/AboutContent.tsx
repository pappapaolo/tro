"use client";

import { useT } from "@/components/I18nProvider";

export default function AboutContent() {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-[680px] px-4 sm:px-6 pt-12 pb-20 text-[17px] leading-[1.7]">
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-6">
        {t("about.title")}
      </h1>
      <p className="text-(--color-muted) mb-6">{t("about.p1")}</p>
      <p className="text-(--color-muted) mb-6">{t("about.p2")}</p>
      <h2 className="font-display text-2xl sm:text-3xl mt-12 mb-3">
        {t("about.listingsHeading")}
      </h2>
      <p className="text-(--color-muted) mb-6">
        {t("about.listingsP1Pre")}
        <a
          href="https://github.com/pappapaolo/tro/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:no-underline"
        >
          {t("about.listingsLink")}
        </a>
        {t("about.listingsP1Post")}
      </p>
      <h2 className="font-display text-2xl sm:text-3xl mt-12 mb-3">
        {t("about.roadmapHeading")}
      </h2>
      <ul className="text-(--color-muted) list-disc pl-6 space-y-2">
        <li>{t("about.roadmap.venues")}</li>
        <li>{t("about.roadmap.sync")}</li>
        <li>{t("about.roadmap.cities")}</li>
        <li>{t("about.roadmap.native")}</li>
      </ul>
    </div>
  );
}
