"use client";

import { useState } from "react";
import { Star, Edit2, Check, X, Info } from "lucide-react";
import { updatePlayerSkill } from "@/lib/actions/players";
import { useRole } from "@/context/AuthContext";
import clsx from "clsx";

interface SkillRatingEditorProps {
    playerId: string;
    initialSkill: number;
}

export function SkillRatingEditor({ playerId, initialSkill }: SkillRatingEditorProps) {
    const { isAdmin } = useRole();
    const [isEditing, setIsEditing] = useState(false);
    const [skill, setSkill] = useState(initialSkill);
    const [tempSkill, setTempSkill] = useState(initialSkill);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePlayerSkill(playerId, tempSkill);
            setSkill(tempSkill);
            setIsEditing(false);
        } catch (err: any) {
            alert("Failed to update skill: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempSkill(skill);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "w-1.5 h-4 rounded-full transition-all duration-500",
                                i < skill ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "bg-slate-800"
                            )}
                        />
                    ))}
                </div>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {skill}/10
                </span>
                {isAdmin && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-slate-500 hover:text-sky-400 transition-colors p-1"
                        title="Edit Skill Rating"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3 shadow-2xl animate-in zoom-in-95 duration-200 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <Info className="w-3 h-3" /> Adjust Skill Rating
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-all disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-sky-400">
                        {tempSkill}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium italic">
                        {tempSkill <= 3 ? "Beginner" : tempSkill <= 6 ? "Intermediate" : tempSkill <= 8 ? "Advanced" : "Professional"}
                    </span>
                </div>
                
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={tempSkill}
                    onChange={(e) => setTempSkill(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                
                <div className="flex justify-between text-[10px] font-bold text-slate-600 px-1">
                    <span>1</span>
                    <span>10</span>
                </div>
            </div>
        </div>
    );
}
