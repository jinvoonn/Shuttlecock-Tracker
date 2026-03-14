"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import clsx from "clsx";

interface FilterBarProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
    brandId?: string;
    onBrandChange?: (val: string) => void;
    brands?: { id: string, name: string }[];
    onClear: () => void;
}

type Preset = "all" | "30d" | "3m" | "year";

const PRESETS: { key: Preset; label: string }[] = [
    { key: "all", label: "All Time" },
    { key: "30d", label: "Past 30 Days" },
    { key: "3m", label: "Past 3 Months" },
    { key: "year", label: "This Year" },
];

function getPresetDates(preset: Preset): { start: string; end: string } {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const todayStr = fmt(today);

    if (preset === "30d") {
        const start = new Date(today);
        start.setDate(start.getDate() - 30);
        return { start: fmt(start), end: todayStr };
    }
    if (preset === "3m") {
        const start = new Date(today);
        start.setMonth(start.getMonth() - 3);
        return { start: fmt(start), end: todayStr };
    }
    if (preset === "year") {
        return { start: `${today.getFullYear()}-01-01`, end: todayStr };
    }
    return { start: "", end: "" }; // all time
}

export function FilterBar({
    onStartDateChange,
    onEndDateChange,
    brandId,
    onBrandChange,
    brands,
    onClear,
}: FilterBarProps) {
    const [activePreset, setActivePreset] = useState<Preset>("all");

    const applyPreset = (preset: Preset) => {
        setActivePreset(preset);
        const { start, end } = getPresetDates(preset);
        onStartDateChange(start);
        onEndDateChange(end);
        if (preset === "all") onClear();
    };

    return (
        <div className="mb-6 space-y-3">
            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2">
                {PRESETS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => applyPreset(key)}
                        className={clsx(
                            "text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200",
                            activePreset === key
                                ? "bg-sky-500 border-sky-500 text-slate-950 shadow shadow-sky-500/30"
                                : "bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Brand filter (Purchases page only) */}
            {onBrandChange && brands && (
                <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-slate-600 shrink-0" />
                    <select
                        value={brandId}
                        onChange={(e) => onBrandChange(e.target.value)}
                        className="w-full max-w-xs bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                        <option value="">All Brands</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
