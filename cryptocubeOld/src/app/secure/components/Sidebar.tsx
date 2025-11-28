import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { User, Star, Bell, Settings, LogOut } from "lucide-react" // for icons
import { signOut } from "next-auth/react"
import { useTranslation } from "react-i18next";

interface SidebarProps {
    userId: number;
}

const Sidebar = ({ userId }: SidebarProps) => {
    const { t } = useTranslation();

    const Links = [
        { href:`/secure/account/details/${userId}`, icon: <User size={20} />, text: t('sidebar.details')},
        { href:`/secure/account/watchlist/${userId}`, icon: <Star size={20} />, text: t('sidebar.watchlist')},
        { href:`/secure/account/notifications/${userId}`,icon: <Bell size={20} />,  text: t('sidebar.notifications')},
        { href:`/secure/account/settings/${userId}`, icon: <Settings size={20} />, text: t('sidebar.settings')}
    ];

    const handleSignOut = async () => {
        try {
            await signOut({
                callbackUrl: '/', // Redirectionner vers page principale
                redirect: true
            });
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    };
    
    return (
        <aside className='sidebar w-64 min-h-screen text-white p-6 flex flex-col justify-between'>
            <div>
                <h1 className='text-xl font-bold mb-8'>{t('sidebar.title')}</h1>
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
                <button 
                    onClick={handleSignOut}
                    className='flex items-center gap-3 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer text-white text-left'
                >
                    <LogOut size={20} />
                    <span className='sidebar-text'>{t('sidebar.signOut')}</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar