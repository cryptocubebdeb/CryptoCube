"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; 
import { ReactNode } from "react";

 //permet de fournir l'instance d'i18n à tous les composants enfants qui utilisent useTranslation()

export function Providers({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}