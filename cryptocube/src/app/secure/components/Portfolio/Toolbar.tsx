import React from "react"
import Link from "next/link"
import { Home, Wallet, Search, Percent, Activity, HelpCircle } from "lucide-react"
import { Box } from "lucide-react"
import { ToolbarProps } from "@mui/material"

export default function Toolbar({ activeSection }: { activeSection: string }) {
    return (
        <aside className="fixed left-6 top-[90px] h-[calc(100vh-110px)] w-16 rounded-3xl bg-[#13141a] border border-[#23252c] flex flex-col items-center justify-between py-4">

            <div className="flex flex-col items-center gap-8">
                {/* logo */}
                <div className="w-10 h-10 rounded-full bg-[#1c1e26] flex items-center justify-center text-yellow-400">
                    <Box size={20} />
                </div>

                {/* main icons */}
                <div className="flex flex-col items-center gap-5">
                    <a 
                        href="#home"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition
                            ${activeSection === 'home' ? 'bg-[#23252c] text-yellow-400' : 'bg-[#1c1e26] text-white/85 hover:bg-[#23252c] hover:text-yellow-400'}`
                    }>
                        <Home size={18} />

                    </a>

                    <a 
                        href="#wallet"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition
                            ${activeSection === 'wallet' ? 'bg-[#23252c] text-yellow-400' : 'bg-[#1c1e26] text-white/85 hover:bg-[#23252c] hover:text-yellow-400'}`
                    }>
                        <Wallet size={18} />
                    </a>

                    <a 
                        href="#search"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition
                            ${activeSection === 'search' ? 'bg-[#23252c] text-yellow-400' : 'bg-[#1c1e26] text-white/85 hover:bg-[#23252c] hover:text-yellow-400'}`
                    }>
                        <Search size={18} />
                    </a>

                    <a 
                        href="#percent"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition
                            ${activeSection === 'percent' ? 'bg-[#23252c] text-yellow-400' : 'bg-[#1c1e26] text-white/85 hover:bg-[#23252c] hover:text-yellow-400'}`
                    }>
                        <Percent size={18} />
                    </a>

                    <a 
                        href="#activity"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition
                            ${activeSection === 'activity' ? 'bg-[#23252c] text-yellow-400' : 'bg-[#1c1e26] text-white/85 hover:bg-[#23252c] hover:text-yellow-400'}`
                    }>
                        <Activity size={18} />
                    </a>
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
