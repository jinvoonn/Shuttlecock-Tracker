"use client";

import React, { useState } from "react";
import { Lock, Unlock, LogOut, Check } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";
import { ViewerPinModal } from "./ViewerPinModal";

interface ViewerUnlockButtonProps {
  className?: string;
  variant?: "header" | "pill";
}

export function ViewerUnlockButton({ className, variant = "header" }: ViewerUnlockButtonProps) {
  const { isAdmin, viewerUnlocked, lockViewer } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [showConfirmLock, setShowConfirmLock] = useState(false);
  const [locking, setLocking] = useState(false);

  // Admin already has full privileges; no viewer unlock needed
  if (isAdmin) return null;

  const handleLock = async () => {
    setLocking(true);
    try {
      await lockViewer();
      setShowConfirmLock(false);
    } finally {
      setLocking(false);
    }
  };

  return (
    <>
      <div className="relative inline-block">
        {viewerUnlocked ? (
          <div className="relative">
            <button
              onClick={() => setShowConfirmLock(!showConfirmLock)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm",
                "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400 shadow-emerald-500/10",
                className
              )}
              title="Click to lock session"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlocked</span>
            </button>

            {/* Lock Confirmation Popover */}
            {showConfirmLock && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowConfirmLock(false)} 
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-slate-300 px-1">
                    Temporary Session Active
                  </div>
                  <button
                    onClick={handleLock}
                    disabled={locking}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{locking ? "Locking..." : "Lock Now"}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
              "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border-slate-700/80 hover:border-emerald-500/40",
              className
            )}
            title="Enter PIN to unlock match features"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock</span>
          </button>
        )}
      </div>

      <ViewerPinModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
