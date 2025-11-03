// Sidebar.tsx
export default function Sidebar() {
    return (
        <aside className="w-[230px] p-6 flex flex-col border-r border-[#23252c] sticky top-0 h-screen">
            <div className="flex flex-col space-y-8 center bg-[#2a2615] p-4 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold mb-6">CryptoCube</h2>
                <nav className="space-y-4">
                    <a href="/secure/simulator" className="block hover:text-[#e4af04]">Home</a>
                    <a href="/secure/simulator/Portfolio" className="block hover:text-[#e4af04]">Portfolio</a>
                    <a href="/secure/simulator/Orders" className="block hover:text-[#e4af04]">Orders</a>
                    <a href="/secure/simulator/History" className="block hover:text-[#e4af04]">History</a>
                    <a href="/secure/simulator/Explore" className="block hover:text-[#e4af04]">Explore</a>
                </nav>
            </div>
        </aside>
    );
}
