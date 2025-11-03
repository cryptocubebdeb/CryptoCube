import Sidebar from "../components/Portfolio/Sidebar";

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen ml-64 mr-[320px] p-8">{children}</main>
      <aside className="fixed right-0 top-[2.5vh] h-[95vh] w-[320px] bg-[#15171E] p-6 border-l border-[#23252c]">
        <h2 className="text-xl font-bold mb-6 text-center">Trade</h2>
      </aside>
    </>
  );
}
