"use client";

import { useTranslation } from "react-i18next";

export default function DashboardHero() {
  const { t, ready } = useTranslation();

  if (!ready) {
    return (
      <div className="text-center mx-auto space-y-8">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
      </div>
    );
  }

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