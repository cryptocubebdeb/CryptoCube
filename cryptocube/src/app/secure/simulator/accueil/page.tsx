import Link from "next/link"

import Button from "@mui/material/Button";

export default function SimulateurAccueil() 
{
    return ( 
    <>
    <div className="h-screen flex flex-col justify-center items-center space-y-6">
        <h1 className="text-5xl font-bold mb-10 text-center">Bienvenue dans le simulateur Crypto<span className="text-yellow-400">Cube</span></h1>

        <p className="text-2xl mb-13 text-center max-w-3xl">
            Ici, vous pouvez tester vos stratégies de trading sans risque. Découvrez les fonctionnalités, suivez vos performances, et apprenez à dominer le marché crypto.
        </p>

        <div className="flex flex-col justify-center items-center">
            <p className="text-3xl text-start max-w-3xl mt-4 mb-5 text-yellow-400 font-semibold">
                Plus de détails
            </p>

            <p className="text-xl text-start max-w-3xl mb-5">
                Notre simulateur utilise des données réelles afin de reproduire parfaitement le trading du monde réel.
            </p>

            <p className="text-xl text-start max-w-3xl mb-10">
                La précision avec laquelle nous imitons le marché est presque parfaite et vos compétences le deviendront aussi.
            </p>

            <p className="text-xl text-start mb-5">
                Pour commencer le simulateur, nous vous offrons <span className="font-bold">USD$100,000.00</span> à trader librement.
            </p>

            <p className="text-xl text-start mb-5">
                <span className="text-yellow-400">Avertissement</span>: Toutes les transactions sont effectuées en <span className="underline">dollars américains (USD)</span>.
            </p>
        </div>


        <Button
            variant="outlined"
            href="/secure/simulator/secure"
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
            Créer un portfolio dans le simulateur
        </Button>
    </div> 
  </>
    )
}