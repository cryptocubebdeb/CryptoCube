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

  // Determine if user is authenticated
  const isAuthenticated =
    status === "authenticated" &&
    !!(session?.user && ((session.user as any).id || (session.user as any).email));

  const [hasSimAccount, setHasSimAccount] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/simulator/portfolio")
        .then(res => res.json())
        .then(data => {
          setHasSimAccount(data && typeof data.cash !== "undefined");
        })
        .catch(() => setHasSimAccount(false));
    } else {
      setHasSimAccount(null);
    }
  }, [isAuthenticated]);

  const links = [
    { href: "/secure/dashboard", text: "navbar.home" },
    { href: "/secure/coins", text: "navbar.coins" },
    { href: "/secure/categories", text: "navbar.categories" },
    {
      href: !isAuthenticated
        ? "/secure/simulator/accueil"
        : hasSimAccount === false
          ? "/secure/simulator/accueil"
          : "/secure/simulator/secure",
      text: "navbar.simulator"
    },
    { href: "/secure/about", text: "navbar.about" },
  ];

  const userLink = {
    href: isAuthenticated ? "/secure/account/details" : "/auth/signin",
    icon: <User size={20} />,
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const closeTimeout = useRef<number | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => clearCloseTimeout, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

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

  const fetchSearchResults = async (q: string) => {
    if (!q.trim()) {
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
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
<<<<<<< Updated upstream

        <Link href="/secure/dashboard" className="font-bold text-2xl">
          Crypto<span className="text-yellow-400">Cube</span>
=======
        <Link href="/secure/dashboard" style={{ color: "var(--foreground)" }} className="font-bold text-2xl">
          Crypto<span className="text-yellow-500">Cube</span>
>>>>>>> Stashed changes
        </Link>

        <ul className="flex flex-row items-center gap-6">

          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
<<<<<<< Updated upstream
                  className={
                    "navbar-text uppercase text-base transition-colors " +
                    (active ? "text-yellow-400" : "text-white/80 hover:text-white")
                  }
=======
                  style={{
                    color: active ? "var(--foreground-alt)" : "var(--foreground)",
                    opacity: active ? "1" : "0.8",
                  }}
                  className={["navbar-text uppercase text-base transition-colors"].join(" ")}
>>>>>>> Stashed changes
                >
                  {t(link.text)}
                </Link>
              </li>
            );
          })}

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
                className="navbar-text p-1"
                style = {{
                  color: "var(--foreground)",
                  opacity: "0.8",
                }}
              >
                <Search size={20} />
              </button>
            </li>
          )}

          <li className="relative" ref={searchContainerRef}>

            <div
<<<<<<< Updated upstream
              className={
                "flex items-center bg-slate-800 rounded-full transition-all duration-200 " +
                (searchOpen ? "px-3 py-1 w-64 opacity-100" : "px-0 py-0 w-0 opacity-0 pointer-events-none")
              }
=======
              style={{
                backgroundColor: "var(--background-search)"
              }}
              className={"flex items-center rounded-full transition-all duration-200 " + (searchOpen ? "px-3 py-1 w-64 opacity-100" : "px-0 py-0 w-0 opacity-0 pointer-events-none")}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                placeholder={t("navbar.searchPlaceholder")}
                className={
                  "appearance-none bg-transparent text-white placeholder-white/60 outline-none transition-all duration-200 " +
                  (searchOpen ? "w-full pl-2" : "w-0 pl-0")
                }
=======
                placeholder="Rechercher une crypto..."
                style={{
                  color: "var(--foreground-search)"
                }}
                className={"appearance-none bg-transparent placeholder-white/60 outline-none transition-all duration-200 " + (searchOpen ? "w-full pl-2" : "w-0 pl-0")}
>>>>>>> Stashed changes
              />
            </div>

            <div
<<<<<<< Updated upstream
              className={
                "absolute left-0 mt-2 w-64 bg-slate-800 rounded shadow-lg ring-1 ring-black/20 z-50 overflow-hidden transform transition-all duration-150 " +
                (searchOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none")
              }
=======
              style={{
                backgroundColor: "var(--background-search)"
              }}
              className={"absolute left-0 mt-2 w-64 rounded shadow-lg ring-1 ring-black/20 z-50 overflow-hidden transform transition-all duration-150 " + (searchOpen ? "opacity-100 scale-100 pointer-events-auto translate-y-0" : "opacity-0 scale-95 pointer-events-none -translate-y-2")}
>>>>>>> Stashed changes
              id="search-results"
              role="listbox"
            >
              {searchLoading ? (
<<<<<<< Updated upstream
                <div className="px-3 py-2 text-sm text-white/70">{t("navbar.searching")}</div>
=======
                <div 
                  style={{
                    color: "var(--foreground-search)",
                    opacity: "0.7"
                  }}
                  className="px-3 py-2 text-sm">Recherche...
                </div>
>>>>>>> Stashed changes
              ) : results.length > 0 ? (
                results.map((r) => (
                  <Link
                    key={r.id}
                    href={`/secure/specificCoin/${r.id}`}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-white"
                    role="option"
                    aria-selected={false}
                    style={{}}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "var(--background-search-hover)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
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
<<<<<<< Updated upstream
              ) : query.length > 0 ? (
                <div className="px-3 py-2 text-sm text-white/60">{t("navbar.noMatches")}</div>
              ) : null}
=======
              ) : (
                //Si Aucun résultat trouvé
                query.length > 0 ? (
                  <div 
                    style={{
                      color: "var(--foreground-search)",
                      opacity: "0.8"
                    }}
                    className="px-3 py-2 text-sm"
                  >
                      Aucune correspondance
                  </div>
                ) : null
              )}
>>>>>>> Stashed changes
            </div>

          </li>

          <li
            className="relative"
            onMouseEnter={openUserMenu}
            onMouseLeave={closeUserMenuDelayed}
            onFocus={openUserMenu}
            onBlur={closeUserMenuDelayed}
          >
            <Link
              href={userLink.href}
              style={{
                color: "var(--foreground)",
                opacity: "0.8",
                
              }}
              className="navbar-text flex items-center"
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
                  className="block px-4 py-2 text-sm text-white/90 hover:text-white"
                  style={{}}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "var(--background-search-hover)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  {t("navbar.signIn")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/secure/account/details"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white"
                    style={{}}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "var(--background-search-hover)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {t("navbar.details")}
                  </Link>
                  <Link
                    href="/secure/account/watchlist"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white"
                    style={{}}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "var(--background-search-hover)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {t("navbar.watchlist")}
                  </Link>
                  <Link
                    href="/secure/account/settings"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white"
                    style={{}}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "var(--background-search-hover)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {t("navbar.settings")}
                  </Link>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut({ callbackUrl: "/auth/signin" });
                    }}
                    role="menuitem"
                    style={{
                      color: "var(--color-red)"
                    }}
                    className="w-full text-left block px-4 py-2 text-sm"
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "var(--background-search-hover)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
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
