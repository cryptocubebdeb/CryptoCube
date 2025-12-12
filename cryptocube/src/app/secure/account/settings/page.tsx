"use client"

import "../../../../i18n"; 
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import Sidebar from "../../components/Sidebar";
import { useSession } from "next-auth/react"
import LanguageSelector from "../../components/LanguageSelector"
import ColourSwitch from '../../components/Settings/ColourSwitch';
import { useState } from 'react';

export default function Page() {
  const { t } = useTranslation();
  console.log("LANGUAGE USED:", i18n.language);

  const { data: session, status } = useSession()
  const userId = (session?.user as { id?: string })?.id

  const [isLight, setIsLight] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light');
    }
    return false;
  });
  
  function toggleLightMode(event) {
    const checked = event.target.checked;
    setIsLight(checked);
    const theme = checked ? "light" : "dark";
    document.documentElement.classList.toggle('light', checked);
    localStorage.setItem("theme", theme);
  }

  // While session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>{t("settings.loading")}</p>
      </div>
    )
  }

  // Not logged in
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>{t("settings.mustLogin")}</p>
      </div>
    )
  }

  return (
  <div className="flex h-screen p-10">
      {/* Sidebar now expects a string userId */}
      <Sidebar userId={userId} />

      {/* Main Content Area */}
      <main className="main flex-1 mt-1 rounded-2xl overflow-auto" style={{ background: 'var(--color-container-bg)', color: 'var(--foreground)' }}>
        <h2 className="title">{t("settings.title")}</h2>

        <div className="mt-10 ml-10">
          <h3 className="text-2xl mt-20 mb-6">{t("settings.language")}</h3>
          <LanguageSelector />

          {/* Light/Dark mode toggle */}
          <h3 className="text-2xl mt-15 mb-4">{t("settings.appearance")}</h3>
          <div className="flex flex-row gap-3">
              <h4 className="text-lg mb-2">
              {isLight ? t('settings.lightMode') : t('settings.darkMode')}
            </h4>
            <ColourSwitch checked={isLight} onChange={toggleLightMode} />
          </div>

        </div>
      </main>
    </div>
  )
}
