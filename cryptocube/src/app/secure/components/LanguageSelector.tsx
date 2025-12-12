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
        style={{ background: 'var(--background-search)', color: 'var(--foreground-search)', border: '1px solid var(--background-search-hover)' }}
        className="px-5 py-2 rounded-lg transition flex items-center gap-2"
      >
        🌐 {currentLang}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute mt-2 w-40 rounded-lg shadow-lg z-20" style={{ background: 'var(--background-search)', border: '1px solid var(--background-search-hover)' }}>
          <button
            onClick={() => changeLang("fr")}
            className="w-full text-left px-4 py-2 flex items-center gap-2"
            style={{ color: 'var(--foreground-search)', background: 'transparent' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--background-search-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            🇫🇷 Français
          </button>

          <button
            onClick={() => changeLang("en")}
            className="w-full text-left px-4 py-2 flex items-center gap-2"
            style={{ color: 'var(--foreground-search)', background: 'transparent' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--background-search-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            🇬🇧 English
          </button>
        </div>
      )}
    </div>
  );
}
