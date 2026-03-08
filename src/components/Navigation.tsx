"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, CalendarDays, DollarSign } from "lucide-react";
import clsx from "clsx";

import { useRole } from "@/context/AuthContext";
import { Shield, ShieldCheck, User as UserIcon } from "lucide-react";

export function Navigation() {
    const pathname = usePathname();
    const { role, setRole, isAdmin } = useRole();

    const navLinks = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Purchases", href: "/purchases", icon: ShoppingCart },
        { name: "Sessions", href: "/sessions", icon: CalendarDays },
        { name: "Payments", href: "/payments", icon: DollarSign },
    ];

    return (
        <nav className="fixed bottom-0 w-full border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl pb-safe md:relative md:inset-auto md:w-64 md:border-t-0 md:border-r md:h-screen md:bg-slate-900/50 z-50">
            <div className="flex h-16 items-center justify-around px-4 md:h-full md:flex-col md:justify-start md:px-6 md:py-8 md:gap-4 md:items-start">
                <div className="hidden md:flex flex-col gap-6 w-full mb-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/20 shrink-0" />
                        <span className="text-xl font-bold text-slate-50 tracking-tight">
                            ShuttleTracker
                        </span>
                    </div>

                    {/* Role Status Indicator (Desktop) */}
                    <div className="px-2">
                        <button
                            onClick={() => setRole(isAdmin ? "viewer" : "admin")}
                            className={clsx(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all",
                                isAdmin
                                    ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                    : "bg-slate-800 border-slate-700 text-slate-500"
                            )}
                        >
                            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            {role} mode
                        </button>
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

                {/* Mobile Role Toggle */}
                <button
                    onClick={() => setRole(isAdmin ? "viewer" : "admin")}
                    className={clsx(
                        "md:hidden flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                        isAdmin ? "text-sky-400" : "text-slate-500"
                    )}
                >
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium capitalize">{role}</span>
                </button>
            </div>
        </nav>
    );
}
