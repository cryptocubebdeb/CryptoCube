import React from 'react'
import '../../globals.css'
import Link from "next/link"
import Image from "next/image"
import { User, Star, Bell, Settings, LogOut } from "lucide-react" // for icons

const Links = [
    { href:"/secure/account/details", icon: <User size={18} />, text: 'Détails'},
    { href:"/secure/account/watchlist", icon: <Star size={18} />, text: 'Watchlist'},
    { href:"/secure/account/notifications",icon: <Bell size={18} />,  text: 'Notifications'},
    { href:"/secure/account/settings", icon: <Settings size={18} />, text: 'Paramètres'}
];


const Sidebar = () => {
    return (
        <aside className='w-64 min-h-screen text-white p-6 flex flex-col justify-between'>
            <div>
                <h1 className='text-xl font-bold mb-8'>Mon Compte</h1>
                <ul className='flex flex-col gap-6'>
                    {Links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className='sidebar-text flex items-center gap-3 hover:text-yellow-400 transition-colors'>
                                {link.icon}
                                <span className='font-mono'>{link.text}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className='mb-30'>
                <Link href="" className='flex items-center gap-3 hover:text-red-500 transition-colors'>
                    <LogOut size={18} />
                    <span className='font-mono'>Déconnexion</span>
                </Link>
            </div>
        </aside>
    );
}

export default Sidebar