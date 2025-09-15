import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { User, Star, Bell } from "lucide-react" // for icons

const Links = [
    { href:"/secure/account", icon: <User size={18} />, text: 'Détails'},
    { href:"/secure/watchlist", icon: <Star size={18} />, text: 'Watchlist'},
    { href:"/secure/notifications",icon: <Bell size={18} />,  text: 'Notifications'}
];


const Sidebar = () => {
    return (
        <aside className='w-64 min-h-screen text-white p-6'>
            <h1 className='text-xl font-bold mb-8'>Mon Compte</h1>
            <ul className='flex flex-col gap-6'>
                {Links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className='flex items-center gap-3 hover:text-yellow-400 transition-colors'>
                            {link.icon}
                            <span className='font-mono'>{link.text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default Sidebar