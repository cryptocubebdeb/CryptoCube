"use client"

import Sidebar from "../../components/Sidebar"
import { useSession } from "next-auth/react"

export default function Page() {
  const { data: session, status } = useSession()
  const userId = (session?.user as { id?: string })?.id

  // While session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Chargement...</p>
      </div>
    )
  }

  // Not logged in
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Veuillez vous connecter pour accéder à vos paramètres</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen p-10">
      {/* Sidebar now expects a string userId */}
      <Sidebar userId={userId} />

      {/* Main Content Area */}
      <main className="main flex-1 mt-1 rounded-2xl overflow-auto">
        <h2 className="title">Mes Paramètres</h2>

        {/* Language + Light/Dark mode*/}
      </main>
    </div>
  )
}
