"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, CalendarDays, DollarSign, Eye } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";
import { ADMIN_SECRET } from "@/lib/constants";

export function Navigation() {
    const pathname = usePathname();
    const { role, isAdmin } = useRole();
    const mode = isAdmin ? ADMIN_SECRET : "view";

    const navLinks = [
        { name: "Dashboard", href: `/${mode}`, icon: LayoutDashboard },
        { name: "Purchases", href: `/${mode}/purchases`, icon: ShoppingCart },
        { name: "Sessions", href: `/${mode}/sessions`, icon: CalendarDays },
        { name: "Payments", href: `/${mode}/payments`, icon: DollarSign },
    ];

    return (
        <>
            {/* Viewer Mode Banner */}
            {!isAdmin && (
                <div className="fixed top-0 left-0 right-0 z-[60] py-2 bg-amber-500 text-slate-950 text-center font-bold text-xs uppercase tracking-widest shadow-lg animate-in slide-in-from-top duration-500">
                    <div className="flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        Viewer Mode – Read Only
                    </div>
                </div>
            )}

            <nav className={clsx(
                "fixed bottom-0 w-full border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl pb-safe md:relative md:inset-auto md:w-64 md:border-t-0 md:border-r md:h-screen md:bg-slate-900/50 z-50",
                !isAdmin && "md:pt-8" // Add space if banner is present on desktop
            )}>
                <div className="flex h-16 items-center justify-around px-4 md:h-full md:flex-col md:justify-start md:px-6 md:py-8 md:gap-4 md:items-start">
                    <div className="hidden md:flex flex-col gap-6 w-full mb-8">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/20 shrink-0" />
                            <span className="text-xl font-bold text-slate-50 tracking-tight">
                                ShuttleTracker
                            </span>
                        </div>
                    </div>

                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={clsx(
                                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 md:flex-row md:w-full md:px-4 md:py-3",
                                    isActive
                                        ? "text-sky-400 bg-sky-500/10"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                                )}
                            >
                                <Icon
                                    className={clsx(
                                        "w-6 h-6 md:w-5 md:h-5 transition-transform duration-300",
                                        isActive && "scale-110"
                                    )}
                                />
                                <span className="text-[10px] font-medium md:text-sm">{link.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
