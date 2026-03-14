"use client";

import { useState, ReactNode } from "react";
import { ChevronRight, Folder as FolderIcon, FolderOpen } from "lucide-react";
import clsx from "clsx";

interface FolderProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

export function Folder({ title, children, defaultOpen = false }: FolderProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 group glass-card glass-card-hover",
                    isOpen
                        ? "border-sky-500/30 text-sky-400 bg-sky-500/5 shadow-lg shadow-sky-500/5"
                        : "text-slate-400 hover:text-slate-200"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "p-2 rounded-xl transition-colors",
                        isOpen ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                    )}>
                        {isOpen ? <FolderOpen className="w-5 h-5" /> : <FolderIcon className="w-5 h-5" />}
                    </div>
                    <span className="font-semibold text-sm uppercase tracking-wider">{title}</span>
                </div>
                <ChevronRight className={clsx(
                    "w-5 h-5 transition-transform duration-300",
                    isOpen && "rotate-90"
                )} />
            </button>

            {isOpen && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}
