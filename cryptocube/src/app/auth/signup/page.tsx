"use client";

import Link from "next/link";
import { Geologica } from "next/font/google";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// MUI
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

// MUI icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Social icons
import { FaGoogle, FaMicrosoft, FaGithub } from "react-icons/fa";

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type FormState = {
  nom: string;
  prenom: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type ErrorState = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  nom: string;
  prenom: string;
};

export default function Page() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    nom: "",
    prenom: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ErrorState>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    nom: "",
    prenom: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((v) => !v);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((v) => !v);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return nameRegex.test(name) && name.length > 1;
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return usernameRegex.test(username);
  };

  const validatePasswordStrength = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const newErrors: ErrorState = {
      nom: validateName(form.nom)
        ? ""
        : "Le nom doit contenir uniquement des lettres et avoir au moins 2 caractères.",
      prenom: validateName(form.prenom)
        ? ""
        : "Le prénom doit contenir uniquement des lettres et avoir au moins 2 caractères.",
      email: validateEmail(form.email) ? "" : "Format d'email incorrect.",
      username: validateUsername(form.username)
        ? ""
        : "Le nom d'utilisateur doit contenir au moins 3 caractères alphanumériques.",
      password: validatePasswordStrength(form.password)
        ? ""
        : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      confirmPassword:
        form.password === form.confirmPassword
          ? ""
          : "Les mots de passe ne correspondent pas.",
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    setSubmitting(true);

    try {
      // we only send what the backend expects: email, password, name
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: `${form.prenom} ${form.nom}`.trim(), // optional, for NextAuth
        username: form.username,
        firstName: form.prenom,
        lastName: form.nom,
      };

      const response = await fetch("/api/customSignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // not JSON, ignore
      }

      if (!response.ok) {
        const msg =
          (data && typeof data.error === "string" && data.error) ||
          `Erreur d'inscription (status ${response.status})`;
        setServerError(msg);
        setSubmitting(false);
        return;
      }

      // auto sign-in after successful signup / password attach
      const res = await signIn("credentials", {
        redirect: false,
        email: payload.email,
        password: payload.password,
      });

      if (res?.error) {
        setServerError(
          "Compte créé, mais la connexion automatique a échoué. Veuillez vous connecter manuellement."
        );
        router.push("/auth/signin");
      } else {
        router.push("/secure/about"); // change to /secure/dashboard when ready
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      setServerError("Erreur de connexion au serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMicrosoftSignUp = async () =>
    signIn("azure-ad", {
      callbackUrl: "/secure/about",
      redirect: true,
    });

  const handleGoogleSignUp = async () =>
    signIn("google", {
      callbackUrl: "/secure/about",
      redirect: true,
    });

  const handleGitHubSignUp = async () =>
    signIn("github", {
      callbackUrl: "/secure/about",
      redirect: true,
    });

  return (
    <div className={`h-screen flex flex-col ${geologica.className}`}>
      <div className="flex flex-col flex-1 justify-center items-center">
        <h1 className="text-3xl font-mono mb-9 mt-12">Inscription</h1>

        {serverError && (
          <p className="mb-4 max-w-lg text-center text-sm text-red-500 px-4">
            {serverError}
          </p>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: 500,
            bgcolor: "#15171E",
            color: "white",
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.nom}
              helperText={errors.nom}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "white",
                },
              }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Prénom"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.prenom}
              helperText={errors.prenom}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "white",
                },
              }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "white",
                },
              }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Nom d'utilisateur"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "white",
                },
              }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "white",
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "white",
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  mt: 4,
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor: "#e5e7eb",
                  color: "black",
                  width: "210px",
                  mx: "auto",
                  "&:hover": { bgcolor: "#d1d5db" },
                }}
              >
                {submitting ? "Inscription..." : "S'inscrire"}
              </Button>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }}>
              ou s'inscrire avec
            </Divider>

            <div className="flex justify-center gap-6">
              <button
                type="button"
                onClick={handleMicrosoftSignUp}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
                aria-label="S'inscrire avec Microsoft"
              >
                <FaMicrosoft className="w-7 h-7 text-white" />
              </button>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                aria-label="S'inscrire avec Google"
              >
                <FaGoogle className="w-7 h-7 text-white" />
              </button>

              <button
                type="button"
                onClick={handleGitHubSignUp}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 hover:bg-black transition-colors"
                aria-label="S'inscrire avec GitHub"
              >
                <FaGithub className="w-7 h-7 text-white" />
              </button>
            </div>

            <p className="text-center text-sm mt-2 text-gray-300">
              Déjà un compte?{" "}
              <Link href="/auth/signin" className="underline">
                Se connecter
              </Link>
            </p>
          </Stack>
        </Box>
      </div>
    </div>
  );
}
