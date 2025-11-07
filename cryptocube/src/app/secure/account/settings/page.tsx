"use client"

import Link from "next/link"
import Sidebar from "../../components/Sidebar"
import styles from "../../account/page.module.css"
import { useSession } from "next-auth/react"

export default function Page() {
  const { data: session, status } = useSession()
  const userId = (session?.user as any)?.id as string | undefined

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
      <main className={`${styles.main} flex-1 mt-1 rounded-2xl overflow-auto`}>
        <h2 className={styles.title}>Mes Paramètres</h2>

        {/* Language + Light/Dark mode*/}
      </main>
    </div>
  )
}
