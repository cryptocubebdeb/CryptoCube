"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
  <footer className="w-full mt-50 bg-[#071226] border-t border-white/8 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div className="flex-1">
            <Link href="/" className="font-bold text-xl block mt-7">CryptoCube</Link>
          </div>

          <div className="flex-1 flex justify-between">
            <div>
              <h4 className="text-sm font-semibold mb-2">{t("footer.productTitle")}</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link href="/secure/coins" className="hover:text-white">{t("footer.coins")}</Link></li>
                <li><Link href="/secure/categories" className="hover:text-white">{t("footer.categories")}</Link></li>
                <li><Link href="/secure/simulator" className="hover:text-white">{t("footer.simulator")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">{t("footer.helpTitle")}</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link href="/secure/about" className="hover:text-white">{t("footer.about")}</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">{t("footer.login")}</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">{t("footer.signup")}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/6 pt-7 flex justify-center items-center gap-4 w-full">
          <p className="text-sm text-white/70 text-center">{t("footer.copyright", { year })}</p>
        </div>
      </div>
    </footer>
  );
}