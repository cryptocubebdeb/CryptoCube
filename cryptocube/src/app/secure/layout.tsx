"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Navbar from "@/app/secure/components/navbar";

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
