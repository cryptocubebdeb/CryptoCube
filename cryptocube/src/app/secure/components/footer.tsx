"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
  <footer 
    style={{ color: "var(--foreground)", backgroundColor: "var(--background-footer)" }}
    className="w-full mt-50 border-t border-white/8"
  >
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div className="flex-1">
            <Link href="/" className="font-bold text-xl block mt-7">CryptoCube</Link>
          </div>

          <div className="flex-1 flex justify-between">
            <div>
              <h4 className="text-sm font-semibold mb-2">{t("footer.productTitle")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/secure/coins" style={{ color: "var(--foreground-grey)" }} className="hover:!text-[var(--foreground)]">{t("footer.coins")}</Link></li>
                <li><Link href="/secure/categories" style={{ color: "var(--foreground-grey)" }} className="hover:!text-[var(--foreground)]">{t("footer.categories")}</Link></li>
                <li><Link href="/secure/simulator" style={{ color: "var(--foreground-grey)" }} className="hover:!text-[var(--foreground)]">{t("footer.simulator")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">{t("footer.helpTitle")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/secure/about" style={{ color: "var(--foreground)" }} className="hover:!text-[var(--foreground)]">{t("footer.about")}</Link></li>
                <li><Link href="/auth/login" style={{ color: "var(--foreground)" }} className="hover:!text-[var(--foreground)]">{t("footer.login")}</Link></li>
                <li><Link href="/auth/signup" style={{ color: "var(--foreground)" }} className="hover:!text-[var(--foreground)]">{t("footer.signup")}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/6 pt-7 flex justify-center items-center gap-4 w-full">
          <p style={{ color: "var(--foreground-grey)" }} className="text-sm text-center">{t("footer.copyright", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
