import React from "react"
import Link from "next/link"
import { Home, Wallet, Search, Percent, Activity, Gift, HelpCircle } from "lucide-react"
import { Box } from "lucide-react"

export default function Toolbar() {
    return (
        <aside className="fixed left-6 top-[90px] h-[calc(100vh-110px)] w-16 rounded-3xl bg-[#13141a] border border-[#23252c] flex flex-col items-center justify-between py-4">

            <div className="flex flex-col items-center gap-8">
                {/* logo */}
                <div className="w-10 h-10 rounded-full bg-[#1c1e26] flex items-center justify-center text-yellow-400">
                    <Box size={20} />
                </div>

                {/* main icons */}
                <div className="flex flex-col items-center gap-5">
                    <Link href="#" className="w-10 h-10 rounded-xl bg-[#1c1e26] flex items-center justify-center text-white/85">
                        <Home size={18} />
                    </Link>
                    <Link href="#" className="w-10 h-10 rounded-xl bg-[#1c1e26] flex items-center justify-center text-white/70">
                        <Wallet size={18} />
                    </Link>
                    <Link href="#" className="w-10 h-10 rounded-xl bg-[#1c1e26] flex items-center justify-center text-white/70">
                        <Search size={18} />
                    </Link>
                    <Link href="#" className="w-10 h-10 rounded-xl bg-[#1c1e26] flex items-center justify-center text-white/70">
                        <Percent size={18} />
                    </Link>
                    <Link href="#" className="w-10 h-10 rounded-xl bg-[#1c1e26] flex items-center justify-center text-white/70">
                        <Activity size={18} />
                    </Link>
                </div>
            </div>
            

            {/* bottom icons */}
            <div className="flex flex-col items-center gap-5">
                <Link href="#" className="w-10 h-10 rounded-xl bg-[#1c1e26] flex items-center justify-center text-white/70">
                    <HelpCircle size={18} />
                </Link>
            </div>
        </aside>
    )
}
