"use client";

import { useState, useMemo } from "react";
import { Folder } from "@/components/Folder";
import { FilterBar } from "@/components/FilterBar";
import { PurchaseItem } from "./PurchaseItem";
import { Archive } from "lucide-react";

interface Purchase {
    id: string;
    brand_id: string;
    purchase_date: string;
    tube_number: number;
    initial_quantity: number;
    remaining_quantity: number;
    price_per_tube: number;
    price_per_cock: number;
    notes: string | null;
    brands: { name: string } | null;
}

interface Brand {
    id: string;
    name: string;
}

export function PurchasesList({ purchases, brands }: { purchases: Purchase[], brands: Brand[] }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [brandId, setBrandId] = useState("");

    const filteredPurchases = useMemo(() => {
        return purchases.filter(p => {
            const pDate = p.purchase_date;
            const matchesStart = !startDate || pDate >= startDate;
            const matchesEnd = !endDate || pDate <= endDate;
            const matchesBrand = !brandId || p.brand_id === brandId;

            return matchesStart && matchesEnd && matchesBrand;
        });
    }, [purchases, startDate, endDate, brandId]);

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        setBrandId("");
    };

    return (
        <Folder title="Shuttlecock Purchases" defaultOpen={true}>
            <FilterBar
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                brandId={brandId}
                onBrandChange={setBrandId}
                brands={brands}
                onClear={handleClear}
            />

            {filteredPurchases.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 border-dashed bg-slate-900/10 p-12 text-center mt-4">
                    <Archive className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-300 font-medium mb-1">No matching tubes</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        Adjust your filters or add a new purchase to see results.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 transition-all">
                    {filteredPurchases.map((purchase) => (
                        <PurchaseItem key={purchase.id} purchase={purchase} brands={brands} />
                    ))}
                </div>
            )}
        </Folder>
    );
}
