import PortfolioChart from "../../components/Portfolio/PortfolioChart";

export default function SimulatorHome() {
  return (
    <main className="min-h-screen bg-[#0f1116] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Simulator Dashboard</h1>
      <PortfolioChart />

      <h1 className="text-3xl mt-100">
        Portfolio coins here
      </h1>

      <h1 className="text-3xl mt-300">
        Explore coins in categories here
      </h1>

      <h1 className="text-3xl mt-300">
        Percentage here
      </h1>

      <h1 className="text-3xl mt-300 mb-300">
        Activity here
      </h1>
    </main>
  );
}
