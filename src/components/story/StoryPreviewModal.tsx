"use client";

import React, { useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import { StoryCard } from './StoryCard';
import { toPng } from 'html-to-image';
import clsx from 'clsx';

interface Match {
  status: string;
  scoreA: number;
  scoreB: number;
  teamAPlayers?: { id: string; name: string }[];
  teamBPlayers?: { id: string; name: string }[];
}

interface StoryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    name: string;
    location: string;
    date: string;
    shuttlesUsed: number;
  };
  matches: Match[];
  sessionStats: {
    mostWins: { id: string; name: string; value: number }[];
  };
}

export function StoryPreviewModal({ isOpen, onClose, session, matches, sessionStats }: StoryPreviewModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);

  if (!isOpen) return null;

  // 1. Calculate MVP (Top Winner)
  const mvp = sessionStats.mostWins.length > 0 
    ? { name: sessionStats.mostWins[0].name, wins: sessionStats.mostWins[0].value }
    : undefined;

  // 2. Calculate Longest Win Streak
  const streaks: Record<string, number> = {};
  const currentStreaks: Record<string, number> = {};
  
  // 3. Calculate Most Cursed (Most Losses)
  const losses: Record<string, number> = {};

  const completedMatches = matches.filter(m => m.status === 'Completed');
  completedMatches.forEach(m => {
    const teamAWon = m.scoreA > m.scoreB;
    const teamBWon = m.scoreB > m.scoreA;

    const aNames = m.teamAPlayers?.map(p => p.name) || [];
    const bNames = m.teamBPlayers?.map(p => p.name) || [];

    const winners = teamAWon ? aNames : teamBWon ? bNames : [];
    const losers = teamAWon ? bNames : teamBWon ? aNames : [];

    winners.forEach(name => {
      currentStreaks[name] = (currentStreaks[name] || 0) + 1;
      if (currentStreaks[name] > (streaks[name] || 0)) {
        streaks[name] = currentStreaks[name];
      }
    });

    losers.forEach(name => {
      currentStreaks[name] = 0; // break streak
      losses[name] = (losses[name] || 0) + 1;
    });
  });

  let maxStreak = 0;
  let streakName = "";
  Object.entries(streaks).forEach(([name, count]) => {
    if (count > maxStreak) { maxStreak = count; streakName = name; }
  });

  let maxLosses = 0;
  let cursedName = "";
  Object.entries(losses).forEach(([name, count]) => {
    if (count > maxLosses) { maxLosses = count; cursedName = name; }
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      // toPng converts the literal DOM node, guaranteeing exactly what you see
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        quality: 1.0,
      });
      const link = document.createElement('a');
      link.download = `CockCount-${session.name.replace(/\s+/g, '-')}-Story.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export story', err);
      alert('Failed to export story. Tell dev to check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute top-6 right-6">
        <button onClick={onClose} className="p-3 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-800">
          <X className="size-6" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-4">
        {/* We use scale property specifically to fit smaller mobile screens without compromising the actual 1080x1920 ratio geometry the html-to-canvas engine sees */}
        <div className={`shadow-2xl shadow-[#13ec80]/10 rounded-3xl overflow-hidden border ${isTransparent ? 'border-dashed border-slate-600 bg-black/20 backdrop-blur-sm' : 'border-slate-800 bg-[#020617]'}  scale-[0.80] sm:scale-100 origin-center transition-all`}>
          <StoryCard 
            ref={cardRef} 
            sessionName={session.name}
            location={session.location}
            date={session.date}
            shuttlesUsed={session.shuttlesUsed}
            mvp={mvp}
            streak={maxStreak >= 2 ? { name: streakName, streak: maxStreak } : undefined}
            cursed={maxLosses >= 2 ? { name: cursedName, losses: maxLosses } : undefined}
            isTransparent={isTransparent}
          />
        </div>

        <div className="flex w-full max-w-[320px] gap-2 font-['Lexend',_sans-serif]">
            <button
              onClick={() => setIsTransparent(!isTransparent)}
              className={clsx(
                "flex-shrink-0 font-bold uppercase tracking-widest px-4 rounded-xl flex flex-col items-center justify-center transition-all shadow-md active:scale-95 border",
                isTransparent 
                  ? "bg-sky-500/20 text-sky-400 border-sky-400/50" 
                  : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
              )}
            >
              <span className="text-[10px] leading-none mb-1">Sticker</span>
              <span className="text-xs font-black">{isTransparent ? 'ON' : 'OFF'}</span>
            </button>
            <button 
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 bg-[#13ec80] hover:bg-[#10c86e] text-slate-950 font-black italic uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-[#13ec80]/20 disabled:opacity-50"
            >
              {isExporting ? (
                'EXPORTING...'
              ) : (
                <>
                  <Download className="size-5" />
                  DOWNLOAD
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
}
