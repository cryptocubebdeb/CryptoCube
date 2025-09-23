"use client"
import Link from "next/link"
import Navbar from "@/app/secure/components/navbar"
import { Geologica } from "next/font/google"
import { useState } from "react"

// MUI
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"

// Icônes
import { FaGoogle, FaRedditAlien, FaFacebookF } from "react-icons/fa"

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["400", "700"],
})
export default function Page() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    nom: "",
    prenom: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/; // Accepte les lettres, espaces, apostrophes et tirets
    return nameRegex.test(name) && name.length > 1;
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // Accepte lettres, chiffres, et underscores, min 3 caractères
    return usernameRegex.test(username);
  };

  const validatePasswordStrength = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      nom: validateName(form.nom) ? "" : "Le nom doit contenir uniquement des lettres et avoir au moins 2 caractères.",
      prenom: validateName(form.prenom) ? "" : "Le prénom doit contenir uniquement des lettres et avoir au moins 2 caractères.",
      email: validateEmail(form.email) ? "" : "Format d'email incorrect.",
      username: validateUsername(form.username) ? "" : "Le nom d'utilisateur doit contenir au moins 3 caractères alphanumériques.",
      password: validatePasswordStrength(form.password) ? "" : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      confirmPassword: form.password === form.confirmPassword ? "" : "Les mots de passe ne correspondent pas.",
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (!hasErrors) {
      console.log("Formulaire valide, soumission...");
      
    }
  }

  return (
    <div className={`h-screen flex flex-col ${geologica.className}`}>
      <Navbar />
      <div className="flex flex-col flex-1 justify-center items-center">
        <h1 className="text-3xl font-mono mb-9 mt-12">Inscription</h1>
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
              InputProps={{ sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" } }}
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
              InputProps={{ sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" } }}
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
              InputProps={{ sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" } }}
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
              InputProps={{ sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" } }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Mot de passe"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{ sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" } }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />

            <TextField
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{ sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)", color: "white" } }}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            />
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
                S'inscrire
              </Button>   </Box>

            {/* Séparateur */}
            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }}>ou s'inscrire avec</Divider>

            {/* Icônes sociales */}
            <div className="flex justify-center gap-6">
              {/* Google */}
              <a
                href="#"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-white"
                aria-label="S'inscrire avec Google"
              >
                <FaGoogle className="w-7 h-7 text-orange-500" />
              </a>

              {/* Reddit*/}
              <a
                href="#"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
                aria-label="S'inscrire avec Reddit"
              >
                <FaRedditAlien className="w-7 h-7 text-white" />
              </a>

              {/* Facebook*/}
              <a
                href="#"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600"
                aria-label="S'inscrire avec Facebook"
              >
                <FaFacebookF className="w-7 h-7 text-white" />
              </a>
            </div>

            <p className="text-center text-sm mt-2 text-gray-300">
              Déjà un compte?{" "}
              <Link href="/auth/login" className="underline">
                Se connecter
              </Link>
            </p>
          </Stack>
        </Box>
      </div>
    </div>
  )
}