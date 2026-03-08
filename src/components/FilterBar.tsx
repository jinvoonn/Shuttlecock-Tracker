"use client";

import { Search, Calendar, Tag, X } from "lucide-react";
import { DatePicker } from "./DatePicker";

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

export function FilterBar({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    brandId,
    onBrandChange,
    brands,
    onClear
}: FilterBarProps) {
    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5" /> Filter Results
                </h3>
                <button
                    onClick={onClear}
                    className="text-[10px] font-bold uppercase text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
                >
                    <X className="w-3 h-3" /> Clear Filters
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-600 ml-1">Start Date</label>
                    <DatePicker name="startDate" defaultValue={startDate} onChange={onStartDateChange} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-600 ml-1">End Date</label>
                    <DatePicker name="endDate" defaultValue={endDate} onChange={onEndDateChange} />
                </div>
                {onBrandChange && brands && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-600 ml-1">Brand</label>
                        <select
                            value={brandId}
                            onChange={(e) => onBrandChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                        >
                            <option value="">All Brands</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
}
