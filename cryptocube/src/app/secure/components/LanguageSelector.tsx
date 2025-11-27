"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = i18n.language === "fr" ? "Français" : "English";

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-zinc-800 text-white px-5 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition flex items-center gap-2"
      >
        🌐 {currentLang}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute mt-2 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20">
          <button
            onClick={() => changeLang("fr")}
            className="w-full text-left px-4 py-2 text-white hover:bg-zinc-700 flex items-center gap-2"
          >
            🇫🇷 Français
          </button>

          <button
            onClick={() => changeLang("en")}
            className="w-full text-left px-4 py-2 text-white hover:bg-zinc-700 flex items-center gap-2"
          >
            🇬🇧 English
          </button>
        </div>
      )}
    </div>
  );
}
