"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, CalendarDays, DollarSign, Eye } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";
import { ADMIN_SECRET } from "@/lib/constants";
import { Logo } from "@/components/Logo";

export function Navigation() {
    const pathname = usePathname();
    const { isAdmin } = useRole();
    const mode = isAdmin ? ADMIN_SECRET : "view";

    const navLinks = [
        { name: "Dashboard", href: `/${mode}`, icon: LayoutDashboard },
        { name: "Purchases", href: `/${mode}/purchases`, icon: ShoppingCart },
        { name: "Sessions", href: `/${mode}/sessions`, icon: CalendarDays },
        { name: "Payments", href: `/${mode}/payments`, icon: DollarSign },
    ];

    // Derive current page name for mobile topbar
    const activeLink = navLinks.find(l => pathname === l.href);
    const pageName = activeLink?.name ?? "CockCount";

    return (
        <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-slate-800 bg-slate-900 z-50 overflow-y-auto">
            <div className="flex flex-col h-full px-6 py-8 gap-4 items-start">
                <div className="flex flex-col gap-6 w-full mb-8">
                    <Logo />
                </div>

                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={clsx(
                                "relative flex flex-row items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-500 group",
                                isActive
                                    ? "text-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/5"
                                    : "text-slate-500 hover:text-slate-100 hover:bg-slate-800"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5 transition-transform duration-500", isActive ? "scale-110" : "group-hover:scale-110")} />
                            <span className="text-sm font-black uppercase tracking-widest">{link.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
