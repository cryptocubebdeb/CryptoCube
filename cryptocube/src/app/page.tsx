// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div
      style={{
        backgroundImage: "url('images/landingpagebackground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "6500px",
      }}
      className="h-screen flex flex-col justify-start items-center space-y-6"
    >
      <h1 className="text-8xl mt-65 mb-15 font-bold text-center">
        Crypto<span className="text-yellow-400">Cube</span>
      </h1>

      <h2 className="text-5xl text-center">Ne te contente pas de suivre la crypto</h2>
      <h2 className="text-5xl text-center underline text-yellow-500 mb-10">Décode-la.</h2>

      <h3 className="text-2xl text-center max-w-5xl px-4 mb-10">
        CryptoCube t&apos;aide à repérer les risques, à analyser les tendances et à prendre des décisions plus éclairées sur le marché.
      </h3>

      {/* Redirectioner vers sign up si pas connecté, et vers dashboard si connecté */}
      <Link href="/auth/signup">
        <button className="text-2xl bg-yellow-400 px-10 py-4 text-black rounded-md hover:bg-yellow-500 font-semibold transition-all duration-200 hover:scale-105">
          Commencer maintenant
        </button>
      </Link>

      <hr className="border-t-4 rounded-md border-yellow-400 w-full max-w-3xl my-20 opacity-30" />

      <div>
        <Image
          src="/images/topcoinsmarket.png"
          alt="Top Coins Market Overview"
          width={1200}
          height={800}
        >
          
        </Image>
      </div>
    </div>
  );
}
