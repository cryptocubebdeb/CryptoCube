"use client"

import Link from "next/link"
import Sidebar from "../components/sidebar"
import styles from './page.module.css'
import Button from "@mui/material/Button"; // https://mui.com/material-ui/react-button/
import ProfilePic from "./ProfilePic";
import { useState } from "react";


export default function Page() 
{
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    return (
    <><div className="flex h-screen p-10">
        <Sidebar />
    
        {/* Main Content Area */}
        <main className={`${styles.main} flex-1 mt-1 rounded-2xl overflow-auto`}>
            <h2 className={styles.title}>My Details</h2>

            <div className="p-6 ml-5 mt-2 w-full max-w-full">
                <div className={styles.personalInfoHeader}>
                    <h2 className="text-xl font-semibold">Personal Information</h2>

                    <Button
                        variant="outlined"
                        onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                        sx={{ mt: 1, mb: 1, mr: 10}}
                    >
                        {isEditingPersonal ? 'Save' : 'Edit'}
                    </Button>
                </div>

                <hr className={styles.line}/>

                <div className={styles.personInfo}>
                    <ProfilePic />

                    <div className={styles.infoText}>
                        <div className={styles.nameFields}>
                            <div>
                                <p className={styles.infoTitles}>FIRST NAME</p>
                                {isEditingPersonal ? (
                                    <input
                                        type="text"
                                        defaultValue={"John"}
                                        className = {styles.inputField}
                                    />
                                ) : (
                                    <div className={styles.nameDisplay}>John</div>
                                )}
                            </div>
                           
                           <div>
                                <p className={styles.infoTitles}>LAST NAME</p>
                                {isEditingPersonal ? (
                                    <input
                                        type="text"
                                        defaultValue={"Doe"}
                                        className = {styles.inputField}
                                    />
                                ) : (
                                    <div className={styles.nameDisplay}>Doe</div>
                                )}
                           </div>
                        </div>
        
                        <div>
                            <p className={styles.infoTitles}>EMAIL</p>
                            {isEditingPersonal ? (
                                <input
                                    type="email"
                                    defaultValue={"johndoe@gmail.com"}
                                    className = {styles.inputEmailField}
                                />
                            ) : (
                                <div className={styles.emailDisplay}>johndoe@gmail.com</div>
                            )}
                        </div>
                        
                    </div>
                    
                </div>


                <div className={styles.profileInfoHeader}>
                    <h2 className="text-xl font-semibold">Profile Information</h2>

                    <Button
                        variant="outlined"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        sx={{ mt: 1, mb: 1, mr: 10}}
                    >
                        {isEditingProfile ? 'Save' : 'Edit'}
                    </Button>
                </div>

                <hr className={styles.line}/>

                <div className={styles.profileInfo}>
                    <div>
                        <p className={styles.infoTitles}>USERNAME</p>
                        {isEditingProfile ? (
                            <input
                                type="text"
                                defaultValue={"johndoe222"}
                                className = {styles.inputField}
                            />
                        ) : (
                            <div className={styles.nameDisplay}>johndoe222</div>
                        )}
                    </div>

                    <div>
                        <p className={styles.infoTitles}>PASSWORD</p>
                        {isEditingProfile ? (
                            <input
                                type="text"
                                defaultValue={"****"}
                                className = {styles.inputField}
                            />
                        ) : (
                            <div className={styles.nameDisplay}>*******</div>
                        )}
                    </div>

                    <Button variant="outlined" sx={{ width: '15%' }}>Change password</Button>
                </div>
                </div>
                
        
        </main> 
    </div>
  </>
    )
}