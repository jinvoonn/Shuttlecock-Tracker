"use client";

import React from 'react';
import { Feather, Trophy } from 'lucide-react';
import clsx from 'clsx';

export default function MockupPage() {
    return (
        <div className="min-h-screen bg-[#020617] p-10 flex flex-col items-center gap-12 font-['Lexend'] text-slate-100 italic">
            <div className="text-center">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 italic">Story Card: Podium Concepts</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">9:16 Ratio - Session Top Performers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl">
                {/* OPTION A: CLASSIC PODIUM */}
                <StoryPodiumA 
                    top3={[
                        { name: "SARAH", value: 8, wr: 85, matches: 10, rank: 1 },
                        { name: "DAVE", value: 6, wr: 72, matches: 9, rank: 2 },
                        { name: "JIN VOON", value: 5, wr: 65, matches: 8, rank: 3 }
                    ]}
                />

                {/* OPTION B: CARD STACK */}
                <StoryPodiumB 
                    top3={[
                        { name: "SARAH", value: 8, wr: 85, matches: 10, rank: 1 },
                        { name: "DAVE", value: 6, wr: 72, matches: 9, rank: 2 },
                        { name: "JIN VOON", value: 5, wr: 65, matches: 8, rank: 3 }
                    ]}
                />

                {/* OPTION C: MINIMAL PREMIUM */}
                <StoryPodiumC 
                    top3={[
                        { name: "SARAH", value: 8, wr: 85, matches: 10, rank: 1 },
                        { name: "DAVE", value: 6, wr: 72, matches: 9, rank: 2 },
                        { name: "JIN VOON", value: 5, wr: 65, matches: 8, rank: 3 }
                    ]}
                />
            </div>
        </div>
    );
}

