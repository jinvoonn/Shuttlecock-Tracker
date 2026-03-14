"use client";

import React from 'react';
import { 
  Activity, 
  LayoutGrid, 
  Sword, 
  Package, 
  Wallet, 
  User, 
  Bell, 
  Settings, 
  ChevronDown 
} from 'lucide-react';

export default function DesktopAddNewStock() {
  return (
    <div className="bg-[#f6f8f7] dark:bg-[#020617] font-['Lexend',_sans-serif] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-200 dark:border-[#1e293b] flex flex-col bg-white dark:bg-[#0f172a]">
          <div className="p-6 flex items-center gap-3">
            <Activity className="text-[#13ec80] size-8" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase">CockCount</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
              <LayoutGrid className="size-5" />
              <span className="text-sm font-medium uppercase tracking-tight">Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
              <Sword className="size-5" />
              <span className="text-sm font-medium uppercase tracking-tight">Sessions</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-[#13ec80]/10 text-[#13ec80] rounded border border-[#13ec80]/20">
              <Package className="size-5" />
              <span className="text-sm font-medium uppercase tracking-tight">Stock</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
              <Wallet className="size-5" />
              <span className="text-sm font-medium uppercase tracking-tight">Payments</span>
            </button>
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-[#1e293b]">
            <div className="flex items-center gap-3 px-2">
              <div className="size-8 rounded-full bg-[#13ec80]/20 flex items-center justify-center">
                <User className="text-[#13ec80] size-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Pro Admin</p>
                <p className="text-[10px] text-slate-500">Premium Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-[#020617]">
          {/* Top Header */}
          <header className="h-16 border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between px-8 bg-white dark:bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-10">
            <h2 className="font-black italic uppercase text-xl tracking-tighter">Inventory Management</h2>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-[#13ec80] transition-colors">
                <Bell className="size-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-[#13ec80] transition-colors">
                <Settings className="size-5" />
              </button>
            </div>
          </header>

          <div className="p-8 flex flex-col lg:flex-row gap-8">
            {/* Add Stock Form Section */}
            <section className="flex-1">
              <div className="mb-8">
                <h3 className="font-black italic uppercase text-3xl mb-2 text-slate-900 dark:text-white tracking-tighter">Add New Stock</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Register shuttlecock procurement for the current season.</p>
              </div>
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-6 rounded-xl shadow-sm">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Brand/Model */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Brand / Model</label>
                      <div className="relative">
                        <select className="w-full bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1e293b] rounded-lg p-4 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent outline-none appearance-none">
                          <option value="">Select Shuttlecock Model...</option>
                          <option value="yonex-as30">Yonex Aerosensa 30 (AS-30)</option>
                          <option value="yonex-as50">Yonex Aerosensa 50 (AS-50)</option>
                          <option value="victor-gold">Victor Gold Champion</option>
                          <option value="rsl-no1">RSL Classic Tourney No. 1</option>
                          <option value="li-ning-a300">Li-Ning A+ 300</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 size-5" />
                      </div>
                    </div>
                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Quantity of Tubes</label>
                      <div className="relative">
                        <input 
                          className="w-full font-mono bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1e293b] rounded-lg p-4 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent outline-none" 
                          placeholder="0" 
                          type="number" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 tracking-wider">TUBES</span>
                      </div>
                    </div>
                    {/* Initial Shuttles */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Shuttles per Tube</label>
                      <div className="relative">
                        <input 
                          className="w-full font-mono bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1e293b] rounded-lg p-4 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent outline-none" 
                          type="number" 
                          defaultValue="12" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 tracking-wider">COUNT</span>
                      </div>
                    </div>
                    {/* Price per Tube */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Price per Tube</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-slate-500">$</span>
                        <input 
                          className="w-full font-mono bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1e293b] rounded-lg p-4 pl-8 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#13ec80] focus:border-transparent outline-none" 
                          placeholder="0.00" 
                          type="text" 
                        />
                      </div>
                    </div>
                    {/* Total Cost (Auto-calc) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Investment</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#13ec80]">$</span>
                        <input 
                          className="w-full font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#1e293b] rounded-lg p-4 pl-8 text-[#13ec80] font-bold outline-none cursor-not-allowed" 
                          readOnly 
                          type="text" 
                          defaultValue="0.00" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200 dark:border-[#1e293b] flex justify-end gap-4">
                    <button className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" type="button">Discard</button>
                    <button className="px-10 py-3 bg-[#13ec80] text-black font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all rounded shadow-lg shadow-[#13ec80]/20" type="submit">
                      Confirm Purchase
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Recent Purchases Sidebar */}
            <aside className="w-full lg:w-80 space-y-8">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-black italic uppercase text-xl text-slate-900 dark:text-white tracking-tighter">History</h3>
                  <button className="text-[10px] font-black uppercase text-[#13ec80] tracking-widest border-b border-[#13ec80] hover:brightness-110">View All</button>
                </div>
                <div className="space-y-4">
                  {/* History Item 1 */}
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Oct 24, 2023</span>
                      <span className="font-mono text-xs text-[#13ec80]">+$480.00</span>
                    </div>
                    <h4 className="font-bold text-sm uppercase">Yonex AS-30</h4>
                    <p className="text-xs text-slate-500 mt-1">10 Tubes • $48.00/ea</p>
                  </div>
                  {/* History Item 2 */}
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-4 rounded-xl shadow-sm opacity-80">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Oct 12, 2023</span>
                      <span className="font-mono text-xs text-[#13ec80]">+$210.00</span>
                    </div>
                    <h4 className="font-bold text-sm uppercase">Victor Gold Champion</h4>
                    <p className="text-xs text-slate-500 mt-1">5 Tubes • $42.00/ea</p>
                  </div>
                  {/* History Item 3 */}
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] p-4 rounded-xl shadow-sm opacity-60">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Sep 28, 2023</span>
                      <span className="font-mono text-xs text-[#13ec80]">+$960.00</span>
                    </div>
                    <h4 className="font-bold text-sm uppercase">Yonex AS-50</h4>
                    <p className="text-xs text-slate-500 mt-1">15 Tubes • $64.00/ea</p>
                  </div>
                </div>
              </div>

              {/* Quick Summary Widget */}
              <div className="bg-[#13ec80]/10 border border-[#13ec80]/20 p-6 rounded-xl">
                <p className="text-[10px] font-black uppercase text-[#13ec80] tracking-widest mb-4">Stock Status</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-slate-400">Current Inventory</span>
                    <span className="font-mono text-2xl font-bold leading-none">42 <span className="text-[10px] text-slate-500">TUBES</span></span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#13ec80] h-full w-[65%]"></div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">Stock estimated to last 14 days based on usage</p>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
