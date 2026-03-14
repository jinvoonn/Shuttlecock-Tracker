"use client";

import React, { useState } from 'react';
import { 
  Banknote, 
  Search, 
  Calendar, 
  Activity, 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import { addPayment } from "@/lib/actions/payments";
import clsx from 'clsx';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface DesktopRecordTransactionProps {
  players: Player[];
  sessionId?: string;
}

export default function DesktopRecordTransaction({ players, sessionId }: DesktopRecordTransactionProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;

  const [amount, setAmount] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId || parseFloat(amount) <= 0 || !amount) {
      alert("Please select a player and enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("date", date);
      formData.append("player_id", selectedPlayerId);
      formData.append("amount", amount);
      if (sessionId) formData.append("session_id", sessionId);

      await addPayment(formData);
      router.push(`${basePath}/payments`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 font-['Lexend',_sans-serif]">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center"
        style={{ backgroundImage: "url('/badminton-bg.png')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#020617]/90 to-[#020617]/95 pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="relative z-20 w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-[#13ec80]">
            <div className="size-8 bg-[#13ec80]/10 rounded-lg flex items-center justify-center border border-[#13ec80]/20">
              <Activity className="size-5 font-bold" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter text-slate-100 uppercase">COCKCOUNT</h2>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href={`${basePath}`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <LayoutDashboard className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">DASHBOARD</span>
          </Link>
          <Link href={`${basePath}/sessions`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <CalendarDays className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">SESSIONS</span>
          </Link>
          <Link href={`${basePath}/purchases`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Package className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">STOCK</span>
          </Link>
          <Link href={`${basePath}/payments`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13ec80] text-slate-950 font-black transition-all shadow-lg shadow-[#13ec80]/10">
            <Wallet className="size-5" />
            <span className="text-sm tracking-wide uppercase">PAYMENTS</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 flex flex-col overflow-y-auto w-full">
        {/* Top Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6 w-1/3">
             <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4 group-focus-within:text-[#13ec80] transition-colors" />
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 text-sm focus:ring-1 focus:ring-[#13ec80] transition-all text-slate-200 h-10 outline-none shadow-inner cursor-not-allowed" 
                placeholder="Global Search disabled..." 
                type="text" 
                disabled
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-100 uppercase">Shuttle Tracker</p>
                <p className="text-[10px] text-[#13ec80] font-black uppercase tracking-tighter">{currentMode}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8 flex-1 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h3 className="font-black italic uppercase text-3xl mb-2 text-slate-100 tracking-tighter">Record Transaction</h3>
            <p className="text-slate-500 font-medium">Log a payment or deposit to a player's balance.</p>
          </div>
            
          <form className="bg-slate-900/60 border border-slate-800 p-8 rounded-xl shadow-sm" onSubmit={handleConfirm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="space-y-8 flex flex-col">
                {/* Transaction Date */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Transaction Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 pl-12 text-slate-100 focus:ring-1 focus:ring-[#13ec80] outline-none [color-scheme:dark]" 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                  </div>
                </div>

                {/* Amount Input */}
                <div className="flex-1 flex flex-col justify-end">
                  <label className="block text-xs font-black uppercase tracking-widest text-[#13ec80] mb-2 text-center">Amount (RM)</label>
                  <div className="relative flex items-center justify-center bg-slate-950 rounded-2xl border-2 border-slate-800 focus-within:border-[#13ec80]/50 transition-colors p-6">
                    <span className="text-5xl font-black text-[#13ec80]/50 mr-2 italic">$</span>
                    <input 
                      className="bg-transparent outline-none text-6xl font-black text-[#13ec80] w-[200px] text-center placeholder-[#13ec80]/20 tabular-nums italic"
                      placeholder="0.00" 
                      step="0.01" 
                      min="0"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Player Selection */}
              <div className="flex flex-col h-[400px]">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Select Player</label>
                <div className="relative mb-4 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-[#13ec80] outline-none rounded-lg py-4 pl-12 pr-4 text-sm font-medium text-slate-100 placeholder:text-slate-600 shadow-sm transition-all" 
                    placeholder="Search player name..." 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                {/* Player Grid */}
                <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                  {filteredPlayers.length === 0 && (
                    <div className="col-span-2 text-center py-10 text-slate-500 font-bold">No players found.</div>
                  )}
                  {filteredPlayers.map(player => (
                    <button 
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={clsx(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        selectedPlayerId === player.id 
                          ? "bg-[#13ec80]/10 border-[#13ec80] shadow-[0_0_15px_rgba(19,236,128,0.15)]" 
                          : "bg-slate-950 border-slate-800 hover:border-[#13ec80]/50"
                      )}
                    >
                      <div className={clsx(
                        "size-10 shrink-0 rounded-full flex items-center justify-center text-xs font-black uppercase overflow-hidden",
                        selectedPlayerId === player.id ? "bg-[#13ec80] text-[#020617]" : "bg-slate-800 text-slate-400"
                      )}>
                        {player.name.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          "text-sm font-bold truncate",
                          selectedPlayerId === player.id ? "text-slate-100" : "text-slate-300"
                        )}>{player.name}</p>
                      </div>
                      {selectedPlayerId === player.id && (
                        <CheckCircle2 className="size-4 text-[#13ec80] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
              
            <div className="pt-8 border-t border-slate-800 flex justify-end gap-4 mt-8">
              <button 
                onClick={() => router.push(`${basePath}/payments`)}
                className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-100 transition-colors" 
                type="button"
              >
                Cancel
              </button>
              <button 
                className="px-10 py-3 bg-[#13ec80] text-[#020617] font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all rounded shadow-lg shadow-[#13ec80]/20 disabled:opacity-50 flex items-center gap-2" 
                type="submit"
                disabled={isSubmitting}
              >
                <Banknote className="size-4" />
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #13ec80;
        }
      `}</style>
    </div>
  );
}
