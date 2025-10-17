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
    { href: USER_ID ? `/secure/account/details/${USER_ID}` : "/auth/login", icon: <User size={20} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0f1115]/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto ml-13 mr-13 h-14  flex items-center justify-between">
        <Link href="/secure/dashboard" className="font-semibold">CryptoCube</Link>

        <ul className="flex flex-row items-center gap-6 ">
          {Links.map((link) => {
            const active = !!link.text && pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    "navbar-text uppercase text-sm transition-colors",
                    active ? "text-yellow-400" : "text-white/80 hover:text-white",
                  ].join(" ")}
                >
                  {link.text || link.icon}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}