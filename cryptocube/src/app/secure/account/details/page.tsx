"use client"

import Link from "next/link"
import Sidebar from "../../components/sidebar"
import styles from './page.module.css'
import Button from "@mui/material/Button"; // https://mui.com/material-ui/react-button/
import ProfilePic from "./ProfilePic";
import { useEffect, useState } from "react";

// Define the User type
type User = {
    id_utilisateur: number;
    email: string;
    password: string; // TEMPORARY. WILL HASH
    nom: string;
    prenom: string;
    username: string;
}

const USER_ID = 1; // Replace with actual user ID

export default function Page() 
{
    // Toggles for showing edit mode vs view mode
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // State to hold current user object from api
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Local states for editable fields (doesn't overwrite until Save button is clicked)
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Load user data on component mount
    useEffect(() => {
        ;(async () => {
            try {
                // Load user data from API
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/user/${USER_ID}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const userData: User = await res.json();

                // Set user object and copy its values into local states
                setUser(userData);
                setFirstName(userData.prenom);
                setLastName(userData.nom);
                setEmail(userData.email);
                setUsername(userData.username);
                setPassword(userData.password);
            } catch (e: any) {
                setError(e?.message ?? "An error occurred");
            } finally {
                setLoading(false);
            }
        })();
    }, [])

    // Save handler for Personal Information section
    const savePersonal = async () => {
        if (!user) return;
        try {
            // Update user data via API
            const res = await fetch(`/api/user/${USER_ID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    nom: lastName,
                    prenom: firstName,
                    username
                })
            });
            if (!res.ok) {
                throw new Error("Failed to update user data");
            }
            const updatedUser: User = await res.json();

            // Update state with new user data and exit edit mode
            setUser(updatedUser);
            setIsEditingPersonal(false);
        } catch (e: any) {
            setError(e?.message ?? "An error occurred. Could not save personal info");
        }
    };

    // Save handler for Profile Information section
    const saveProfile = async () => {
        if (!user) return;
        try {
            // Update user data via API
            const res = await fetch(`/api/user/${USER_ID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    nom: lastName,
                    prenom: firstName,
                    username
                })
            });
            if (!res.ok) {
                throw new Error("Failed to update user data");
            }
            const updatedUser: User = await res.json();

            // Update state with new user data and exit edit mode
            setUser(updatedUser);
            setIsEditingProfile(false);
        } catch (e: any) {
            setError(e?.message ?? "An error occurred. Could not save profile info");
        }
    };



    return (
    <><div className="flex h-screen p-10">
        <Sidebar />
    
        {/* Main Content Area */}
        <main className={`${styles.main} flex-1 mt-1 rounded-2xl overflow-auto`}>
            <h2 className={styles.title}>Mes Détails</h2>

            {/* Gestion loading et erreur */}
            {/* <div className="p-6 ml-5 mt-2 w-full max-w-full">
                {loading && <p style={{ color: 'white' }}>Loading...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            </div> */}

            <div className="p-6 ml-5 mt-2 w-full max-w-full">
                <div className={styles.personalInfoHeader}>
                    <h2 className="text-xl">Information Personnel</h2>

                    <Button
                        variant="outlined"
                        // if isEditingPersonal is true, call savePersonal
                        // if isEditingPersonal is false, call setIsEditingPersonal
                        onClick={() => (isEditingPersonal ? savePersonal() : setIsEditingPersonal(!isEditingPersonal))}
                        sx={{ mt: 1, mb: 1, mr: 10}}
                    >
                        {isEditingPersonal ? 'Sauvegarder' : 'Modifier'}
                    </Button>
                </div>

                <hr className={styles.line}/>

                <div className={styles.personInfo}>
                    <ProfilePic />

                    <div className={styles.infoText}>
                        <div className={styles.nameFields}>
                            <div>
                                <p className={styles.infoTitles}>PRÉNOM</p>
                                {isEditingPersonal ? (
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className = {styles.inputField}
                                    />
                                ) : (
                                    <div className={styles.nameDisplay}>{user?.prenom}</div>
                                )}
                            </div>
                           
                           <div>
                                <p className={styles.infoTitles}>NOM</p>
                                {isEditingPersonal ? (
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className = {styles.inputField}
                                    />
                                ) : (
                                    <div className={styles.nameDisplay}>{user?.nom}</div>
                                )}
                           </div>
                        </div>
        
                        <div>
                            <p className={styles.infoTitles}>COURRIEL</p>
                            {isEditingPersonal ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className = {styles.inputEmailField}
                                />
                            ) : (
                                <div className={styles.emailDisplay}>{user?.email}</div>
                            )}
                        </div>
                        
                    </div>
                    
                </div>


                <div className={styles.profileInfoHeader}>
                    <h2 className="text-xl">Information de Profil</h2>

                    <Button
                        variant="outlined"
                        onClick={() => (isEditingProfile ? saveProfile() : setIsEditingProfile(!isEditingProfile))}
                        sx={{ mt: 1, mb: 1, mr: 10}}
                    >
                        {isEditingProfile ? 'Sauvegarder' : 'Modifier'}
                    </Button>
                </div>

                <hr className={styles.line}/>

                <div className={styles.profileInfo}>
                    <div>
                        <p className={styles.infoTitles}>NOM D'UTILISATEUR</p>
                        {isEditingProfile ? (
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className = {styles.inputProfileField}
                            />
                        ) : (
                            <div className={styles.profileDisplay}>{user?.username}</div>
                        )}
                    </div>

                    <div>
                        <p className={styles.infoTitles}>MOT DE PASSE</p>
                        {isEditingProfile ? (
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className = {styles.inputProfileField}
                            />
                        ) : (
                            <div className={styles.profileDisplay}>{user?.password}</div>
                        )}
                    </div>

                    <Button variant="outlined" sx={{ width: '20%' }}>Changer le mot de passe</Button>
                </div>
            </div>
                
        
        </main> 
    </div>
  </>
    )
}