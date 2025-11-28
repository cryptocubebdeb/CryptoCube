"use client";

import { useTranslation } from "react-i18next";

export default function DashboardHero() {
  const { t } = useTranslation();

  return (
    <div className="text-center mx-auto space-y-8">
      <h1 className="text-4xl max-w-6xl md:text-5xl font-bold leading-tight">
        {t("dashboard.heroTitle")}
      </h1>

      <p className="text-xl md:text-2xl font-light opacity-75">
        {t("dashboard.heroSubtitle")}
      </p>
    </div>
  );
}
