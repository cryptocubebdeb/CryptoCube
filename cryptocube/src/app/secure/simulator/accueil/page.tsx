"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";


export default function SimulateurAccueil() 
{
    const { t } = useTranslation();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isAuthenticated =
    status === "authenticated" &&
    !!(session?.user && ((session.user as any).id || (session.user as any).email));

    async function handleCreatePortfolio() {
        setLoading(true);
        try {
            const res = await fetch("/api/simulator/createPortfolio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                router.push("/secure/simulator/secure");
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Erreur lors de la création du portfolio :", error);
        } finally {
            setLoading(false);
        }
    }

    return ( 
    <>
    <div className="h-screen flex flex-col justify-center items-center space-y-6">
        <h1 className="text-5xl font-bold mb-10 text-center">
            {t('simulatorWelcome.title').includes('CryptoCube') 
                ? t('simulatorWelcome.title').split('CryptoCube')[0] 
                : t('simulatorWelcome.title').split('Crypto')[0]}
            Crypto<span className="text-yellow-400">Cube</span>
            {t('simulatorWelcome.title').includes('Simulator') ? ' Simulator' : ' Simulateur'}
        </h1>

        <p className="text-2xl mb-13 text-center max-w-3xl">
            {t('simulatorWelcome.description')}
        </p>

        { !isAuthenticated ? (
            <>
            <p className="text-xl text-start max-w-3xl mb-5">
                {t('simulatorWelcome.mustLogin')}
            </p>

            <Button
                variant="outlined"
                onClick={() => router.push("/auth/signin")}
                disabled={loading}
                sx={{
                    mt: 5,
                    mb: 1,
                    padding: '16px 40px',
                    borderRadius: '15px',
                    borderColor: '#FFDD00',
                    borderWidth: '1.5px',
                    color: '#FFDD00',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                        backgroundColor: '#e6c200', 
                        color: 'black',
                        borderColor: '#e6c200',
                        boxShadow: '0 4px 20px rgba(255, 221, 0, 0.3)'
                    } 
                }}
            >
                {t('simulatorWelcome.signInButton')}
            </Button>
            </>
        ) : (
            <div className="flex flex-col justify-center items-center">
                <p style={{ color: 'var(--foreground-alt)' }} className="text-3xl text-start max-w-3xl mt-4 mb-5 font-semibold">
                    {t('simulatorWelcome.moreDetails')}
                </p>

                <p className="text-xl text-start max-w-3xl mb-5">
                    {t('simulatorWelcome.realData')}
                </p>

                <p className="text-xl text-start max-w-3xl mb-10">
                    {t('simulatorWelcome.precision')}
                </p>

                <p className="text-xl text-start mb-5">
                    {t('simulatorWelcome.startingCash', { amount: 'USD$100,000.00' })}
                </p>

                <p className="text-xl text-start mb-5">
                    <span style={{ color: 'var(--foreground-alt)' }}>{t('simulatorWelcome.warning')}</span>: {t('simulatorWelcome.warningText')}
                </p>

                <Button
                    variant="outlined"
                    onClick={handleCreatePortfolio}
                    disabled={loading}
                    sx={{
                        mt: 5,
                        mb: 1,
                        padding: '16px 40px',
                        borderRadius: '15px',
                        borderColor: 'var(--foreground-alt)',
                        borderWidth: '1.5px',
                        color: 'var(--foreground-alt)',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                            backgroundColor: 'var(--foreground-alt)', 
                            color: 'var(--background)',
                            borderColor: 'var(--foreground-alt)',
                            boxShadow: '0 4px 20px rgba(255, 221, 0, 0.3)'
                        } 
                    }}
                >
                    {loading ? t('simulatorWelcome.creating') : t('simulatorWelcome.createPortfolio')}
                </Button>
            </div>
        )}
    </div>
    </>
    )
}