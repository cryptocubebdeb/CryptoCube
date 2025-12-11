import React from "react"
import Link from "next/link"
import { Home, Wallet, Search, Percent, ShoppingCart, Activity, HelpCircle } from "lucide-react"
import { Box } from "lucide-react"
import { ToolbarProps } from "@mui/material"

export default function Toolbar({ activeSection }: { activeSection: string }) {
    return (
        <aside
            className="fixed left-6 top-[90px] h-[calc(100vh-110px)] w-16 rounded-3xl border border-[var(--background-toolbar-active)] flex flex-col items-center justify-between py-4"
            style={{ background: "var(--color-container-bg)" }}
        >
            <div className="flex flex-col items-center gap-8">
                {/* logo */}
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-container-bg)" }}
                >
                    <Box size={20} color="var(--foreground-alt)" />
                </div>

                {/* main icons */}
                <div className="flex flex-col items-center gap-5">
                    <a
                        href="#home"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${activeSection === 'home' ? '' : 'text-white/85'}`}
                        style={{
                            background: activeSection === 'home' ? 'var(--background-toolbar-active)' : 'var(--color-container-bg)',
                            color: activeSection === 'home' ? 'var(--foreground-alt)' : undefined,
                        }}
                    >
                        <Home size={18} color={activeSection === 'home' ? 'var(--foreground-alt)' : 'var(--foreground)'} />
                    </a>

                    <a
                        href="#wallet"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${activeSection === 'wallet' ? '' : 'text-white/85'}`}
                        style={{
                            background: activeSection === 'wallet' ? 'var(--background-toolbar-active)' : 'var(--color-container-bg)',
                            color: activeSection === 'wallet' ? 'var(--foreground-alt)' : undefined,
                        }}
                    >
                        <Wallet size={18} color={activeSection === 'wallet' ? 'var(--foreground-alt)' : 'var(--foreground)'} />
                    </a>

                    <a
                        href="#search"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${activeSection === 'search' ? '' : 'text-white/85'}`}
                        style={{
                            background: activeSection === 'search' ? 'var(--background-toolbar-active)' : 'var(--color-container-bg)',
                            color: activeSection === 'search' ? 'var(--foreground-alt)' : undefined,
                        }}
                    >
                        <Search size={18} color={activeSection === 'search' ? 'var(--foreground-alt)' : 'var(--foreground)'} />
                    </a>

                    <a
                        href="#percent"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${activeSection === 'percent' ? '' : 'text-white/85'}`}
                        style={{
                            background: activeSection === 'percent' ? 'var(--background-toolbar-active)' : 'var(--color-container-bg)',
                            color: activeSection === 'percent' ? 'var(--foreground-alt)' : undefined,
                        }}
                    >
                        <Percent size={18} color={activeSection === 'percent' ? 'var(--foreground-alt)' : 'var(--foreground)'} />
                    </a>

                    <a
                        href="#orders"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${activeSection === 'orders' ? '' : 'text-white/85'}`}
                        style={{
                            background: activeSection === 'orders' ? 'var(--background-toolbar-active)' : 'var(--color-container-bg)',
                            color: activeSection === 'orders' ? 'var(--foreground-alt)' : undefined,
                        }}
                    >
                        <ShoppingCart size={18} color={activeSection === 'orders' ? 'var(--foreground-alt)' : 'var(--foreground)'} />
                    </a>

                    <a
                        href="#activity"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${activeSection === 'activity' ? '' : 'text-white/85'}`}
                        style={{
                            background: activeSection === 'activity' ? 'var(--background-toolbar-active)' : 'var(--color-container-bg)',
                            color: activeSection === 'activity' ? 'var(--foreground-alt)' : undefined,
                        }}
                    >
                        <Activity size={18} color={activeSection === 'activity' ? 'var(--foreground-alt)' : 'var(--foreground)'} />
                    </a>
                </div>
            </div>

            {/* bottom icons */}
            <div className="flex flex-col items-center gap-5">
                <Link
                    href="#"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70"
                    style={{ background: "var(--color-container-bg)" }}
                >
                    <HelpCircle size={18} color="var(--foreground)" />
                </Link>
            </div>
        </aside>
    )
}
