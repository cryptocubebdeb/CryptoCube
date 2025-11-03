"use client"

import Link from "next/link"
import Sidebar from  "../../../components/sidebar"
import styles from '../../page.module.css'
import { useSession } from "next-auth/react"; 

// Define the User type
type User = {
    id: number;
    email: string;
    password: string; // TEMPORARY. WILL HASH
    nom: string;
    prenom: string;
    username: string;
}


export default function Page() 
{
    const { data: session } = useSession();
    const USER_ID = session?.user?.id ? Number(session.user.id) : null;

    if (!USER_ID) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Veuillez vous connecter pour voir vos notifications</p>
      </div>
    );
  }

    return (
    <><div className="flex h-screen p-10">
        <Sidebar userId={USER_ID}/>
    
        {/* Main Content Area */}
        <main className={`${styles.main} flex-1 mt-1 rounded-2xl overflow-auto`}>
            <h2 className={styles.title}>Mes Notifications</h2>
        
        </main> 
    </div>
  </>
    );
}