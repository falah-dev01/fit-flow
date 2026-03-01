'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, LogOut, Menu, CalendarDays, Contact2, Store, Wrench, Tag, Shield } from 'lucide-react';

interface UserSession {
    name: string;
    email: string;
    role: 'ADMIN' | 'TRAINER';
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<UserSession | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (e) {
                console.error('Failed to fetch user session', e);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Members', href: '/admin/members', icon: Users },
        { name: 'Subscription Plans', href: '/admin/plans', icon: Tag, isNew: true },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard },
        { name: 'Classes', href: '/admin/classes', icon: CalendarDays, isNew: true },
        { name: 'Staff Directory', href: '/admin/staff', icon: Contact2, isNew: true },
        { name: 'Point of Sale', href: '/admin/sales', icon: Store, isNew: true },
        { name: 'Equipment', href: '/admin/equipment', icon: Wrench, isNew: true },
        { name: 'Backup & Security', href: '/admin/backup', icon: Shield, isNew: true },
    ];

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-slate-900 border-r border-slate-800">
            <div className="flex h-16 items-center px-6 border-b border-slate-800 shrink-0">
                <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image src="/logo.png" alt="FitFlow Logo" width={32} height={32} className="rounded-lg bg-white p-1" />
                    <span className="text-xl font-bold tracking-tight text-white">FitFlow<span className="text-primary-400">.</span></span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Main Menu</p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </div>
                            {item.isNew && (
                                <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 shrink-0 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Loading...'}</p>
                        <p className="text-xs text-slate-500 truncate">Administrator</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col z-20 shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" />
                    <aside className="fixed inset-y-0 left-0 w-64 shadow-xl z-50 md:hidden transition-transform duration-300 transform translate-x-0">
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full overflow-hidden">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 md:hidden">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900 truncate">
                            {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white"></span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-8 z-0 w-full">
                    <div className="max-w-6xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
