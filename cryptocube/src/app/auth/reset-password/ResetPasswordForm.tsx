"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Navbar from "@/app/secure/components/navbar";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((v) => !v);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((v) => !v);

  const validatePasswordStrength = (password: string) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const newErrors = {
      password: validatePasswordStrength(form.password)
        ? ""
        : t("signup.passwordWeak"),
      confirmPassword:
        form.password === form.confirmPassword
          ? ""
          : t("signup.passwordMismatch"),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    // Check for token
    if (!token) {
      setServerError(t("resetPassword.tokenMissing"));
      return;
    }

    setSubmitting(true);
    
    // Changement de mot de passe avec token
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: form.password,
          confirmPassword: form.confirmPassword,
          token: token
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setServerError(data.error || "Server error");
      }
    } catch {
      setServerError(t("Network error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1 items-center justify-center py-8">
        <div className="max-w-md w-full mx-auto p-4 rounded-2xl shadow p-8" style={{ backgroundColor: 'var(--color-container-bg)' }}>

          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>{t("resetPassword.title")}</h1>

          {submitted ? (
            <p>{t("resetPassword.submitted")}</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block mb-4">

                {t("resetPassword.newPasswordLabel")}

                {/* Password input */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full border p-2 mt-1 pr-10"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder={t("resetPassword.passwordPlaceholder")}
                    style={{ backgroundColor: "white", color: "black" }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </span>
                </div>

                {errors.password && <p style={{ color: 'var(--color-red)' }} className="mb-2 text-sm">{errors.password}</p>}

              </label>

              <label className="block mb-4">
                
                {/* Password confirmation */}
                {t("resetPassword.confirmPasswordLabel")}

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="w-full border p-2 mt-1 pr-10"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                    style={{ backgroundColor: "white", color: "black" }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </span>
                </div>

                {errors.confirmPassword && <p style={{ color: 'var(--color-red)' }} className="mb-2 text-sm">{errors.confirmPassword}</p>}

              </label>

              {serverError && <p style={{ color: 'var(--color-red)' }} className="mb-2">{serverError}</p>}

              <button
                type="submit"
                className="w-full py-2 rounded mt-2"
                style={{ color: 'var(--foreground)', backgroundColor: 'var(--forgotpassword-btn)' }}
                disabled={submitting}
              >
                {submitting ? t("resetPassword.submitting") : t("resetPassword.resetButton")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}