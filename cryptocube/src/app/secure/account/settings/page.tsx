"use client"

import Link from "next/link"
import Sidebar from "../../components/sidebar"
import styles from '../page.module.css'

// Define the User type
type User = {
    id: number;
    email: string;
    password: string; // TEMPORARY. WILL HASH
    nom: string;
    prenom: string;
    username: string;
}

const USER_ID = 1; // Replace with actual user ID

export default function Page() 
{
    return (
    <><div className="flex h-screen p-10">
        <Sidebar />
    
        {/* Main Content Area */}
        <main className={`${styles.main} flex-1 mt-1 rounded-2xl overflow-auto`}>
            <h2 className={styles.title}>Mes Paramètres</h2>
        
            {/* Language + Light/Dark mode*/}
        </main> 
    </div>
  </>
    );
}