"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";

function GoogleIcon() {
    return (
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white">
            <span className="text-[12px] font-bold text-[#4285F4]">G</span>
        </span>
    );
}

function MicrosoftIcon() {
    return (
        <span className="mr-2 grid h-5 w-5 grid-cols-2 grid-rows-2">
            <span className="bg-[#F25022]" />
            <span className="bg-[#7FBA00]" />
            <span className="bg-[#00A4EF]" />
            <span className="bg-[#FFB900]" />
        </span>
    );
}

function GitHubIcon() {
    return (
        <span className="mr-2 h-5 w-5 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            GH
        </span>
    );
}

export function SignUpForm() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            console.log("Calling /api/customSignup");
            const res = await fetch("/api/customSignup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password }),
            });

            const text = await res.text();
            console.log("SIGNUP RAW RESPONSE", res.status, text);

            let data: any = null;
            try {
                data = JSON.parse(text);
            } catch {
                // not JSON, ignore
            }

            if (!res.ok) {
                if (data && typeof data.error === "string") {
                    setError(data.error);
                } else {
                    setError(
                        `Signup failed (status ${res.status}). Response: ${text || "no body"
                        }`
                    );
                }
                setLoading(false);
                return;
            }

            // success → auto sign in
            const signInRes = await signIn("credentials", {
                email,
                password,
                callbackUrl: "/secure/dashboard",
            });

            setLoading(false);

            if (signInRes?.error) {
                setError(
                    "Account created, but automatic login failed. Please sign in manually."
                );
            }
        } catch (err) {
            console.error("SIGNUP ERROR (fetch)", err);
            setError("Unexpected error. Please try again in a moment.");
            setLoading(false);
        }
    };



    const showSignInHint =
        error &&
        error.toLowerCase().includes("already has a password");

    return (
        <main className="min-h-screen flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-center">{t("signup.title")}</h1>

                <button
                    className="flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => signIn("google", { callbackUrl: "/secure/about" })}
                >
                    <GoogleIcon />
                    <span>{t("signup.continueWithGoogle")}</span>
                </button>

                <button
                    className="flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => signIn("azure-ad", { callbackUrl: "/secure/about" })}
                >
                    <MicrosoftIcon />
                    <span>{t("signup.continueWithMicrosoft")}</span>
                </button>

                <button
                    className="flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => signIn("github", { callbackUrl: "/secure/about" })}
                >
                    <GitHubIcon />
                    <span>{t("signup.continueWithGitHub")}</span>
                </button>
            </div>

            <form
                onSubmit={handleSignUp}
                className="flex flex-col gap-3 w-72 border rounded-md p-4"
            >
                <h2 className="font-semibold text-lg text-center">
                    {t("signup.orWithEmail")}
                </h2>

                <input
                    className="border rounded px-2 py-1 text-sm"
                    type="text"
                    placeholder={t("signup.namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="border rounded px-2 py-1 text-sm"
                    type="email"
                    placeholder={t("signup.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    className="border rounded px-2 py-1 text-sm"
                    type="password"
                    placeholder={t("signup.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && (
                    <div className="text-sm text-red-600">
                        <p>{error}</p>
                        {showSignInHint && (
                            <p className="mt-1 text-xs text-red-500">
                                {t("signup.goToSignIn")} {" "}
                                <a href="/auth/signin" className="underline">
                                    {t("signup.signIn")}
                                </a>{" "}
                                {t("signup.andLogIn")}
                            </p>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 rounded-md border px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-60"
                >
                    {loading ? t("signup.creating") : t("signup.createAccount")}
                </button>

                <p className="mt-2 text-xs text-center text-gray-600">
                    {t("signup.alreadyHaveAccount")} {" "}
                    <a href="/auth/signin" className="underline">
                        {t("signup.signIn")}
                    </a>
                </p>
            </form>
        </main>
    );
}
