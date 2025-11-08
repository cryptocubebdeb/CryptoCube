"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  const links = [
    { href: "/secure/dashboard", text: "Accueil" },
    { href: "/secure/coins", text: "Coins" },
    { href: "/secure/categories", text: "Catégories" },
    { href: "/secure/simulator/Home", text: "Simulateur" },
    { href: "/secure/community", text: "Communauté" },
    { href: "/secure/about", text: "À propos" },
    { href: "/secure/coins?q=", icon: <Search size={20} /> },
  ];

  // user icon link (used for the clickable icon itself)
  const userLink = {
    href: session ? "/secure/account/details" : "/auth/login",
    icon: <User size={20} />,
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const closeTimeout = useRef<number | null>(null);

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

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl h-20 px-6 flex items-center justify-between">
        <Link href="/secure/dashboard" className="font-bold text-2xl">
          CryptoCube
        </Link>

        <ul className="flex flex-row items-center gap-6 ">
          {/* main nav links (including search) */}
          {links.map((link) => {
            const active =
              !!link.text && pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    "navbar-text uppercase text-base transition-colors",
                    active
                      ? "text-yellow-400"
                      : "text-white/80 hover:text-white",
                  ].join(" ")}
                >
                  {link.text || link.icon}
                </Link>
              </li>
            );
          })}

          {/* User icon with hover dropdown */}
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
              aria-label="User menu"
              className={
                "absolute left-1/2 mt-1 w-44 -translate-x-1/2 bg-slate-800 rounded shadow-lg ring-1 ring-black/20 transform transition-all duration-150 " +
                (userMenuOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none")
              }
            >
              {!session ? (
                <Link
                  href="/auth/login"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                >
                  Connectez-vous
                </Link>
              ) : (
                <>
                  <Link
                    href="/secure/account/details"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                  >
                    Détails
                  </Link>
                  <Link
                    href="/secure/account/watchlist"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                  >
                    Watchlist
                  </Link>
                  <Link
                    href="/secure/account/notifications"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700"
                  >
                    Notifications
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut({ callbackUrl: "/auth/login" });
                    }}
                    role="menuitem"
                    className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700"
                  >
                    Déconnexion
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
