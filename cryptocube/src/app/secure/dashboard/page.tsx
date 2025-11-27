import { getAuthSession } from "../../lib/getServerSession";
import DashboardContent from './DashboardContent';
import DashboardHero from "./DashboardHero";

export default async function Page() {
  const session = await getAuthSession();

  return (
    <div className="headline">
      <DashboardHero />  
      <DashboardContent />
    </div>
  );
}
