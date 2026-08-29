"use client";

import React, { useState } from "react";
import { Lock, Unlock, LogOut, ShieldCheck, CheckCircle2, X } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";
import { ViewerPinModal } from "./ViewerPinModal";

interface ViewerUnlockButtonProps {
  className?: string;
  variant?: "header" | "button" | "banner" | "inline" | "icon";
  label?: string;
}

export function ViewerUnlockButton({ 
  className, 
  variant = "button",
  label 
}: ViewerUnlockButtonProps) {
  const { isAdmin, viewerUnlocked, viewerPermissions, lockViewer } = useRole();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [locking, setLocking] = useState(false);

  // Admin already has full privileges; no viewer unlock needed
  if (isAdmin) return null;

  const handleLock = async () => {
    setLocking(true);
    try {
      await lockViewer();
      setSessionModalOpen(false);
    } finally {
      setLocking(false);
    }
  };

  return (
    <>
      {/* 1. Banner Variant (Used in Dashboard middle content) */}
      {variant === "banner" && (
        <div className={clsx("w-full transition-all duration-300", className)}>
          {viewerUnlocked ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-500/5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <span>Viewer Mode Unlocked</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Match logging & editing enabled (60m session)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSessionModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
              >
                Session
              </button>
            </div>
          ) : (
            <div className="bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 flex items-center justify-between shadow-md transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Viewer Mode (Read-Only)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Enter Viewer PIN to log results and edit matches
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPinModalOpen(true)}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-400/20 transition-all shrink-0"
              >
                Unlock
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Inline / Action Variant (Used in Match sections) */}
      {variant === "inline" && (
        viewerUnlocked ? (
          <button
            onClick={() => setSessionModalOpen(true)}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border shrink-0",
              "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
              className
            )}
          >
            <Unlock className="w-3 h-3" />
            <span>Unlocked</span>
          </button>
        ) : (
          <button
            onClick={() => setPinModalOpen(true)}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 active:scale-95",
              "bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border-slate-700 hover:border-emerald-500/40 shadow-sm",
              className
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{label || "Unlock to Record Match"}</span>
          </button>
        )
      )}

      {/* 3. Header / Button Variant (Standard Button) */}
      {(variant === "header" || variant === "button") && (
        viewerUnlocked ? (
          <button
            onClick={() => setSessionModalOpen(true)}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm shrink-0 whitespace-nowrap",
              "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400 shadow-emerald-500/10",
              className
            )}
            title="Click to manage temporary session"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>{label || "Unlocked"}</span>
          </button>
        ) : (
          <button
            onClick={() => setPinModalOpen(true)}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 whitespace-nowrap",
              "bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border-slate-700 hover:border-emerald-500/40 shadow-sm",
              className
            )}
            title="Enter PIN to unlock match features"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{label || "Unlock"}</span>
          </button>
        )
      )}

      {/* 4. Icon Variant (Compact icon-only button for top-right mobile header) */}
      {variant === "icon" && (
        viewerUnlocked ? (
          <button
            onClick={() => setSessionModalOpen(true)}
            className={clsx(
              "p-2 rounded-xl bg-slate-800 border border-emerald-500/30 text-emerald-400 hover:border-emerald-400 active:scale-95 transition-all shadow-sm shadow-emerald-500/10 flex items-center justify-center",
              className
            )}
            title="Viewer Mode Unlocked (Click to manage session)"
          >
            <Unlock className="size-4" />
          </button>
        ) : (
          <button
            onClick={() => setPinModalOpen(true)}
            className={clsx(
              "p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 active:scale-95 transition-all shadow-sm flex items-center justify-center",
              className
            )}
            title="Unlock Viewer Features"
          >
            <Lock className="size-4" />
          </button>
        )
      )}

      {/* Centered PIN Entry Modal */}
      <ViewerPinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
      />

      {/* Centered Session Management & Lock Popup Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle glow accent */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Viewer Session Active
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Temporary match access granted (60m)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSessionModalOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permissions list */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                Active Permissions:
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                {viewerPermissions.map((perm) => (
                  <div key={perm} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold">{perm.replace(/_/g, " ")}</span>
                  </div>
                ))}
                {viewerPermissions.length === 0 && (
                  <span className="text-slate-500 italic text-xs">Standard match logging</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleLock}
                disabled={locking}
                className="w-full px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 active:scale-98 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{locking ? "Locking Session..." : "Lock Session Now"}</span>
              </button>
              <button
                onClick={() => setSessionModalOpen(false)}
                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-bold transition-colors"
              >
                Keep Unlocked
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
