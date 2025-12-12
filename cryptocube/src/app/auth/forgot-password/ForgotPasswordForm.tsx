"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/app/secure/components/navbar";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Forgot password request failed.");
      }

    } catch {
      setError("Network error.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Navbar />
      <div className="flex flex-col flex-1 justify-center items-center">
        <h1 className="text-3xl mb-9 text-center font-bold" style={{ color: 'var(--foreground)' }}>{t("forgotPassword.title")}</h1>

        <div className="max-w-md w-full mx-auto rounded-2xl shadow p-8" style={{ backgroundColor: 'var(--color-container-bg)' }}>
          {submitted ? (
            <p style={{ textAlign: 'center' }}>{t("forgotPassword.submitted")}</p>
          ) : (
            <form onSubmit={handleSubmit}>

              <label className="block mb-2">
                {t("forgotPassword.emailLabel")}
                <input
                  type="email"
                  className="w-full border p-2 mt-1 rounded-lg"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={t("forgotPassword.emailPlaceholder")}
                  style={{ backgroundColor: "white" }}
                />
              </label>

              {error && <p style={{ color: 'var(--color-red)' }} className="mb-2">{error}</p>}

              <button
                type="submit"
                className="w-full py-2 rounded-lg mt-2"
                style={{ color: 'var(--foreground)', backgroundColor: 'var(--forgotpassword-btn)' }}
              >
                {t("forgotPassword.sendLink")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}