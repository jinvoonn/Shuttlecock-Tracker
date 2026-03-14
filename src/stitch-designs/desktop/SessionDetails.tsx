import React from 'react';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Plus, 
  Share2, 
  Edit3, 
  Users, 
  Package, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DesktopSessionDetails() {
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-['Lexend',_sans-serif] min-h-screen pb-24">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#f6f8f7]/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#1e293b] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-[#13ec80] size-8" />
            <h1 className="text-xl font-black tracking-tighter italic uppercase">CockCount</h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] hover:border-[#13ec80] transition-colors">
              <Share2 className="size-5" />
            </button>
            <button className="p-2 rounded-lg bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] hover:border-[#13ec80] transition-colors">
              <Edit3 className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Session Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-block px-2 py-1 bg-[#13ec80]/20 text-[#13ec80] text-xs font-bold rounded mb-2 tracking-widest uppercase">Live Session</span>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight text-slate-900 dark:text-slate-100">Elite Training Drills</h2>
            <div className="flex items-center gap-4 mt-2 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span className="text-sm font-medium">OCT 24, 2023</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4" />
                <span className="text-sm font-medium">18:00 - 20:00</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-[#13ec80] hover:bg-[#13ec80]/90 text-[#020617] px-6 py-3 rounded font-bold text-sm uppercase transition-all flex items-center gap-2">
              <Plus className="size-5" />
              Record Match
            </button>
          </div>
        </section>

        {/* Key Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="size-12" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Total Shuttles Used</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 italic">14</span>
              <span className="text-[#34d399] text-xs font-bold">+2% avg</span>
            </div>
          </div>
          <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plus className="size-12" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Cost per Person</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 italic">€4.50</span>
              <span className="text-[#34d399] text-xs font-bold">-€0.50</span>
            </div>
          </div>
          <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-6 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Edit3 className="size-12" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Total Net</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 italic">€63.00</span>
              <span className="text-slate-400 text-xs font-bold">Stable</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Participants & Shuttles */}
          <div className="lg:col-span-1 space-y-8">
            {/* Participants Section */}
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight mb-4 flex items-center gap-2">
                <Users className="text-[#13ec80] size-6" />
                Participants
              </h3>
              <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] rounded-lg divide-y divide-slate-300 dark:divide-[#1e293b] overflow-hidden">
                {/* Attendee 1 */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#13ec80]/20 flex items-center justify-center text-[#13ec80] font-bold text-xs">MA</div>
                    <div>
                      <p className="text-sm font-bold">Marcus Aurelius</p>
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Paid • Cash</p>
                    </div>
                  </div>
                  <span className="font-black italic text-[#34d399]">€4.50</span>
                </div>
                {/* Attendee 2 */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">JS</div>
                    <div>
                      <p className="text-sm font-bold text-slate-400 line-through">John Smith</p>
                      <p className="text-[10px] uppercase text-orange-400 font-bold">Pending • App</p>
                    </div>
                  </div>
                  <span className="font-black italic text-slate-400">€4.50</span>
                </div>
                {/* Attendee 3 */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#13ec80]/20 flex items-center justify-center text-[#13ec80] font-bold text-xs">LW</div>
                    <div>
                      <p className="text-sm font-bold">Lin Wei</p>
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Paid • App</p>
                    </div>
                  </div>
                  <span className="font-black italic text-[#34d399]">€4.50</span>
                </div>
              </div>
            </div>

            {/* Shuttle Usage Section */}
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight mb-4 flex items-center gap-2">
                <Package className="text-[#13ec80] size-6" />
                Shuttle Usage
              </h3>
              <div className="space-y-3">
                <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-black italic">Yonex AS-30</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Grade A Feather</p>
                    </div>
                    <span className="bg-slate-300 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-100 uppercase">8 USED</span>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#13ec80] h-full" style={{ width: '66.6%' }}></div>
                  </div>
                </div>
                <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-black italic">Victor Gold No.1</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Training Grade</p>
                    </div>
                    <span className="bg-slate-300 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-100 uppercase">6 USED</span>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#13ec80] h-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Matches Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                <Trophy className="text-[#13ec80] size-6" />
                Recent Matches
              </h3>
              <button className="text-xs font-bold text-[#13ec80] hover:underline uppercase tracking-widest">View History</button>
            </div>
            <div className="space-y-4">
              {/* Match Card 1 */}
              <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-300 dark:border-[#1e293b] bg-slate-300/30 dark:bg-slate-800/30 flex justify-between items-center">
                  <span className="text-[10px] font-black italic uppercase tracking-widest text-slate-500">Men's Doubles • Final Set</span>
                  <span className="text-[10px] font-bold text-[#34d399] flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> COMPLETED
                  </span>
                </div>
                <div className="p-6 grid grid-cols-7 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <p className="text-sm font-black italic">Marcus / Lin</p>
                    <p className="text-[10px] text-slate-500 font-bold">TEAM A</p>
                  </div>
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="bg-[#13ec80] text-[#020617] px-2 py-1 font-black italic text-lg rounded leading-tight">21</div>
                    <div className="h-4 w-[1px] bg-slate-400/30 my-1"></div>
                    <div className="text-slate-500 px-2 py-1 font-black italic text-lg rounded leading-tight">18</div>
                  </div>
                  <div className="col-span-3 text-left">
                    <p className="text-sm font-black italic">John / Hiroshi</p>
                    <p className="text-[10px] text-slate-500 font-bold">TEAM B</p>
                  </div>
                </div>
              </div>
              {/* Match Card 2 */}
              <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] rounded-xl overflow-hidden opacity-80">
                <div className="p-4 border-b border-slate-300 dark:border-[#1e293b] bg-slate-300/30 dark:bg-slate-800/30 flex justify-between items-center">
                  <span className="text-[10px] font-black italic uppercase tracking-widest text-slate-500">Mixed Doubles • Set 2</span>
                  <span className="text-[10px] font-bold text-[#34d399] flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> COMPLETED
                  </span>
                </div>
                <div className="p-6 grid grid-cols-7 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <p className="text-sm font-black italic">Sarah / Alex</p>
                    <p className="text-[10px] text-slate-500 font-bold">TEAM A</p>
                  </div>
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="text-slate-500 px-2 py-1 font-black italic text-lg rounded leading-tight">15</div>
                    <div className="h-4 w-[1px] bg-slate-400/30 my-1"></div>
                    <div className="bg-[#13ec80] text-[#020617] px-2 py-1 font-black italic text-lg rounded leading-tight">21</div>
                  </div>
                  <div className="col-span-3 text-left">
                    <p className="text-sm font-black italic">Lin / Maria</p>
                    <p className="text-[10px] text-slate-500 font-bold">TEAM B</p>
                  </div>
                </div>
              </div>
              {/* Match Card 3 */}
              <div className="bg-slate-200 dark:bg-[#0f172a] border border-slate-300 dark:border-[#1e293b] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-300 dark:border-[#1e293b] bg-slate-300/30 dark:bg-slate-800/30 flex justify-between items-center">
                  <span className="text-[10px] font-black italic uppercase tracking-widest text-slate-500">Singles • Training</span>
                  <span className="text-[10px] font-bold text-[#13ec80] animate-pulse flex items-center gap-1">
                    <AlertCircle className="size-3 fill-current" /> IN PROGRESS
                  </span>
                </div>
                <div className="p-6 grid grid-cols-7 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <p className="text-sm font-black italic">Hiroshi</p>
                    <p className="text-[10px] text-slate-500 font-bold">TEAM A</p>
                  </div>
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="text-slate-100 px-2 py-1 font-black italic text-lg rounded leading-tight">11</div>
                    <div className="h-4 w-[1px] bg-slate-400/30 my-1"></div>
                    <div className="text-slate-100 px-2 py-1 font-black italic text-lg rounded leading-tight">09</div>
                  </div>
                  <div className="col-span-3 text-left">
                    <p className="text-sm font-black italic">Alex</p>
                    <p className="text-[10px] text-slate-500 font-bold">TEAM B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#f6f8f7] dark:bg-[#020617] border-t border-slate-200 dark:border-[#1e293b] px-6 py-4 z-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <a className="flex flex-col items-center gap-1 group" href="#">
            <Plus className="text-slate-500 group-hover:text-[#13ec80] transition-colors" />
            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 group-hover:text-[#13ec80] transition-colors">Dashboard</span>
          </a>
          <a className="flex flex-col items-center gap-1 group" href="#">
            <Calendar className="text-[#13ec80]" />
            <span className="text-[10px] font-black italic uppercase tracking-tighter text-[#13ec80]">Sessions</span>
          </a>
          <a className="flex flex-col items-center gap-1 group" href="#">
            <Package className="text-slate-500 group-hover:text-[#13ec80] transition-colors" />
            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 group-hover:text-[#13ec80] transition-colors">Stock</span>
          </a>
          <a className="flex flex-col items-center gap-1 group" href="#">
            <Clock className="text-slate-500 group-hover:text-[#13ec80] transition-colors" />
            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 group-hover:text-[#13ec80] transition-colors">Payments</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
