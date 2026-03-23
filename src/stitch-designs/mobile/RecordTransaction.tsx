"use client";

import { 
  X, 
  HelpCircle, 
  Delete, 
  LayoutGrid, 
  History as HistoryIcon, 
  Package, 
  Banknote,
  DollarSign,
  Feather
} from 'lucide-react';
import PlayerName from "@/components/ui/PlayerName";

import { useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { addPayment } from "@/lib/actions/payments";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  elo?: number;
}

interface MobileRecordTransactionProps {
  players: Player[];
  sessionId?: string;
}

export default function MobileRecordTransaction({ players, sessionId }: MobileRecordTransactionProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const currentMode = pathname.split('/')[1] || 'view';
  const basePath = `/${currentMode}`;
  const [amount, setAmount] = useState("0.00");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyPress = (val: string) => {
    if (val === '.') {
      if (!amount.includes('.')) setAmount(amount + '.');
      return;
    }
    
    const [int, dec] = amount.split('.');
    if (amount === "0.00" || amount === "0") {
      setAmount(val);
    } else if (dec && dec.length >= 2) {
      // Don't add more than 2 decimals
      return;
    } else {
      setAmount(amount + val);
    }
  };

  const handleDelete = () => {
    if (amount.length <= 1) {
      setAmount("0.00");
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleConfirm = async () => {
    if (!selectedPlayerId || parseFloat(amount) <= 0) {
      alert("Please select a player and enter an amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("date", new Date().toISOString().split('T')[0]);
      formData.append("player_id", selectedPlayerId);
      formData.append("amount", amount);
      formData.append("mode", currentMode);
      if (sessionId) formData.append("session_id", sessionId);

      await addPayment(formData);
      router.push(`${basePath}/payments`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to record payment. Ensure you are in admin mode.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="bg-slate-900 font-['Lexend',_sans-serif] text-slate-100 antialiased min-h-screen flex flex-col overflow-hidden">
      <div className="relative flex min-h-screen w-full flex-col max-w-[480px] mx-auto border-x border-slate-800 shadow-2xl">
        {/* Header */}
        <header className="sticky top-0 z-20 flex flex-col items-center justify-center px-6 py-5 bg-slate-900/80 backdrop-blur-md border-b border-sky-400/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Feather className="size-5 text-white transform rotate-45" />
            </div>
            <h1 className="text-2xl font-black text-slate-50 tracking-tighter">
              Cock<span className="text-sky-400">Count</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
             Because Shuttlecocks Aren't Free
          </p>
          <button onClick={() => router.back()} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors">
            <X className="size-5" />
          </button>
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto pb-32 pt-10 text-left">
          {/* Amount Display */}
          <div className="px-6 py-10 text-center flex flex-col items-center">
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase mb-4 italic">Enter Amount</span>
            <div className="font-['JetBrains_Mono',_monospace] text-7xl font-black tracking-tighter text-white flex items-center tabular-nums italic">
              <span className="text-emerald-400/40 mr-2 text-4xl not-italic">RM</span>
              <span>{amount}</span>
            </div>
          </div>

          {/* Quick Select Horizontal Scroll */}
          <div className="flex gap-4 overflow-x-auto px-6 pb-10 no-scrollbar">
            {players.length === 0 && <p className="text-slate-500 text-xs">No players found</p>}
            {players.map((player) => (
              <div 
                key={player.id} 
                className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
                onClick={() => setSelectedPlayerId(player.id)}
              >
                <div className={`size-16 rounded-3xl overflow-hidden border-2 transition-all group-hover:scale-110 flex items-center justify-center ${selectedPlayerId === player.id ? 'border-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.2)] bg-emerald-400/10' : 'border-slate-700 bg-slate-800'}`}>
                  {player.avatar ? (
                    <img className="w-full h-full object-cover" src={player.avatar} alt={player.name} />
                  ) : (
                    <span className="text-xl font-black italic text-slate-500 group-hover:text-emerald-400">{player.name[0]}</span>
                  )}
                </div>
                <div className="mt-1">
                  <PlayerName 
                    name={player.name.split(' ')[0]} 
                    elo={player.elo || 1200} 
                    showRankName={false} 
                    nameClassName={`text-[10px] font-black uppercase tracking-widest italic transition-colors ${selectedPlayerId === player.id ? 'text-emerald-400' : 'text-slate-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Numeric Keypad Section */}
          <div className="mt-auto bg-slate-900/60 backdrop-blur-xl rounded-t-[3rem] p-8 border-t border-slate-800/50 shadow-2xl">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
                <button 
                  key={num} 
                  onClick={() => handleKeyPress(num)}
                  className="h-20 flex items-center justify-center bg-slate-900/50 border border-slate-800/50 rounded-2xl text-2xl font-mono font-black text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={handleDelete}
                className="h-20 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 active:scale-95 transition-all"
              >
                <Delete className="size-7" />
              </button>
            </div>
            {/* Big Confirm Button */}
            <button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full py-6 font-black text-xl italic tracking-[0.2em] uppercase rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-all hover:brightness-110 border-b-4 ${isSubmitting ? 'bg-slate-700 text-slate-400 border-slate-800 cursor-not-allowed' : 'bg-emerald-400 text-slate-950 border-emerald-600'}`}
            >
              {isSubmitting ? 'Processing...' : 'CONFIRM TRANSACTION'}
            </button>
          </div>
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
          <div className="flex gap-4 h-24 items-stretch px-6 max-w-[480px] mx-auto">
            <button onClick={() => router.push(basePath)} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group">
              <LayoutGrid className="size-6 group-active:scale-90" />
              <p className="text-[9px] font-black uppercase tracking-widest italic leading-none mt-1">Dashboard</p>
            </button>
            <button onClick={() => router.push(`${basePath}/sessions`)} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group">
              <HistoryIcon className="size-6 group-active:scale-90" />
              <p className="text-[9px] font-black uppercase tracking-widest italic leading-none mt-1">Sessions</p>
            </button>
            <button onClick={() => router.push(`${basePath}/purchases`)} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors group">
              <Package className="size-6 group-active:scale-90" />
              <p className="text-[9px] font-black uppercase tracking-widest italic leading-none mt-1">Stock</p>
            </button>
            <button className="flex flex-1 flex-col items-center justify-center gap-1 text-emerald-400 relative">
              <Banknote className="size-7" />
              <p className="text-[9px] font-black uppercase tracking-widest italic leading-none mt-1">Payments</p>
              <div className="absolute bottom-3 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(19,236,128,0.8)]"></div>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
