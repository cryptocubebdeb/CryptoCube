"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";


function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-white/3 to-white/2 p-6 rounded-lg border border-white/6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-sm text-white/80">{children}</div>
    </div>
  );
}

export default function Page() {

  const { t } = useTranslation();

  return (
    <>
      <main className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#071226] to-[#021025] text-white">
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight"> {t("about.title")}</h1>
              <p className="mt-4 text-lg text-white/75">
               {t("about.description1")}
              </p>

              <p className="mt-3 text-base text-white/70">
                {t("about.description2")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/secure/coins" className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:opacity-95">{t("about.exploreCoins")}</Link>
                <Link href="/secure/simulator" className="inline-block rounded border border-white/10 px-4 py-2 text-white/90 hover:bg-white/3">{t("about.openSimulator")}</Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">{t("about.features.realTimeData.title")}</h4>
                <p className="text-sm text-white/80 mt-2">{t("about.features.realTimeData.text")}</p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">{t("about.features.simulator.title")}</h4>
                <p className="text-sm text-white/80 mt-2">{t("about.features.simulator.text")}</p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">{t("about.features.advancedFiltering.title")}</h4>
                <p className="text-sm text-white/80 mt-2">{t("about.features.advancedFiltering.text")}</p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">{t("about.features.news.title")}</h4>
                <p className="text-sm text-white/80 mt-2">{t("about.features.news.text")}</p>
              </div>
            </div>
          </div>

          <section className="mt-12 bg-white/4 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">{t("about.why.title")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Feature title={t("about.why.clarity.title")}>{t("about.why.clarity.text")}</Feature>
              <Feature title={t("about.why.security.title")}>{t("about.why.security.text")}</Feature>
              <Feature title={t("about.why.scalable.title")}>{t("about.why.scalable.text")}</Feature>
            </div>
          </section>

         

          <section className="mt-12 mb-20 p-6 bg-gradient-to-r from-white/3 to-white/5 rounded-lg border border-white/6">
            <h3 className="text-xl font-semibold">{t("about.contact.title")}</h3>
            <p className="text-white/80 mt-2">{t("about.contact.text")}{" "}<a href="mailto:contact@cryptocube.local" className="underline">contact@cryptocube.local</a></p>
          </section>
        </section>
      </main>

      
    </>
  );
}