// src/app/page.tsx
"use client";

import "../i18n";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/secure/components/navbar";

export default function Page() {
  const { t } = useTranslation();
  return (
    <>
      <Navbar />
      <div
        style={{
          backgroundImage: "url('images/landingbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "4100px",
        }}
        className="h-screen flex flex-col justify-start items-center space-y-6"
      >
        <h1 className="text-8xl mt-50 mb-15 font-bold text-center">
          {t("landing.title")}<span className="text-yellow-400">Cube</span>
        </h1>

        <h2 className="text-5xl text-center">{t("landing.subtitle1")}</h2>
        <h2 className="text-5xl text-center text-yellow-500 mb-10">
          {t("landing.subtitle2")}
        </h2>

        <h3 className="text-2xl text-center max-w-5xl px-4 mb-10">
          {t("landing.description")}
        </h3>

        {/* Redirectioner vers sign up si pas connecté, et vers dashboard si connecté */}
        <Link href="/auth/signup">
          <button className="text-2xl bg-yellow-400 px-10 py-5 text-black rounded-md font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-700/70 hover:shadow-lg cursor-pointer">
            {t("landing.ctaStart")}
          </button>
        </Link>

        <hr className="border-t-4 rounded-md border-yellow-400 w-full max-w-3xl my-20 opacity-30" />

        <div
          className="w-full flex flex-row justify-between items-center mt-20"
        >
          <div className="ml-60">
            <h2 className="text-5xl text-left mb-15 font-semibold">
              {t("landing.trendTitle1")}
            </h2>

            <h2 className="text-5xl text-left ml-30 mb-15 font-semibold">
              {t("landing.trendTitle2")}{" "}
              <span className="text-yellow-400">{t("landing.trendHighlighted")}</span>
            </h2>

            <h2 className="text-5xl text-left mb-15 font-semibold">
              {t("landing.trendTitle3")}
            </h2>
          </div>
         

          <Image
            src="/images/topcoinsmarketupdate3.png"
            alt="Top Coins Market Overview"
            width={900}
            height={600}
          />
        </div>

        <h2 className="w-10/12 text-5xl text-center mt-50 mb-15 leading-relaxed font-semibold">
          {t("landing.simulatorTitle").split("simulateur")[0]}
          <span className="text-yellow-400">
            {t("landing.simulatorTitle").split("simulateur")[1]}
          </span>
        </h2>

        <div 
          style={{
              boxShadow: "25px 30px 0 rgba(74, 59, 0, 0.7)",
            }}
          className="rounded-scrollbar w-[1200px] h-[1000px] overflow-y-auto rounded-4xl border-yellow-500 border-solid border-3 mx-auto"
          >
            <Image
              src="/images/portfoliosim.png"
              alt="Portfolio Simulator Example"
              width={1200}
              height={2000}
              className="min-w-full"
              style={{
                display: "block"
              }}
            />
        </div>
        

        <div className="flex flex-row w-full justify-center items-center mt-50">
          <h2 className="text-5xl italic text-center leading-relaxed font-semibold mr-10">
            {t("landing.quote")}
          </h2>

          <hr className="border-t-4 rounded-md border-yellow-400 w-full max-w-3xl opacity-30" />
        </div>

        <div className="flex flex-row justify-center items-center gap-20">
          <div
            style={{
              boxShadow: "20px 25px 0 rgba(74, 59, 0, 0.7)"
            }}
            className="bg-zinc-900 mb-50 w-120 italic rounded-2xl shadow-lg p-8 border-yellow-400 border-2 hover:scale-110 transform transition-all duration-300"
          >
            <h2 className="text-7xl text-center font-semibold">
              2500+ <br />
              <span className="text-4xl">{t("landing.statInvestors")}</span>
            </h2>
          </div>

          <div
            style={{
              boxShadow: "20px 25px 0 rgba(74, 59, 0, 0.7)"
            }}
            className="bg-zinc-900 self-end mt-100 w-120 italic rounded-2xl shadow-lg p-8 border-yellow-400 border-2 hover:scale-110 transform transition-all duration-300"
          >
            <h2 className="text-7xl text-center font-semibold">
              $12M+ <br />
              <span className="text-4xl">{t("landing.statPortfolios")}</span>
            </h2>
          </div>

          <div
            style={{
              boxShadow: "20px 25px 0 rgba(74, 59, 0, 0.7)"
            }}
            className="bg-zinc-900 mb-50 w-120 italic rounded-2xl shadow-lg p-8 border-yellow-400 border-2 hover:scale-110 transform transition-all duration-300"
          >
            <h2 className="text-7xl text-center font-semibold">
              50,000+ <br />
              <span className="text-4xl">{t("landing.statTransactions")}</span>
            </h2>
          </div>
        </div>
        
        <Link href="/auth/signup">
          <h2 className="text-4xl text-center mt-90 mb-15 font-semibold hover:underline hover:scale-105 transform transition-all duration-200">
            {t("landing.join").split("CryptoCube")[0]}
            <span className="text-yellow-400">CryptoCube</span>
            {t("landing.join").split("CryptoCube")[1]}
          </h2>
        </Link>
       
      </div>
    </>
  );
}
