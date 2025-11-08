import { getAuthSession } from "../../lib/getServerSession";
import DashboardContent from './DashboardContent';

export default async function Page() {
  const session = await getAuthSession();

  return (
    <div className={"headline"}>
      <div className="text-center mx-auto space-y-8">
          {/* Main Title */}
          <h1 className="text-4xl max-w-6xl md:text-5xl font-bold leading-tight">
              Naviguez dans le monde de la cryptomonnaie en toute simplicité.
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-light opacity-75">
              Simple. Rapide. Transparent.
          </p>
      </div>

      <DashboardContent />
    </div>
  );
}
