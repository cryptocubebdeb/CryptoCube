"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  const { t } = useTranslation();

  const links = [
    { href: "/secure/dashboard", text: "navbar.home" },
    { href: "/secure/coins", text: "navbar.coins" },
    { href: "/secure/categories", text: "navbar.categories" },
    { href: "/secure/simulator/", text: "navbar.simulator" },
    { href: "/secure/about", text: "navbar.about" },
  ];

  
  // Détermine si l'utilisateur est réellement authentifié 

  const isAuthenticated =
    status === "authenticated" &&
    !!(session?.user && ((session.user as any).id || (session.user as any).email));

  // lien icône utilisateur (utilisé pour l'icône cliquable)
  const userLink = {
    href: isAuthenticated ? "/secure/account/details" : "/auth/signin",
    icon: <User size={20} />,
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const closeTimeout = useRef<number | null>(null);

  // État de la recherche
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // utilisé pour détecter les clics en-dehors du conteneur (input + dropdown)
  const searchContainerRef = useRef<HTMLLIElement | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeout.current) {
      window.clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  const openUserMenu = () => {
    clearCloseTimeout();
    setUserMenuOpen(true);
  };

  const closeUserMenuDelayed = () => {
    clearCloseTimeout();
    closeTimeout.current = window.setTimeout(
      () => setUserMenuOpen(false),
      150
    );
  };

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  // Nettoyage du debounce lors du démontage
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  // Fermer la recherche en cliquant à l'extérieur ou en appuyant sur Échap
  useEffect(() => {
    if (!searchOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  // Récupère les cryptos correspondantes via l'endpoint de recherche de CoinGecko
  const fetchSearchResults = async (q: string) => {
    if (!q || q.trim().length === 0) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const coins = (data.coins || []).slice(0, 8).map((c: any) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        thumb: c.thumb,
      }));
      setResults(coins);
    } catch (err) {
      console.error("Error searching coins:", err);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Gestionnaire débouncé pour les changements de la requête
  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchSearchResults(v);
    }, 300);
    setSearchOpen(true);
  };


  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl h-20 px-6 flex items-center justify-between">
        <Link href="/secure/dashboard" className="font-bold text-2xl">
          CryptoCube
        </Link>

        <ul className="flex flex-row items-center gap-6 ">
          {/* liens principaux de navigation */}
          {links.map((link) => {
            const active = !!link.text && pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    "navbar-text uppercase text-base transition-colors",
                    active ? "text-yellow-400" : "text-white/80 hover:text-white",
                  ].join(" ")}
                >
                  {t(link.text)}
                </Link>
              </li>
            );
          })}

          {/* Bouton icône recherche - affiché uniquement quand la recherche est fermée */}
          {!searchOpen && (
            <li>
              <button
                  type="button"
                  aria-label={t("navbar.openSearch")}
                onClick={() => {
                  const willOpen = !searchOpen;
                  setSearchOpen(willOpen);
                  if (willOpen) {
                    window.setTimeout(() => inputRef.current?.focus(), 0);
                  }
                }}
                className="navbar-text text-white/80 hover:text-white p-1"
              >
                <Search size={20} />
              </button>
            </li>
          )}

          {/* Search input (small) - animated open/close */}
          {/* conteneur qui englobe l'input et le dropdown - ref pour détecter clic en-dehors */}
          <li className="relative" ref={searchContainerRef}>
            <div
              className={
                "flex items-center bg-slate-800 rounded-full transition-all duration-200 " +
                (searchOpen
                  ? "px-3 py-1 w-64 opacity-100"
                  : "px-0 py-0 w-0 opacity-0 pointer-events-none")
              }
            >
              <input
                type="text"
                aria-label="Search coins"
                ref={inputRef}
                aria-expanded={searchOpen}
                aria-controls="search-results"
                autoComplete="off"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder={t("navbar.searchPlaceholder")}
                className={
                  "appearance-none bg-transparent text-white placeholder-white/60 outline-none transition-all duration-200 " +
                  (searchOpen ? "w-full pl-2" : "w-0 pl-0")
                }
              />
            </div>

            {/* Résultats dropdown*/}
            <div
              className={
                "absolute left-0 mt-2 w-64 bg-slate-800 rounded shadow-lg ring-1 ring-black/20 z-50 overflow-hidden transform transition-all duration-150 " +
                (searchOpen
                  ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
                  : "opacity-0 scale-95 pointer-events-none -translate-y-2")
              }
              id="search-results"
              role="listbox"
              aria-label={t("navbar.searchResults")}
            >
              {searchLoading ? (
                <div className="px-3 py-2 text-sm text-white/70">{t("navbar.searching")}</div>
              ) : results.length > 0 ? (
                results.map((r) => (
                  <Link
                    key={r.id}
                    href={`/secure/specificCoin/${r.id}`}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-slate-700 text-white"
                    role="option"
                    aria-selected={false}
                  >
                    {r.thumb ? (
                      <img src={r.thumb} alt={r.name} className="w-6 h-6 rounded" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-white/10" />
                    )}
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-white/60 uppercase">{r.symbol}</span>
                    </div>
                  </Link>
                ))
              ) : (
                //Si Aucun résultat trouvé
                query.length > 0 ? (
                  <div className="px-3 py-2 text-sm text-white/60">{t("navbar.noMatches")}</div>
                ) : null
              )}
            </div>
          </li>

          {/* Icône utilisateur avec menu déroulant au survol */}
          <li
            className="relative"
            onMouseEnter={openUserMenu}
            onMouseLeave={closeUserMenuDelayed}
            onFocus={openUserMenu}
            onBlur={closeUserMenuDelayed}
          >
            <Link
              href={userLink.href}
              className="navbar-text text-white/80 hover:text-white flex items-center"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              {userLink.icon}
            </Link>

              <div
              role="menu"
              aria-label={t("navbar.userMenu")}
              className={
                "absolute left-1/2 mt-1 w-44 -translate-x-1/2 bg-slate-800 rounded shadow-lg ring-1 ring-black/20 transform transition-all duration-150 " +
                (userMenuOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none")
              }
            >
              {!isAuthenticated ? (
                <Link
                  href="/auth/signin"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                >
                  {t("navbar.signIn")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/secure/account/details"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                  >
                    {t("navbar.details")}
                  </Link>
                  <Link
                    href="/secure/account/watchlist"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                  >
                    {t("navbar.watchlist")}
                  </Link>
                  <Link
                    href="/secure/account/settings"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                  >
                    {t("navbar.settings")}
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut({ callbackUrl: "/auth/signin" });
                    }}
                    role="menuitem"
                    className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700"
                  >
                    {t("navbar.signOut")}
                  </button>
                </>
              )}
            </div>
          </li>
        </ul>
      </div>
    </header>
  );
}
