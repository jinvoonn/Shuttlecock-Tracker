"use client";

import { useRef, useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import clsx from "clsx";

interface DatePickerProps {
    name?: string;
    defaultValue?: string;
    className?: string;
    onChange?: (value: string) => void;
    required?: boolean;
    id?: string;
}

export function DatePicker({ name, defaultValue, className, onChange, required, id }: DatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [date, setDate] = useState(defaultValue || new Date().toISOString().split('T')[0]);
    const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);

    if (defaultValue !== prevDefaultValue) {
        setDate(defaultValue || new Date().toISOString().split('T')[0]);
        setPrevDefaultValue(defaultValue);
    }

    const handleButtonClick = () => {
        // Use showPicker if available (modern browsers)
        if (inputRef.current && 'showPicker' in HTMLInputElement.prototype) {
            try {
                inputRef.current.showPicker();
            } catch (e) {
                // Fallback for some environments
                inputRef.current.click();
            }
        } else if (inputRef.current) {
            inputRef.current.click();
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setDate(newVal);
        if (onChange) {
            onChange(newVal);
        }
    };

    const formattedDate = date
        ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : "Select Date";

    return (
        <div className={clsx("relative", className)}>
            <button
                type="button"
                onClick={handleButtonClick}
                className="w-full flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 hover:border-emerald-500/50 hover:bg-zinc-900/50 transition-all text-sm group text-left"
            >
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 leading-none mb-0.5">Select Date</span>
                    <span className="font-mono text-zinc-100">{formattedDate}</span>
                </div>
            </button>

            {/* Hidden native input that provides the calendar/picker functionality */}
            <input
                ref={inputRef}
                type="date"
                id={id}
                name={name}
                value={date}
                onChange={handleDateChange}
                required={required}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
            />
        </div>
    );
}
