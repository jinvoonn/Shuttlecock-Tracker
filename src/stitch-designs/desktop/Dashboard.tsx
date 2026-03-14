```javascript
"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Package, 
  Wallet, 
  Search, 
  Bell, 
  Settings, 
  TrendingUp, 
  MoreHorizontal, 
  Star, 
  UserPlus, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import clsx from 'clsx';

export default function DesktopDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 font-['Lexend',_sans-serif]">
      {/* Cinematic Background Overlay */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBmKyghpvdGfzXKwlUqevvImQ_7FFzfSkTca8LJONOe5bTRNaSwoxGyMCoDfI_Un8M85kd7_Lra8e8Y5MgQRUKgnH1vGQ-USBl2gmVqml3r0HL7P-2eFLX5ZHF1SlwnnaeGr305eegXV4Dv-rhOnJPIgqgTA9JXWk-EeB5XtSwIgAWRyQFDQeUgLmjjy7NYHqlvy3y2oLpqW3FqkHz2kECKdDNGdCQAyNqbEQ-Rk37s4bAjK5pYuSk-zMU0msv8xIoGpNspUA0Ezml')" 
        }}
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#13ec80] text-slate-950 font-black transition-all shadow-lg shadow-[#13ec80]/10">
            <LayoutDashboard className="size-5" />
            <span className="text-sm tracking-wide uppercase">DASHBOARD</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <CalendarDays className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">SESSIONS</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Package className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">STOCK</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Wallet className="size-5" />
            <span className="text-sm font-bold tracking-wide uppercase">PAYMENTS</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-2xl border border-slate-800">
            <div className="size-10 rounded-full bg-[#13ec80]/10 flex items-center justify-center text-[#13ec80] border border-[#13ec80]/30 shadow-inner">
              <Star className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Pro Admin</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Elite Status</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-6 w-1/3">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4 group-focus-within:text-[#13ec80] transition-colors" />
              <input 
                className="w-full bg-slate-950 border-slate-800 rounded-xl pl-10 text-sm focus:ring-1 focus:ring-[#13ec80] focus:border-[#13ec80] transition-all text-slate-200 h-10 outline-none shadow-inner" 
                placeholder="Search sessions or players..." 
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#13ec80] transition-all hover:scale-105 active:scale-95 shadow-lg">
              <Bell className="size-5" />
            </button>
            <button className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#13ec80] transition-all hover:scale-105 active:scale-95 shadow-lg">
              <Settings className="size-5" />
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-100">Marcus Court</p>
                <p className="text-[10px] text-[#13ec80] font-black uppercase tracking-tighter">Court 4 Manager</p>
              </div>
              <div className="size-10 rounded-xl border border-[#13ec80]/50 overflow-hidden shadow-lg shadow-[#13ec80]/10">
                <img 
                  className="size-full object-cover" 
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" 
                  alt="Admin Profile"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Shuttle Used</p>
              <p className="text-4xl font-mono font-black text-slate-100 tracking-tighter">842</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-black bg-emerald-400/10 w-fit px-2 py-1 rounded-lg border border-emerald-400/20">
                <TrendingUp className="size-3" /> +12% vs last month
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarDays className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Sessions</p>
              <p className="text-4xl font-mono font-black text-slate-100 tracking-tighter">42</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-[#13ec80] font-black bg-[#13ec80]/10 w-fit px-2 py-1 rounded-lg border border-[#13ec80]/20">
                ACTIVE SEASON
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Pool Balance</p>
              <p className="text-4xl font-mono font-black text-emerald-400 tracking-tighter">$452.00</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 font-black bg-slate-950 w-fit px-2 py-1 rounded-lg border border-slate-800">
                LOCKED FOR OCTOBER
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-[#13ec80]/30 transition-all">
              <div className="absolute -top-4 -right-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                <Package className="size-full" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Inventory</p>
              <p className="text-xl font-mono font-black text-slate-100 leading-tight tracking-tighter">
                14 Tubes<br/>
                <span className="text-sm text-slate-500 font-medium tracking-normal">// 168 Shuttles</span>
              </p>
              <div className="mt-4 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-[#13ec80] h-full w-[65%] shadow-[0_0_10px_#13ec8055]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured Session & Player Ledger */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Card */}
              <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 group h-72 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/70 to-transparent z-10" />
                <img 
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-80 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1626225967045-2c366ff407f3?auto=format&fit=crop&q=80&w=1200" 
                  alt="Badminton court"
                />
                <div className="relative z-20 p-12 flex flex-col h-full justify-center max-w-md">
                  <span className="text-[#13ec80] font-black text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13ec80] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#13ec80]" />
                    </span>
                    Next Session
                  </span>
                  <h3 className="text-5xl font-black italic text-white mb-2 uppercase tracking-tighter leading-none">Saturday Open</h3>
                  <p className="text-slate-400 text-lg mb-8 font-bold tracking-tight">October 12, 2024 • 10:00 AM</p>
                  <div className="flex gap-4">
                    <button className="bg-[#13ec80] text-slate-950 font-black text-xs uppercase px-10 py-4 rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-lg shadow-[#13ec80]/20">
                      View Details
                    </button>
                    <button className="bg-white/5 backdrop-blur-md text-white border border-white/10 font-black text-xs uppercase px-10 py-4 rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                      Invite
                    </button>
                  </div>
                </div>
              </section>

              {/* Player Ledger Section */}
              <section className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Player Ledger</h3>
                  <button className="text-[10px] font-black text-[#13ec80] flex items-center gap-2 hover:underline tracking-[0.2em]">
                    EXPORT REPORT <TrendingUp className="size-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-800">
                        <th className="px-8 py-4">Player</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Balance</th>
                        <th className="px-8 py-4">Activity</th>
                        <th className="px-8 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {[
                        { name: "Marcus Chen", initial: "MC", status: "Paid", color: "emerald", balance: "+$124.50", time: "2d ago" },
                        { name: "Sarah Jenkins", initial: "SJ", status: "Overdue", color: "rose", balance: "-$32.00", time: "Overdue 4d" },
                        { name: "David V. Miller", initial: "DM", status: "Paid", color: "emerald", balance: "+$15.00", time: "Today" },
                        { name: "Elena Rodriguez", initial: "ER", status: "Balanced", color: "slate", balance: "$0.00", time: "1w ago" },
                      ].map((player, i) => (
                        <tr key={i} className="hover:bg-slate-950/50 transition-colors group/row">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 border border-slate-700 group-hover/row:border-[#13ec80]/30 transition-all">
                                {player.initial}
                              </div>
                              <span className="font-black text-slate-100 text-sm">{player.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={clsx(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              player.color === 'emerald' && "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
                              player.color === 'rose' && "bg-rose-400/10 text-rose-400 border-rose-400/20",
                              player.color === 'slate' && "bg-slate-800 text-slate-500 border-slate-700"
                            )}>
                              {player.status}
                            </span>
                          </td>
                          <td className={clsx(
                            "px-8 py-6 font-mono font-black text-sm tracking-tighter",
                            player.color === 'emerald' && "text-emerald-400",
                            player.color === 'rose' && "text-rose-400",
                            player.color === 'slate' && "text-slate-500",
                          )}>{player.balance}</td>
                          <td className="px-8 py-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">{player.time}</td>
                          <td className="px-8 py-6 text-right">
                            <button className="text-slate-600 hover:text-white transition-colors">
                              <MoreHorizontal className="size-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Activity Feed/Sidebar */}
            <aside className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-xs font-black italic uppercase tracking-[0.2em] text-[#13ec80] mb-8">Elite Activity</h3>
                <div className="space-y-8">
                  <div className="flex gap-4 group/activity cursor-pointer">
                    <div className="relative shrink-0">
                      <div className="size-12 rounded-2xl overflow-hidden border border-slate-700 group-hover/activity:border-[#13ec80]/50 transition-all">
                        <img 
                          className="size-full object-cover grayscale group-hover/activity:grayscale-0 transition-all" 
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" 
                          alt="Elite Player"
                        />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 size-5 bg-[#13ec80] rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
                        <Star className="size-3 text-slate-950 font-bold" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-100 group-hover/activity:text-[#13ec80] transition-colors leading-tight">
                        Jordan Wu <span className="text-slate-500 font-medium">reached</span> Platinum level
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">2h ago • Promotion</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group/activity cursor-pointer">
                    <div className="size-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700 group-hover/activity:text-[#13ec80] transition-all">
                      <UserPlus className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-100 leading-tight">
                        New Group: <span className="text-white">Central Smashers</span>
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">5h ago • 12 Players</p>
                    </div>
                  </div>

                  <div className="flex gap-4 group/activity cursor-pointer">
                    <div className="size-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[#13ec80]/30 group-hover/activity:text-[#13ec80] transition-all">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-100 leading-tight">Bulk Purchase Verified</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Yesterday • 20 Tubes</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-10 py-5 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-800 hover:text-white transition-all tracking-[0.2em] shadow-inner">
                  View Full Activity
                </button>
              </div>

              {/* System Health / Quick Stats Mini */}
              <div className="bg-[#13ec80]/5 border border-[#13ec80]/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#13ec80]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#13ec80]">Performance Metrics</span>
                    <Activity className="text-[#13ec80] size-4 animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Data Sync</span>
                        <span className="text-[#13ec80]">99.9%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                        <div className="bg-[#13ec80] h-full w-[99.9%] shadow-[0_0_8px_#13ec8044]" />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Court Usage</span>
                        <span className="text-white">78% Capacity</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 shadow-inner mt-2">
                        <div className="bg-sky-400 h-full w-[78%] shadow-[0_0_8px_#38bdf844]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
