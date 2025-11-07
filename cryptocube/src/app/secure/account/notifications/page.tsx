"use client";

import Sidebar from "../../components/Sidebar";
import styles from "../../account/page.module.css"
import { useSession } from "next-auth/react";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Veuillez vous connecter pour voir vos notifications</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen p-10">
      {/* Sidebar now uses the logged-in user’s id from the session */}
      <Sidebar userId={userId} />

      {/* Main Content Area */}
      <main className={`${styles.main} flex-1 mt-1 rounded-2xl overflow-auto`}>
        <h2 className={styles.title}>Mes Notifications</h2>
      </main>
    </div>
  );
}
