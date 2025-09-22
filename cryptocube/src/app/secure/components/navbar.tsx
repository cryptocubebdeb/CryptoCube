import '../globals.css'
import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { User } from "lucide-react" // for user icon
import { Search } from 'lucide-react' // for search icon


const Links = [
    { href:"/secure/dashboard", text: 'Accueil'},
    { href:"/secure/coins", text: 'Coins'},
    { href:"/secure/simulator", text: 'Simulateur'},
    { href:"/secure/community", text: 'Communauté'},
    { href:"/secure/about", text: 'À propos'},
    { href:"", icon: <Search size={20} /> },
    { href:"/secure/account/details", icon: <User size={20} /> }
];


const Navbar = () => {
    return (
        <header className="w-full">
            <nav className="w-full">
                <div className="px-15 h-10 flex items-center justify-end">
                <ul className="flex flex-row items-center gap-6 ">
                {Links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href}
                            className="navbar-text uppercase text-sm hover:text-yellow-400 transition-colors">
                            {link.text || link.icon}
                        </Link>
                    </li>
                ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
}

export default Navbar