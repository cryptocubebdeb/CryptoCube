"use client"

import "../../../../i18n"; 
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import Sidebar from "../../components/Sidebar";
import { useSession } from "next-auth/react"
import LanguageSelector from "../../components/LanguageSelector"

export default function Page() {
  const { t } = useTranslation();
  console.log("LANGUAGE USED:", i18n.language);

  const { data: session, status } = useSession()
  const userId = (session?.user as { id?: string })?.id

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
      <main className="main flex-1 mt-1 rounded-2xl overflow-auto">
        <h2 className="title">{t("settings.title")}</h2>

        <div className="mt-10 ml-10">
          <h3 className="text-2xl mt-20 mb-6">{t("settings.language")}</h3>
      <LanguageSelector />
        </div>

        {/*Light/Dark mode*/}
      </main>
    </div>
  )
}
