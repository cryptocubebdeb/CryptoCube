import PortfolioChart from "../../components/Portfolio/PortfolioChart";

export default function SimulatorHome() {
  return (
    <main className="min-h-screen bg-[#0f1116] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Simulator Dashboard</h1>
      <PortfolioChart />
    </main>
  );
}
