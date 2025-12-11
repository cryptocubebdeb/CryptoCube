"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-lg border" style={{ background: 'var(--color-container-bg)', borderColor: 'var(--foreground-about-border)' }}>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground-about)' }}>{title}</h3>
      <div className="text-sm" style={{ color: 'var(--foreground)' }}>{children}</div>
    </div>
  );
}

export default function Page() {

  const { t } = useTranslation();

  return (
    <>
  <main className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#071226] to-[#021025]" style={{ color: 'var(--foreground)' }}>
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: 'var(--foreground-alt)' }}> {t("about.title")}</h1>
              <p className="mt-4 text-lg" style={{ color: 'var(--foreground)' }}>
               {t("about.description1")}
              </p>

              <p className="mt-3 text-base" style={{ color: 'var(--foreground)' }}>
                {t("about.description2")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/secure/coins" style={{ background: 'var(--foreground-alt)', color: 'var(--background)' }} className="inline-block rounded px-4 py-2">{t("about.exploreCoins")}</Link>
                <Link href="/secure/simulator" className="inline-block rounded border px-4 py-2" style={{ color: 'var(--foreground)', borderColor: 'var(--foreground-about-border)' }}>{t("about.openSimulator")}</Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border" style={{ background: 'var(--color-container-bg)', borderColor: 'var(--foreground-about-border)' }}>
                <h4 className="font-semibold" style={{ color: 'var(--foreground-about)' }}>{t("about.features.realTimeData.title")}</h4>
                <p className="text-sm mt-2" style={{ color: 'var(--foreground)' }}>{t("about.features.realTimeData.text")}</p>
              </div>
              <div className="p-4 rounded-lg border" style={{ background: 'var(--color-container-bg)', borderColor: 'var(--foreground-about-border)' }}>
                <h4 className="font-semibold" style={{ color: 'var(--foreground-about)' }}>{t("about.features.simulator.title")}</h4>
                <p className="text-sm mt-2" style={{ color: 'var(--foreground)' }}>{t("about.features.simulator.text")}</p>
              </div>
              <div className="p-4 rounded-lg border" style={{ background: 'var(--color-container-bg)', borderColor: 'var(--foreground-about-border)' }}>
                <h4 className="font-semibold" style={{ color: 'var(--foreground-about)' }}>{t("about.features.advancedFiltering.title")}</h4>
                <p className="text-sm mt-2" style={{ color: 'var(--foreground)' }}>{t("about.features.advancedFiltering.text")}</p>
              </div>
              <div className="p-4 rounded-lg border" style={{ background: 'var(--color-container-bg)', borderColor: 'var(--foreground-about-border)' }}>
                <h4 className="font-semibold" style={{ color: 'var(--foreground-about)' }}>{t("about.features.news.title")}</h4>
                <p className="text-sm mt-2" style={{ color: 'var(--foreground)' }}>{t("about.features.news.text")}</p>
              </div>
            </div>
          </div>

          <section className="mt-12 rounded-xl p-8 border" style={{ background: 'var(--color-container-bg)', borderColor: 'var(--foreground-about-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground-about)' }}>{t("about.why.title")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Feature title={t("about.why.clarity.title")}>{t("about.why.clarity.text")}</Feature>
              <Feature title={t("about.why.security.title")}>{t("about.why.security.text")}</Feature>
              <Feature title={t("about.why.scalable.title")}>{t("about.why.scalable.text")}</Feature>
            </div>
          </section>

         

          <section className="mt-12 mb-20 p-6 bg-gradient-to-r rounded-lg border" style={{ background: 'var(--color-container-bg)', borderColor: 'var(--foreground-about-border)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground-about)' }}>{t("about.contact.title")}</h3>
            <p className="mt-2" style={{ color: 'var(--foreground)' }}>{t("about.contact.text")}{" "}<a href="mailto:contact@cryptocube.local" className="underline" style={{ color: 'var(--foreground-about)' }}>contact@cryptocube.local</a></p>
          </section>
        </section>
      </main>

      
    </>
  );
}