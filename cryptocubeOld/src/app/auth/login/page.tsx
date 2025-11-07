"use client";

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormEvent } from 'react'
import { signIn } from "next-auth/react";
import Navbar from "@/app/secure/components/navbar"
import { Geologica } from "next/font/google"

// MUI
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Tooltip from "@mui/material/Tooltip";

// Icônes MUI
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

// Icônes sociales
import { FaGoogle, FaRedditAlien, FaMicrosoft } from "react-icons/fa"

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [message, setMessage] = useState("")
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    //gerer les erreurs
    setEmailError("");
    setPasswordError("");
    setMessage("");

    let hasError = false;

    if (!email) {
      setEmailError("Une adresse email est requise");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Adresse email invalide");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Un mot de passe est obligatoire");
      hasError = true;
    }

    if (hasError) return; //Pas besoin de continuer en cas d'erreur

    const result = await signIn("credentials", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
      callbackUrl: "/secure/dashboard",
    });

    console.log("signIn result:", result);

    if (result?.error === "CredentialsSignin") setMessage("Email ou mot de passe incorrect");
    else if (result?.error) {
      setMessage("Erreur de connexion");
    } else {
      router.push(result?.url ?? "/secure/dashboard");
    }
  }

  const handleMicrosoftSignIn = async () =>
    signIn("microsoft-entra-id", { callbackUrl: "/secure/dashboard", redirect: true });

  const handleGoogleSignIn = async () =>
    signIn("google", { callbackUrl: "/secure/dashboard", redirect: true });

  const handleRedditSignIn = async () =>
    signIn("reddit", { callbackUrl: "/secure/dashboard", redirect: true });


  return (
    <div className={`h-screen flex flex-col ${geologica.className}`}>
      <Navbar />
      <div className="flex flex-col flex-1 justify-center items-center">
        <h1 className="text-3xl font-mono mb-9 mt-12">Connexion</h1>
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
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
              error={!!emailError}
              helperText={emailError}
              InputProps={{ sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" } }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            {/* Message d'erreur lors de la connexion */}
            {message && (
              <p className="text-red-500 text-sm text-center">{message}</p>
            )}

            {/* Bouton de connexion */}
            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 4,
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor: "#e5e7eb",
                  color: "black",
                  width: "210px",
                  mx: "auto",
                  "&:hover": { bgcolor: "#d1d5db" }
                }}
              >
                Se connecter
              </Button>
            </Box>

            {/* Séparateur */}
            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }}>Ou se connecter avec</Divider>

            {/* Icônes sociales */}
            <div className="flex justify-center gap-6">
              {/* Microsoft */}
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700"
                aria-label="Se connecter avec Microsoft"
              >
                <FaMicrosoft className="w-7 h-7 text-white" />
              </button>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-gray-100"
                aria-label="Se connecter avec Google"
              >
                <FaGoogle className="w-7 h-7" />
              </button>

              {/* Reddit */}
              <button
                type="button"
                onClick={handleRedditSignIn}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
                aria-label="Se connecter avec Reddit"
              >
                <FaRedditAlien className="w-7 h-7 text-white" />
              </button>
            </div>


            <p className="text-center text-sm mt-2 text-gray-300">
              Pas de compte?{" "}
              <Link href="../../auth/signup" className="underline">
                S'inscrire
              </Link>
            </p>
          </Stack>
        </Box>
      </div>
    </div>
  )
}