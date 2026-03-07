"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, CalendarDays, DollarSign } from "lucide-react";
import clsx from "clsx";

export function Navigation() {
    const pathname = usePathname();

    const navLinks = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Purchases", href: "/purchases", icon: ShoppingCart },
        { name: "Sessions", href: "/sessions", icon: CalendarDays },
        { name: "Payments", href: "/payments", icon: DollarSign },
    ];

    return (
        <nav className="fixed bottom-0 w-full border-t border-white/10 bg-black/50 backdrop-blur-md pb-safe md:relative md:inset-auto md:w-64 md:border-t-0 md:border-r md:h-screen md:bg-transparent">
            <div className="flex h-16 items-center justify-around px-4 md:h-20 md:flex-col md:justify-start md:px-6 md:py-8 md:gap-4 md:items-start">
                <div className="hidden md:flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-emerald-400">
                        ShuttleTracker
                    </span>
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
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
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
    );
}
