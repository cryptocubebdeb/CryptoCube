import Toolbar from "../components/Portfolio/Toolbar"

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Left sidebar */}
      <Toolbar />

      {/* Main content */}
      <main className="min-h-screen ml-20 mr-[360px] pt-[20px] p-8">
        {children}
      </main>

      {/* Right panel */}
      <aside className="fixed right-0 top-[90px] h-[calc(100vh-110px)] w-[350px] bg-[#15171E] p-6 mr-5 border-l border-[#23252c]">
        <h2 className="text-xl font-bold mb-6 text-center">Trade</h2>
      </aside>
    </>
      
  )
}
