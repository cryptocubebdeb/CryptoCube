import Toolbar from "../components/Portfolio/Toolbar"

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Left sidebar */}
      <Toolbar />

      {/* Main content */}
      <main className="min-h-screen ml-64 mr-[320px] pt-[70px] p-8">
        {children}
      </main>

      {/* Right panel */}
      <aside className="fixed right-0 top-[70px] h-[calc(100vh-70px)] w-[320px] bg-[#15171E] p-6 border-l border-[#23252c]">
        <h2 className="text-xl font-bold mb-6 text-center">Trade</h2>
      </aside>
    </>
  )
}
