"use client";

import React, { useEffect, useState, useRef } from "react"
import Toolbar from "../../components/Portfolio/Toolbar"
import TradeSidePanel from "../../components/Portfolio/TradeSidePanel";

const sectionsIds = ["home", "wallet", "search", "percent", "orders", "activity"];

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      let current = "home"; // Par défault

      // Loop à travers sections ids
      for (const id of sectionsIds) {
        const element = document.getElementById(id); // get DOM element par id
        if (element) {
          const rect = element.getBoundingClientRect(); // position relative to viewport (area visible sur l'écran)

          // Si le top de la section est moins que ou égal à 130px (height of navbar + some offset)
          if (rect.top <= 130) {
            current = id;
          }
        }
      }
      
      setActiveSection(current); // Update state active
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative flex w-full">
      <div className="flex flex-1">

        <div className="sticky top-[90px] h-fit">
          {/* Left sidebar */}
          <Toolbar activeSection={activeSection}/>
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-screen ml-20 pt-[20px] p-8">
          {children}
        </main>

        {/* right-0 h-[calc(100vh-110px)] */}
        <div className="sticky top-[90px] h-fit mr-3">
          {/* Right panel */}
          <aside className="h-[calc(100vh-110px)] w-[350px] rounded-xl bg-[var(--color-container-bg)] p-6 mr-5 border-l border-[var(--background-toolbar-active)] overflow-y-auto mt-2">
            <TradeSidePanel />
          </aside>
        </div>
      </div>
      
    </div>
  )
}
