"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  AlertCircle, 
  Loader2, 
  Lock, 
  CheckSquare, 
  Square,
  Sparkles
} from "lucide-react";
import clsx from "clsx";
import { 
  changeViewerPin, 
  updateViewerPermissions, 
  getViewerPinStatus 
} from "@/lib/actions/viewerPin";
import { 
  VIEWER_PERMISSIONS, 
  ViewerPermission, 
  ALL_VIEWER_PERMISSION_KEYS 
} from "@/lib/constants";
import { useAppRoute } from "@/hooks/useAppRoute";

interface ViewerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERMISSION_GROUPS: {
  title: string;
  items: { key: ViewerPermission; label: string; description: string }[];
}[] = [
  {
    title: "Match Permissions (Default Enabled)",
    items: [
      { key: VIEWER_PERMISSIONS.LOG_MATCH, label: "Log Match", description: "Allow unlocked viewers to record new matches" },
      { key: VIEWER_PERMISSIONS.EDIT_MATCH, label: "Edit Match", description: "Allow editing scores/players of recorded matches" },
      { key: VIEWER_PERMISSIONS.DELETE_MATCH, label: "Delete Match", description: "Allow deleting matches" },
    ],
  },
  {
    title: "Session Permissions (Admin Only by Default)",
    items: [
      { key: VIEWER_PERMISSIONS.ADD_SESSION, label: "Add Session", description: "Allow creating and logging new badminton sessions" },
      { key: VIEWER_PERMISSIONS.EDIT_SESSION, label: "Edit Session", description: "Allow modifying session dates/locations/attendees" },
      { key: VIEWER_PERMISSIONS.DELETE_SESSION, label: "Delete Session", description: "Allow removing entire sessions" },
    ],
  },
  {
    title: "Stock & Inventory (Admin Only by Default)",
    items: [
      { key: VIEWER_PERMISSIONS.EDIT_STOCK, label: "Edit Stock", description: "Allow modifying shuttlecock tubes and quantities" },
      { key: VIEWER_PERMISSIONS.DELETE_STOCK, label: "Delete Stock", description: "Allow deleting purchase records" },
    ],
  },
  {
    title: "Payments & Financials (Admin Only by Default)",
    items: [
      { key: VIEWER_PERMISSIONS.EDIT_PAYMENT, label: "Edit Payment", description: "Allow modifying financial transaction records" },
      { key: VIEWER_PERMISSIONS.DELETE_PAYMENT, label: "Delete Payment", description: "Allow deleting payment ledger entries" },
    ],
  },
];

