"use client";

import React from "react";
import Link from "next/link";
import { User, Star, Bell, Settings, LogOut } from "lucide-react"; // icons
import { signOut } from "next-auth/react";

interface SidebarProps {
  // keep the prop for future flexibility, but it's not required anymore
  userId?: string;
}

const Sidebar = ({ userId }: SidebarProps) => {
  const Links = [
    // no :id in the URL anymore to match your current file structure
    { href: "/secure/account/details", icon: <User size={20} />, text: "Détails" },
    { href: "/secure/account/watchlist", icon: <Star size={20} />, text: "Watchlist" },
    { href: "/secure/account/notifications", icon: <Bell size={20} />, text: "Notifications" },
    { href: "/secure/account/settings", icon: <Settings size={20} />, text: "Paramètres" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/", // Redirection vers la landing
        redirect: true,
      });
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  return (
    <aside className="sidebar w-64 min-h-screen text-white p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-8">Mon Compte</h1>
        <ul className="flex flex-col gap-6">
          {Links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-3 hover:text-yellow-400 transition-colors"
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-30">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer text-white text-left"
        >
          <LogOut size={20} />
          <span className="sidebar-text">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
