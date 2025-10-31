"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const USER_ID = (session as any)?.user?.id as string | undefined;

  const Links = [
    { href: "/secure/dashboard", text: "Accueil" },
    { href: "/secure/coins", text: "Coins" },
    { href: "/secure/categories", text: "Catégories" },
    { href: "/secure/simulator", text: "Simulateur" },
    { href: "/secure/community", text: "Communauté" },
    { href: "/secure/about", text: "À propos" },
    { href: "/secure/coins?q=", icon: <Search size={20} /> },
  ];

  const userLink = { href: USER_ID ? `/secure/account/details/${USER_ID}` : "/auth/login", icon: <User size={25} /> };

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl h-20 px-6 flex items-center justify-between">
        <Link href="/secure/dashboard" className="font-bold text-2xl">CryptoCube</Link>

        <ul className="flex flex-row items-center gap-6">
          {Links.map((link) => {
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
                  {link.text || link.icon}
                </Link>
              </li>
            );
          })}

          
          <li className="relative group">
            <Link href={userLink.href} className="text-white/80 hover:text-white p-2 rounded-md flex items-center">
              {userLink.icon}
            </Link>

            <div
              role="menu"
              aria-label="User menu"
              className="absolute left-1/2 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform -translate-x-1/2 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg z-50"
            >
              {USER_ID ? (
                <>
                  <a href="#" role="menuitem" className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700">Détails</a>
                  <a href="#" role="menuitem" className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700">Watchlist</a>
                  <a href="#" role="menuitem" className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700">Notifications</a>
                  <a href="#" role="menuitem" className="block px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700">Déconnexion</a>
                </>
              ) : (
                <a href="/auth/login" role="menuitem" className="block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-slate-700">Connectez-vous</a>
              )}
            </div>
          </li>
        </ul>
      </div>
    </header>
  );
}