import HomeSection from "./components/HomeSection";
import WalletSection from "./components/WalletSection";
import SearchSection from "./components/SearchSection";
import PercentSection from "./components/PercentSection";
import OrdersSection from "./components/OrderSection";
import ActivitySection from "./components/ActivitySection";

export default function SimulatorPage() {
  return (
    <div className="space-y-24 pb-32">
      {/* Dashboard / Overview */}
      <section id="home" className="scroll-mt-32">
        <HomeSection />
      </section>

      {/* Portfolio / Wallet */}
      <section id="wallet" className="scroll-mt-32">
        <WalletSection />
      </section>

      {/* Search */}
      <section id="search" className="scroll-mt-32">
        <SearchSection />
      </section>

      {/* Pending orders */}
      <section id="orders" className="scroll-mt-32">
        <OrdersSection />
      </section>

      {/* Trade history / activity */}
      <section id="activity" className="scroll-mt-32">
        <ActivitySection />
      </section>

      {/* Analytics / Percent */}
      <section id="percent" className="scroll-mt-32">
        <PercentSection />
      </section>
      
    </div>
  );
}
