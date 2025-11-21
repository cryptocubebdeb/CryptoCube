"use client";

import React, { useEffect, useState } from "react"
import Toolbar from "../components/Portfolio/Toolbar"

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
    <>
      {/* Left sidebar */}
      <Toolbar activeSection={activeSection} />

      {/* Main content */}
      <main className="min-h-screen ml-20 mr-[360px] pt-[20px] p-8">
        {children}
      </main>

      {/* Right panel */}
      <aside className="fixed right-0 top-[90px] h-[calc(100vh-110px)] w-[350px] rounded-xl bg-[#15171E] p-6 mr-5 border-l border-[#23252c]">
        <h2 className="text-xl font-bold mb-6 text-center">Trade</h2>
      </aside>
    </>
      
  )
}
