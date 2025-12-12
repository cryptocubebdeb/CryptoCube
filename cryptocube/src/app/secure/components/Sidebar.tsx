"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Star, Bell, Settings, LogOut } from "lucide-react"; // icons
import { useTranslation } from "react-i18next";
import { signOut } from "next-auth/react";

interface SidebarProps {
  // keep the prop for future flexibility, but it's not required anymore
  userId?: string;
}

const Sidebar = ({ userId }: SidebarProps) => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const Links = [
    { href: "/secure/account/details", icon: <User size={20} />, text: t("sidebar.details") },
    { href: "/secure/account/watchlist", icon: <Star size={20} />, text: t("sidebar.watchlist") },
    { href: "/secure/account/settings", icon: <Settings size={20} />, text: t("sidebar.settings") },
  ];

  return (
    <aside className="sidebar w-64 min-h-screen p-6 flex flex-col justify-between" style={{ color: 'var(--foreground)' }}>
      <div>
        <h1 className="text-xl font-bold mb-8" style={{ color: 'var(--foreground)' }}>{t("sidebar.title")}</h1>
        <ul className="flex flex-col gap-6">
          {Links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li 
                key={link.href}
                className={`rounded-full transition-colors ${
                  isActive ? 'bg-[var(--color-container-bg)]' : ''
                }`}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2`}
                  style={{
                    color: isActive ? 'var(--foreground-alt)' : 'var(--foreground)'
                  }}
                  aria-label={typeof link.text === 'string' ? link.text : undefined}
                >
                  {link.icon}
                  <span style={{ color: isActive ? 'var(--foreground-alt)' : 'var(--foreground)' }}>{link.text}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mb-30">
        <button
          onClick={() => {
            signOut({ callbackUrl: "/auth/signin" });
          }}
          className="flex items-center gap-3 transition-colors bg-transparent border-none cursor-pointer text-left"
          style={{ color: 'var(--foreground)' }}
          aria-label={t("sidebar.signOut")}
        >
          <LogOut size={20} />
          <span className="sidebar-text" style={{ color: 'var(--foreground)' }}>{t("sidebar.signOut")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