export function ViewerAccessModal({ isOpen, onClose }: ViewerAccessModalProps) {
  const { currentMode } = useAppRoute();
  const [activeTab, setActiveTab] = useState<"permissions" | "pin">("permissions");
  
  // Status state
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<ViewerPermission[]>([]);
  
  // PIN change state
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Permissions save state
  const [permLoading, setPermLoading] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [permSuccess, setPermSuccess] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const status = await getViewerPinStatus();
      setIsConfigured(status.configured);
      setSelectedPermissions(status.permissions);
    } catch {
      // Fallback
    } finally {
      setLoadingStatus(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const togglePermission = (key: ViewerPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
    setPermSuccess(false);
  };

  const handleSavePermissions = async () => {
    setPermLoading(true);
    setPermError(null);
    setPermSuccess(false);

    try {
      const res = await updateViewerPermissions(selectedPermissions, currentMode);
      if (!res.success) {
        setPermError(res.error || "Failed to update permissions");
        return;
      }
      setPermSuccess(true);
      setTimeout(() => setPermSuccess(false), 2500);
    } catch (err: unknown) {
      const e = err as Error;
      setPermError(e.message || "Failed to update permissions");
    } finally {
      setPermLoading(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      setPinError("PIN must be at least 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PIN entries do not match");
      return;
    }

    setPinLoading(true);
    setPinError(null);
    setPinSuccess(false);

    try {
      const res = await changeViewerPin(newPin, confirmPin, currentMode);
      if (!res.success) {
        setPinError(res.error || "Failed to save PIN");
        return;
      }
      setPinSuccess(true);
      setIsConfigured(true);
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => setPinSuccess(false), 2500);
    } catch (err: unknown) {
      const e = err as Error;
      setPinError(e.message || "Failed to save PIN");
    } finally {
      setPinLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Viewer Access Settings
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Configure PIN & Granular Unlock Permissions</span>
                <span className="text-slate-600">•</span>
                <span className={clsx("font-bold flex items-center gap-1", isConfigured ? "text-emerald-400" : "text-amber-400")}>
                  <span className={clsx("w-1.5 h-1.5 rounded-full", isConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
                  {isConfigured ? "PIN Configured" : "No PIN Set"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("permissions")}
            className={clsx(
              "flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "permissions"
                ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Unlock Permissions
          </button>
          <button
            onClick={() => setActiveTab("pin")}
            className={clsx(
              "flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "pin"
                ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Manage PIN
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {loadingStatus ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Loading settings...</span>
            </div>
          ) : activeTab === "permissions" ? (
            <div className="space-y-6">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-200 block">How this works:</span>
                When a viewer enters the correct PIN on <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">/view</code>, they temporarily gain access ONLY to the checked features below.
              </div>

              <div className="space-y-5">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-2.5">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                      {group.title}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {group.items.map((item) => {
                        const isChecked = selectedPermissions.includes(item.key);
                        return (
                          <div
                            key={item.key}
                            onClick={() => togglePermission(item.key)}
                            className={clsx(
                              "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                              isChecked
                                ? "bg-emerald-500/10 border-emerald-500/40 text-slate-100"
                                : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
                            )}
                          >
                            <div className="pt-0.5 text-emerald-400">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <div className={clsx("text-xs font-bold", isChecked ? "text-emerald-300" : "text-slate-300")}>
                                {item.label}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {permError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{permError}</span>
                </div>
              )}

              {permSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Permissions saved successfully!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-200 block">Security Notes:</span>
                • The Viewer PIN is securely hashed using bcrypt before storage.
                <br />
                • Plaintext PINs are never stored in the database or sent to client bundles.
                <br />
                • Viewers who unlock with this PIN receive a 60-minute signed session.
              </div>

              <form onSubmit={handleSavePin} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      {isConfigured ? "New Viewer PIN (4-8 digits)" : "Set Viewer PIN (4-8 digits)"}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        disabled={pinLoading}
                        value={newPin}
                        onChange={(e) => {
                          setNewPin(e.target.value);
                          if (pinError) setPinError(null);
                        }}
                        placeholder="Enter 4 to 8 digits"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-2xl px-4 py-3 text-sm font-mono tracking-widest text-emerald-400 placeholder:text-slate-700 outline-none transition-all disabled:opacity-50"
                      />
                      <KeyRound className="w-4 h-4 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Confirm PIN
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        disabled={pinLoading}
                        value={confirmPin}
                        onChange={(e) => {
                          setConfirmPin(e.target.value);
                          if (pinError) setPinError(null);
                        }}
                        placeholder="Re-enter same digits"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-2xl px-4 py-3 text-sm font-mono tracking-widest text-emerald-400 placeholder:text-slate-700 outline-none transition-all disabled:opacity-50"
                      />
                      <Lock className="w-4 h-4 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {pinError && (
                  <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {pinSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Viewer PIN updated and hashed successfully!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pinLoading || !newPin || !confirmPin}
                  className="w-full px-4 py-3 bg-emerald-400 hover:bg-emerald-300 active:scale-98 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-400/20 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {pinLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving PIN...
                    </>
                  ) : (
                    "Save & Hash Viewer PIN"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === "permissions" && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={permLoading}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 active:scale-98 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-400/20 disabled:opacity-50"
            >
              {permLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Permissions"
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
