import React from 'react';
import { 
  Activity,
  LayoutDashboard,
  CalendarDays,
  Package,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Feather
} from 'lucide-react';

export default function SessionListUI() {
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 shadow-lg shadow-sky-500/20">
                <Feather className="size-5 transform text-white rotate-45" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-slate-100">
                Cock<span className="text-sky-400">Count</span>
              </h2>
            </div>
            <p className="pl-1 text-[9px] font-bold uppercase leading-tight tracking-widest text-slate-500">
              Because Shuttlecocks Aren't Free
            </p>
          </div>
        </div>

        <nav className="mt-4 flex flex-1 flex-col space-y-2 px-4">
          <div className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
            <LayoutDashboard className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wide">DASHBOARD</span>
          </div>
          <div className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-[#13ec80] px-4 py-3 font-black text-slate-950 shadow-lg shadow-[#13ec80]/10 transition-all">
            <CalendarDays className="size-5" />
            <span className="text-sm uppercase tracking-wide">SESSIONS</span>
          </div>
          <div className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
            <Package className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wide">STOCK</span>
          </div>
          <div className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
            <Wallet className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wide">PAYMENTS</span>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-20 flex w-full flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-8 px-8 py-8 md:py-12">
          {/* Hero Title & Actions */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 text-left">
              <h2 className="text-5xl font-black italic uppercase leading-none tracking-tighter text-slate-100">
                Sessions History
              </h2>
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
                Active matches & shuttle tracking
              </p>
            </div>
            <button className="flex items-center gap-2 rounded border border-[#13ec80] bg-[#13ec80] px-6 py-3 text-xs font-black uppercase tracking-tighter text-[#020617] shadow-lg shadow-[#13ec80]/20 transition-all hover:brightness-110">
              <Plus className="size-4" /> Log New
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {/* Example Card 1: Completed */}
            <div className="group block cursor-pointer">
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition-all hover:border-[#13ec80]/50">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-tight text-slate-500">
                      3/22/2026 • Setia Alam
                    </span>
                    <h3 className="mt-1 text-2xl font-black italic uppercase tracking-tight text-slate-100 transition-colors group-hover:text-[#13ec80]">
                      Session 0A1B
                    </h3>
                  </div>
                  <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-800/80 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Shuttle Used</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <Activity className="size-4 text-[#13ec80]" />
                      RSL Classic (12)
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Cost / Person</span>
                    <div className="font-mono text-lg font-black text-slate-100">
                      RM25.50
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex -space-x-2.5">
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] font-black uppercase text-slate-400">JA</div>
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] font-black uppercase text-slate-400">MI</div>
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] font-black uppercase text-slate-400">KE</div>
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] font-black uppercase text-slate-400">SA</div>
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-700 text-[10px] font-black text-slate-300">+2</div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Net</span>
                    <span className="font-mono text-2xl font-black leading-none text-emerald-400">
                      +RM15.00
                    </span>
                    <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                        <Pencil className="size-4" />
                      </button>
                      <button className="rounded p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Card 2: Outstanding */}
            <div className="group block cursor-pointer">
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition-all hover:border-[#13ec80]/50">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-tight text-slate-500">
                      3/20/2026 • Petaling Jaya
                    </span>
                    <h3 className="mt-1 text-2xl font-black italic uppercase tracking-tight text-slate-100 transition-colors group-hover:text-[#13ec80]">
                      Session 9F2C
                    </h3>
                  </div>
                  <span className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-400">
                    Outstanding
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-800/80 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Shuttle Used</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <Activity className="size-4 text-[#13ec80]" />
                      Yonex AS-40 (8)
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Cost / Person</span>
                    <div className="font-mono text-lg font-black text-slate-100">
                      RM18.20
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex -space-x-2.5">
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] font-black uppercase text-slate-400">AL</div>
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0f172a] bg-slate-800 text-[10px] font-black uppercase text-slate-400">BE</div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Net</span>
                    <span className="font-mono text-2xl font-black leading-none text-rose-400">
                      -RM36.40
                    </span>
                    <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                        <Pencil className="size-4" />
                      </button>
                      <button className="rounded p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-center pt-4">
            <button className="rounded-xl border border-emerald-400/20 px-6 py-2 text-sm font-bold uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-400/5 hover:underline">
              Expand All (12)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
