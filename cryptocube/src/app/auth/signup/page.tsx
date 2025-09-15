"use client"
import Link from "next/link"
import { useState } from "react"
import Navbar from "@/app/secure/components/navbar"

export default function Page() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Ajouter la logique d'inscription ici
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col flex-1 justify-center items-center">
      <h1 className="text-2xl font-mono mb-6 mt-12">Inscription</h1>
      <form
        className="flex flex-col space-y-4 w-[500px] h-[850.82px] p-8 rounded shadow text-white"
        style={{ backgroundColor: "#15171E" }}
        onSubmit={handleSubmit}
      >
        <div>
        <label htmlFor="nom" className="block mb-1 text-base">
          Nom
        </label>
        <input
          id="nom"
          type="text"
          name="nom"
          placeholder="Saisissez votre nom"
          value={form.nom}
          onChange={handleChange}
          className="border p-2 rounded w-full placeholder-gray-400"
          required
        />
        </div>
        <div>
        <label htmlFor="prenom" className="block mb-1 text-base">
          Prénom
        </label>
        <input
          id="prenom"
          type="text"
          name="prenom"
          placeholder="Saisissez votre prénom"
          value={form.prenom}
          onChange={handleChange}
          className="border p-2 rounded w-full placeholder-gray-400"
          required
        />
        </div>
        <div>
        <label htmlFor="email" className="block mb-1 text-base">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Saisissez votre email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded w-full placeholder-gray-400"
          required
        />
        </div>
        <div>
        <label htmlFor="username" className="block mb-1 text-base">
          Nom d'utilisateur
        </label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder="Saisissez votre nom d'utilisateur"
          value={form.username}
          onChange={handleChange}
          className="border p-2 rounded w-full placeholder-gray-400"
          required
        />
        </div>
        <div>
        <label htmlFor="password" className="block mb-1 text-base">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Saisissez votre mot de passe"
          value={form.password}
          onChange={handleChange}
          className="border p-2 rounded w-full placeholder-gray-400"
          required
        />
        </div>
        <div>
        <label htmlFor="confirmPassword" className="block mb-1 text-base">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirmer votre mot de passe"
          value={form.confirmPassword}
          onChange={handleChange}
          className="border p-2 rounded w-full placeholder-gray-400"
          required
        />
        </div>
        <button
        type="submit"
        className="py-2 rounded-full font-semibold border bg-gray-300 hover:bg-gray-400 text-black"
        >
        S'inscrire
        </button>
        <p className="text-center text-sm mt-2">
        Déjà un compte ?{" "}
        <Link href="/auth/login" className="underline">
          Se connecter
        </Link>
        </p>
      </form>
      </div>
    </div>
  )
}