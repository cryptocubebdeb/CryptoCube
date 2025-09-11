import React from 'react'
import Link from "next/link"
import Image from "next/image"

const Links = [
    { href:"/secure/dashboard", text: 'Home'},
    { href:"/secure/coins", text: 'Coins'},
    { href:"/secure/simulator", text: 'Simulator'},
    { href:"/secure/community", text: 'Community'},
    { href:"/secure/about", text: 'About'}
];


const Navbar = () => {
    return (
        <header className="w-full">
            <nav className="w-full">
                <div className="px-15 h-10 flex items-center justify-end">
                <ul className="flex flex-row items-center gap-6 ">
                {Links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="uppercase hover:text-yellow-400 transition-colors font-mono">
                            {link.text}
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