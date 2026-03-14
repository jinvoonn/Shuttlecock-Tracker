"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, CalendarDays, DollarSign } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";
import { ADMIN_SECRET } from "@/lib/constants";

export function MobileNav() {
    const pathname = usePathname();
    const { isAdmin } = useRole();
    const mode = isAdmin ? ADMIN_SECRET : "view";

    const navLinks = [
        { name: "Dashboard", href: `/${mode}`, icon: LayoutDashboard },
        { name: "Sessions", href: `/${mode}/sessions`, icon: CalendarDays },
        { name: "Purchases", href: `/${mode}/purchases`, icon: ShoppingCart },
        { name: "Payments", href: `/${mode}/payments`, icon: DollarSign },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
            <div className="mx-4 mb-4 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-around h-16 px-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300",
                                    isActive ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <div className={clsx(
                                    "relative p-1.5 rounded-xl transition-all duration-300",
                                    isActive && "bg-sky-400/10 scale-110"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{link.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