function StoryPodiumA({ top3 }: any) {
    return (
        <div className="w-[360px] h-[640px] bg-[#020617] relative overflow-hidden flex flex-col p-8 text-white border border-white/5 shadow-2xl">
             <div className="text-center mt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">Session</p>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter italic font-black">Podium 🏆</h2>
            </div>

            <div className="flex-1 flex flex-col justify-end pb-12">
                <div className="flex items-end justify-center gap-2">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-center mb-2">
                            <p className="text-[10px] font-black italic text-slate-300">🥈 {top3[1].name}</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{top3[1].value} Wins</p>
                        </div>
                        <div className="w-20 h-28 bg-slate-800 rounded-t-2xl border-x border-t border-slate-700 flex flex-col items-center justify-center relative shadow-lg">
                            <span className="text-2xl font-black text-slate-400">2</span>
                        </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-center mb-2 overflow-visible relative">
                             <div className="absolute -inset-4 bg-emerald-500/10 blur-xl rounded-full"></div>
                            <p className="text-xs font-black italic text-emerald-400 relative">🥇 {top3[0].name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest relative">{top3[0].value} Wins</p>
                        </div>
                        <div className="w-24 h-40 bg-emerald-500/10 rounded-t-2xl border-x border-t border-emerald-400 flex flex-col items-center justify-start pt-6 shadow-[0_0_30px_rgba(52,211,153,0.15)] relative animate-pulse-subtle">
                             <Trophy className="size-6 text-emerald-400 mb-2" />
                            <span className="text-3xl font-black text-emerald-400">1</span>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-center mb-2">
                            <p className="text-[10px] font-black italic text-orange-400">🥉 {top3[2].name}</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{top3[2].value} Wins</p>
                        </div>
                        <div className="w-20 h-20 bg-slate-800/50 rounded-t-2xl border-x border-t border-slate-700 flex flex-col items-center justify-center relative shadow-lg">
                            <span className="text-2xl font-black text-orange-900">3</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end pb-4 border-t border-white/5 pt-6 opacity-30">
                <span className="text-[8px] font-black uppercase tracking-widest">Season 1 Recap</span>
                <span className="text-[8px] font-black uppercase tracking-widest italic">Cockcount</span>
            </div>
            
            <style jsx>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                .animate-pulse-subtle { animation: pulse-subtle 3s infinite ease-in-out; }
            `}</style>
        </div>
    );
}

function StoryPodiumB({ top3 }: any) {
    return (
        <div className="w-[360px] h-[640px] bg-[#020617] relative overflow-hidden flex flex-col p-8 text-white border border-white/5 shadow-2xl">
             <div className="flex flex-col mb-12 mt-6">
                <h2 className="text-4xl font-black italic uppercase italic tracking-tighter leading-none italic">Top<br/><span className="text-emerald-400">Players</span></h2>
                <div className="h-1 w-12 bg-emerald-500 mt-4 rounded-full"></div>
            </div>

            <div className="flex flex-col gap-6 font-black italic">
                {top3.map((p: any, i: number) => (
                    <div key={i} className={clsx(
                        "p-5 rounded-2xl border flex items-center gap-4 relative overflow-hidden group",
                        i === 0 ? "bg-emerald-500/10 border-emerald-400/30" : "bg-slate-800/50 border-white/5"
                    )}>
                        <div className={clsx(
                            "size-10 rounded-xl flex items-center justify-center font-black italic text-lg",
                            i === 0 ? "bg-emerald-400 text-slate-950" : i === 1 ? "bg-slate-300 text-slate-950" : "bg-orange-400 text-slate-950"
                        )}>
                            {i + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black italic tracking-tight italic uppercase">{p.name}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{p.wr}% Win Rate</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black italic text-slate-100 italic leading-none">{p.value}</p>
                            <p className="text-[8px] font-black text-slate-500 uppercase italic">WINS</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto flex justify-center opacity-20 italic">
                 <span className="text-[8px] font-black uppercase tracking-[0.5em] italic">Official Stats // Cockcount</span>
            </div>
        </div>
    );
}

function StoryPodiumC({ top3 }: any) {
    return (
        <div className="w-[360px] h-[640px] bg-[#020617] relative overflow-hidden flex flex-col p-10 text-white border border-white/5 shadow-2xl">
            <div className="mt-12 mb-12">
                 <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-600 mb-4 font-black italic">Final Standings</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-64 font-black italic text-emerald-400 italic" style={{ fontSize: '4rem' }}>01</span>
                    <span className="text-2xl font-black italic uppercase tracking-tighter italic text-slate-100">{top3[0].name}</span>
                 </div>
                 <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest italic">{top3[0].value} Wins — {top3[0].wr}% WR</p>
            </div>

            <div className="space-y-10 border-l border-white/10 pl-8 ml-2 mt-8">
                 <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black italic text-slate-300 italic">02</span>
                        <span className="text-xl font-black italic uppercase tracking-tighter italic text-slate-300">{top3[1].name}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{top3[1].value} Wins</p>
                 </div>
                 <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black italic text-orange-900 italic">03</span>
                        <span className="text-xl font-black italic uppercase tracking-tighter italic text-slate-400">{top3[2].name}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{top3[2].value} Wins</p>
                 </div>
            </div>

            <div className="text-center mt-24">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 italic">Strava-Inspired Podium Models</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Activity-Focused // Instagram Story Ready</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl pb-40">
                {/* OPTION D: THE STRAVA CLASSIC (BRIGHT) */}
                <StravaPodium variant="light" 
                    sessionName="Thursday Night Smash"
                    date="MAR 29, 2026 • 2:30 HOURS"
                    top3={[
                        { name: "SARAH", value: 8, wr: 85, rank: 1, type: "MVP" },
                        { name: "DAVE", value: 6, wr: 72, rank: 2 },
                        { name: "JIN VOON", value: 5, wr: 65, rank: 3 }
                    ]}
                />

                {/* OPTION E: THE STRAVA DARK (PREMIUM) */}
                <StravaPodium variant="dark" 
                    sessionName="Night Ops Session"
                    date="MAR 29, 2026 • 3:00 HOURS"
                    top3={[
                        { name: "SARAH", value: 9, wr: 92, rank: 1, type: "MVP" },
                        { name: "DAVE", value: 7, wr: 78, rank: 2 },
                        { name: "JIN VOON", value: 4, wr: 60, rank: 3 }
                    ]}
                />
            </div>
        </div>
    );
}

function StravaPodium({ variant, sessionName, date, top3 }: any) {
    const isDark = variant === 'dark';
    const stravaOrange = "#FC4C02";

    return (
        <div className={clsx(
            "w-[360px] h-[640px] relative overflow-hidden flex flex-col font-['Lexend'] shadow-2xl border",
            isDark ? "bg-[#0A0A0A] border-white/5 text-white" : "bg-[#F7F7F7] border-black/5 text-slate-900"
        )}>
            {/* Strava Header Style */}
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-[#FC4C02] flex items-center justify-center">
                            <Feather className="size-4 text-white" />
                        </div>
                        <span className="font-black italic tracking-tight text-sm">COCKCOUNT</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{date}</span>
                </div>
                <h2 className="text-3xl font-black uppercase mb-1 leading-none">{sessionName}</h2>
                <div className="h-1 w-12 rounded-full mt-3" style={{ backgroundColor: stravaOrange }}></div>
            </div>

            {/* Main Stats (The Strava "Grid") */}
            <div className="flex-1 px-8 py-6 flex flex-col">
                <div className="grid grid-cols-2 gap-y-12 mb-12">
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 font-black italic">Session MVP</p>
                        <p className={clsx("text-2xl font-black italic tracking-tighter uppercase italic", isDark ? "text-white" : "text-black")}>{top3[0].name}</p>
                        <div className="flex items-center gap-2 mt-1">
                             <Trophy className="size-3" style={{ color: stravaOrange }} />
                             <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: stravaOrange }}>Gold Achievement</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 font-black italic">Wins</p>
                        <p className={clsx("text-4xl font-black italic tracking-tighter grayscale-0", isDark ? "text-white" : "text-black")}>{top3[0].value}</p>
                    </div>
                </div>

                {/* The "Leaderboard" Section */}
                <div className="space-y-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 italic">Segment Podium</p>
                    {top3.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-black italic text-[#FC4C02] w-4 italic">{i+1}</span>
                                <div>
                                    <p className="text-sm font-black italic uppercase tracking-tight italic">{p.name}</p>
                                    <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest italic">{p.wr}% Win Rate</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-lg font-black italic italic leading-none">{p.value}</span>
                                <span className="text-[8px] font-extrabold text-slate-500 uppercase italic">Wins</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Branding (Strava App Style) */}
            <div className={clsx(
                "p-8 mt-auto flex items-center justify-between border-t",
                isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
            )}>
                <div className="flex flex-col">
                    <span className="text-xs font-black italic tracking-tighter uppercase italic">CockCount Story</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic">Analytical Badminton</span>
                </div>
                <div className="flex gap-1">
                    <div className="size-1 rounded-full" style={{ backgroundColor: stravaOrange }}></div>
                    <div className="size-1 rounded-full bg-slate-500"></div>
                    <div className="size-1 rounded-full bg-slate-500"></div>
                </div>
            </div>

            {/* Subtle Gradient Glow for Dark Mode */}
            {isDark && <div className="absolute -bottom-20 -right-20 size-80 bg-[#FC4C02]/10 blur-[100px] rounded-full"></div>}
        </div>
    );
}
