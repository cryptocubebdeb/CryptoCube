// src/components/LinkProviderButtons.tsx
"use client";

import { signIn } from "next-auth/react";

export function LinkGoogleButton() {
  return (
    <button
      className="flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
      onClick={() =>
        signIn("google", { callbackUrl: "/secure/account?linked=google" })
      }
    >
      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white">
        <span className="text-[12px] font-bold text-[#4285F4]">G</span>
      </span>
      <span>Connect Google</span>
    </button>
  );
}

export function LinkMicrosoftButton() {
  return (
    <button
      className="flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
      onClick={() =>
        signIn("azure-ad", { callbackUrl: "/secure/account?linked=microsoft" })
      }
    >
      <span className="mr-2 grid h-5 w-5 grid-cols-2 grid-rows-2">
        <span className="bg-[#F25022]" />
        <span className="bg-[#7FBA00]" />
        <span className="bg-[#00A4EF]" />
        <span className="bg-[#FFB900]" />
      </span>
      <span>Connect Microsoft</span>
    </button>
  );
}
