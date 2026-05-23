"use client";

import React, { useState } from 'react';
import { Swords, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import PlayerName from '@/components/ui/PlayerName';

interface MatchPlayer {
  id?: string;
  name: string;
  elo: number;
}

interface Match {
  id: string;
  date: string;
  isWin: boolean;
  isDraw: boolean;
  myScore: number;
  oppScore: number;
  ratingDelta?: number;
  partners: MatchPlayer[];
  opponents: MatchPlayer[];
}

interface MatchHistoryProps {
  matches: Match[];
}

export function MatchHistory({ matches }: MatchHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm italic">
        No matches recorded yet.
      </div>
    );
  }

  const displayedMatches = isExpanded ? matches : matches.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {displayedMatches.map((m) => (
          <div key={m.id} className="flex flex-col bg-slate-900 p-4 rounded-xl border border-slate-700/80 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                  <span className="text-[11px] font-black text-slate-300 font-mono">{new Date(m.date).getDate()}</span>
                  <span className="text-[8px] font-bold uppercase text-slate-600 leading-none">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    {m.isWin ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 uppercase italic border border-emerald-400/20">Win</span>
                    ) : m.isDraw ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 uppercase italic border border-slate-500/20">Draw</span>
                    ) : (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 uppercase italic border border-rose-500/20">Loss</span>
                    )}
                    {m.ratingDelta !== undefined && (
                      <span className={clsx(
                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase italic border font-mono",
                        m.ratingDelta > 0
                          ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                          : m.ratingDelta < 0
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      )}>
                        {m.ratingDelta > 0 ? `+${m.ratingDelta}` : m.ratingDelta === 0 ? "±0" : `${m.ratingDelta}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] tracking-tight">
                    <span className={clsx("font-bold", m.isWin ? "text-emerald-400" : "text-slate-300")}>{m.myScore}</span>
                    <span className="text-slate-600">-</span>
                    <span className={clsx("font-bold", !m.isWin && !m.isDraw ? "text-emerald-400" : "text-slate-300")}>{m.oppScore}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight space-y-1">
              <div className="flex items-center gap-1 uppercase tracking-tighter">
                <span>Partner:</span>
                <span className="text-slate-300">
                  {m.partners.length > 0 ? (
                    <div className="flex gap-2">
                      {m.partners.map((p, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && " + "}
                          <PlayerName name={p.name} elo={p.elo} showRankName={false} nameClassName="text-slate-300" />
                        </React.Fragment>
                      ))}
                    </div>
                  ) : "None"}
                </span>
              </div>
              <div className="flex items-center gap-1 uppercase tracking-tighter">
                <span>Opponents:</span>
                <div className="flex gap-2 text-slate-300">
                  {m.opponents.map((p, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && " + "}
                      <PlayerName name={p.name} elo={p.elo} showRankName={false} nameClassName="text-slate-300" />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black uppercase text-slate-400 hover:text-emerald-400 transition-all active:scale-[0.98] group"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </>
          ) : (
            <>
              Expand All ({matches.length}) <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
