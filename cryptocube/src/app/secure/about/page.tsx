import Link from "next/link";
import Footer from "../../components/Footer";

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-white/3 to-white/2 p-6 rounded-lg border border-white/6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-sm text-white/80">{children}</div>
    </div>
  );
}

// Avatar component removed — section "L'équipe" was deleted per request.

export default function Page() {
  return (
    <>
      <main className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#071226] to-[#021025] text-white">
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">À propos de CryptoCube</h1>
              <p className="mt-4 text-lg text-white/75">
                CryptoCube est une source dédiée aux données, aux analyses et à la
                communauté crypto. Notre mission est d'accélérer la révolution
                crypto en organisant l'intelligence liée aux cryptomonnaies et en la
                rendant facilement accessible à tous.
              </p>

              <p className="mt-3 text-base text-white/70">
                Nos contenus et outils sont pensés pour aider les passionnés, les
                chercheurs et les étudiants à mieux comprendre le marché et à
                tester des stratégies sans risque grâce à des simulateurs et des
                données claires.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/secure/coins" className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:opacity-95">Explorer les coins</Link>
                <Link href="/secure/simulator" className="inline-block rounded border border-white/10 px-4 py-2 text-white/90 hover:bg-white/3">Ouvrir le simulateur</Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">Données Temps Réel</h4>
                <p className="text-sm text-white/80 mt-2">Accès aux prix et volumes actualisés pour prendre des décisions éclairées.</p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">Simulateur</h4>
                <p className="text-sm text-white/80 mt-2">Testez des stratégies sans risque avec des portefeuilles fictifs.</p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">Filtrage Avancé</h4>
                <p className="text-sm text-white/80 mt-2">Trouvez rapidement les coins qui correspondent à vos critères.</p>
              </div>
              <div className="p-4 bg-white/3 rounded-lg">
                <h4 className="font-semibold">Actualités</h4>
                <p className="text-sm text-white/80 mt-2">Regroupez les sources et suivez les tendances du marché.</p>
              </div>
            </div>
          </div>

          <section className="mt-12 bg-white/4 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Pourquoi CryptoCube ?</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Feature title="Clarté">Interface simple, données accessibles et explications là où il le faut.</Feature>
              <Feature title="Sécurité">Aucun argent réel n'est requis pour tester — simulez et apprenez.</Feature>
              <Feature title="Évolutif">Outils pensés pour évoluer avec vos besoins (filters, watchlists, alertes).</Feature>
            </div>
          </section>

          {/* Section "L'équipe" supprimée */}

          <section className="mt-12 mb-20 p-6 bg-gradient-to-r from-white/3 to-white/5 rounded-lg border border-white/6">
            <h3 className="text-xl font-semibold">Contact</h3>
            <p className="text-white/80 mt-2">Pour toute demande, écrivez-nous : <a href="mailto:contact@cryptocube.local" className="underline">contact@cryptocube.local</a></p>
          </section>
        </section>
      </main>

      
    </>
  );
}