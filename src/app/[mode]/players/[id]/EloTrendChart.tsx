"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

export type EloHistoryEntry = {
  date: string;
  elo: number;
};

interface EloTrendChartProps {
  data: EloHistoryEntry[];
}

export default function EloTrendChart({ data }: EloTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 italic bg-slate-900/50 rounded-2xl border border-slate-800">
        <Target className="w-8 h-8 opacity-20 mb-2" />
        <p className="font-bold text-sm uppercase tracking-widest">No Match Data</p>
      </div>
    );
  }

  // Round formatting for tooltip and dots
  const formattedData = data.map(entry => ({
    ...entry,
    elo: Math.round(entry.elo),
    displayDate: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }));

  const startElo = formattedData[0]?.elo || 1200;
  const endElo = formattedData[formattedData.length - 1]?.elo || 1200;
  const isUp = endElo >= startElo;

  return (
    <div className="h-64 w-full relative group">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorElo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#64748b" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ color: isUp ? '#10b981' : '#f43f5e', fontWeight: 900 }}
            labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}
            cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line 
            type="monotone" 
            dataKey="elo" 
            stroke={isUp ? "#10b981" : "#f43f5e"} 
            strokeWidth={3}
            dot={{ r: 3, fill: '#0f172a', strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Absolute Header Overlay */}
      <div className="absolute top-0 right-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 bg-slate-900 rounded-full px-3 py-1 border border-slate-700 shadow-md">
          {isUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span className={`text-[10px] font-black uppercase tracking-widest ${isUp ? 'text-emerald-400' : 'text-rose-500'}`}>
            {endElo - startElo > 0 ? "+" : ""}{endElo - startElo} Points
          </span>
        </div>
      </div>
    </div>
  );
}
