"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { verifyViewerPin } from "@/lib/actions/viewerPin";
import { useRole } from "@/context/AuthContext";

interface ViewerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ViewerPinModal({ isOpen, onClose }: ViewerPinModalProps) {
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { refreshViewerState } = useRole();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter the PIN.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyViewerPin(pin);
      if (!res.success) {
        setError(res.error || "Incorrect PIN. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      await refreshViewerState();
      setTimeout(() => {
        setSuccess(false);
        setPin("");
        onClose();
      }, 750);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setPin("");
    setSuccess(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
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
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Unlock Features
              </h3>
              <p className="text-[11px] text-slate-400">
                Enter Viewer PIN for temporary access
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Viewer PIN
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                autoFocus
                disabled={loading || success}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="• • • •"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-2xl px-4 py-3.5 text-center text-2xl font-mono tracking-widest text-emerald-400 placeholder:text-slate-700 outline-none transition-all disabled:opacity-50"
              />
              <KeyRound className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold animate-in zoom-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Unlocked successfully! (Valid for 60m)</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success || !pin.trim()}
              className="flex-[2] px-4 py-3 bg-emerald-400 hover:bg-emerald-300 active:scale-98 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-400/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : success ? (
                "Unlocked"
              ) : (
                "Unlock"
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <span className="text-[10px] text-slate-500">
            PIN unlocks match management for 60 minutes
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
