"use client"

import Link from "next/link"
import Sidebar from "../../../components/sidebar"
import styles from './page.module.css'
import Button from "@mui/material/Button"; // https://mui.com/material-ui/react-button/
import ProfilePic from "./ProfilePic";
import { useEffect, useState, use } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from "next-auth/react";  

// Define the User type
type User = {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    username: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) 
{
    const { data: session } = useSession();  
    const { id } = use(params);
    const USER_ID = session?.user?.id ? Number(session.user.id) : null; 

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

    // For password change
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const resetPasswordFields = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError(null);
        setIsSavingPassword(false);
    };

    const closePasswordDialog = () => {
        resetPasswordFields();
        setIsPopupOpen(false);
    };

    const togglePopup = () => setIsPopupOpen(v => !v);

    // Validation function for password strength (same as signup)
    const validatePasswordStrength = (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    // Handler for changing password
    const handlePasswordChange = async () => {
        if (!user) return;

        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setPasswordError("Tous les champs sont requis.");
            return;
        }
        
        if (!validatePasswordStrength(newPassword)) {
            setPasswordError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            setIsSavingPassword(true);
            setPasswordError(null);

            const res = await fetch(`/api/user/${USER_ID}/password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword, // for backend verification
                    newPassword
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Échec de la mise à jour du mot de passe");
            }

            resetPasswordFields();
            setIsPopupOpen(false);
        } catch (e: any) {
            setPasswordError(e?.message ?? "Une erreur s'est produite");
        } finally {
            setIsSavingPassword(false);
        }
    };

    useEffect(() => {
    if (!USER_ID) {
      setError("No session or invalid user ID");
      setLoading(false);
      return;
    }

        const loadUser = async () => {
            try {
                const res = await fetch(`/api/user/${USER_ID}/settings`);
                if (!res.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const userData: User = await res.json();
                setUser(userData);
                setFirstName(userData.prenom);
                setLastName(userData.nom);
                setEmail(userData.email);
                setUsername(userData.username);
            } catch (e: any) {
                setError(e?.message ?? "An error occurred while loading user data");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [USER_ID]); // add user_id as dependency


    // Save handler for Personal Information section
    const savePersonal = async () => {
        if (!user) return;
        try {
            // Update user data via API
            const res = await fetch(`/api/user/${USER_ID}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
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
            const res = await fetch(`/api/user/${USER_ID}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
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
        <Sidebar userId={USER_ID!} />
    
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
                        <div className={styles.profileDisplay}>•••••••</div>
                    </div>

                    <Button variant="outlined" sx={{ width: '20%', marginTop: '1px' }} onClick={togglePopup}>Changer le mot de passe</Button>

                    <Dialog
                        open={isPopupOpen}
                        onClose={closePasswordDialog}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                backgroundColor: '#15171E',
                                color: 'white',
                                borderRadius: '12px',
                            }
                        }}
                    >

                        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
                            Changer le mot de passe

                            <IconButton
                                aria-label="close"
                                onClick={closePasswordDialog}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500]
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ pb: 0 }}>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <TextField
                                    label="Mot de passe actuel"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 3,
                                            bgcolor: "rgba(255,255,255,0.08)",
                                            color: 'white'
                                        }
                                    }}
                                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.5)" } }}
                                />

                                <TextField
                                    label="Nouveau mot de passe"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{ 
                                        sx: {
                                            borderRadius: 3,
                                            bgcolor: "rgba(255,255,255,0.08)",
                                            color: 'white'
                                        }
                                    }}
                                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.5)" } }}
                                />

                                <TextField
                                    label="Confirmer le mot de passe"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 3,
                                            bgcolor: "rgba(255,255,255,0.08)",
                                            color: 'white'
                                        }
                                    }}
                                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.5)" } }}
                                />

                                <div className="flex flex-row justify-between items-center">
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        {passwordError && (
                                            <span style={{ color: '#ff7a7a' }}>{passwordError}</span>
                                        )}
                                    </div>
                                    
                                    <Button variant="text" size="small" sx={{ textTransform: 'none', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                                        Forgot password?
                                    </Button>
                                </div>
                                
                            </Stack>
                        </DialogContent>

                        <DialogActions sx={{ pr: 2, pb: 2.5, pl: 3, justifyContent: 'flex-start', gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handlePasswordChange}
                                disabled={isSavingPassword}
                            >
                                {isSavingPassword ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={closePasswordDialog}
                                disabled={isSavingPassword}
                            >
                                Annuler
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
                
        
        </main> 
    </div>
  </>
    );
}