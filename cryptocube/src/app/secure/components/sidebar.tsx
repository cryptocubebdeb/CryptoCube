import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { User, Star, Bell, Settings, LogOut } from "lucide-react" // for icons

interface SidebarProps {
    userId: number;
}

const Sidebar = ({ userId }: SidebarProps) => {
    const Links = [
        { href:`/secure/account/details/${userId}`, icon: <User size={20} />, text: 'Détails'},
        { href:`/secure/account/watchlist/${userId}`, icon: <Star size={20} />, text: 'Watchlist'},
        { href:`/secure/account/notifications/${userId}`,icon: <Bell size={20} />,  text: 'Notifications'},
        { href:`/secure/account/settings/${userId}`, icon: <Settings size={20} />, text: 'Paramètres'}
    ];
    
    return (
        <aside className='sidebar w-64 min-h-screen text-white p-6 flex flex-col justify-between'>
            <div>
                <h1 className='text-xl font-bold mb-8'>Mon Compte</h1>
                <ul className='flex flex-col gap-6'>
                    {Links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className='flex items-center gap-3 hover:text-yellow-400 transition-colors'>
                                {link.icon}
                                <span>{link.text}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className='mb-30'>
                <Link href="" className='flex items-center gap-3 hover:text-red-500 transition-colors'>
                    <LogOut size={20} />
                    <span className='sidebar-text'>Déconnexion</span>
                </Link>
            </div>
        </aside>
    );
}

export default Sidebar