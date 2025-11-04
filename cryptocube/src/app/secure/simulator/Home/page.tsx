import PortfolioChart from "../../components/Portfolio/PortfolioChart";

export default function SimulatorHome() {
  return (
    <main className="min-h-screen bg-[#0f1116] text-white p-8 rounded-3xl">
      <h1 id="home" className="text-3xl font-bold mb-6 scroll-mt-[130px]">Simulator Dashboard</h1>
      <PortfolioChart />

      <h1 id="wallet" className="text-3xl mt-100 scroll-mt-[100px]">
        Portfolio coins here
      </h1>

      <h1 id="search" className="text-3xl mt-300 scroll-mt-[100px]">
        Explore coins in categories here
      </h1>

      <h1 id="percent" className="text-3xl mt-300 scroll-mt-[100px]">
        Percentage here
      </h1>

      <h1 id="activity" className="text-3xl mt-300 mb-300 scroll-mt-[100px]">
        Activity here
      </h1>
    </main>
  );
}
