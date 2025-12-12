"use client"
import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "light" || theme === "dark") {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
      }
    } catch (e) {
      console.error("Error applying theme from localStorage:", e);
    }
  }, []);
  return null;
}