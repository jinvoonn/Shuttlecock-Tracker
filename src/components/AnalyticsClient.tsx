"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface TrendData {
  month: string;
  spending: number;
  usage: number;
}

interface AnalyticsClientProps {
  data: TrendData[];
  type: 'spending' | 'usage';
}

export function AnalyticsClient({ data, type }: AnalyticsClientProps) {
  const isSpending = type === 'spending';
  const color = isSpending ? '#10b981' : '#0ea5e9'; // Emerald or Sky

  return (
    <div className="w-full h-48 sm:h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {isSpending ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `RM${value}`}
              width={40}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
              itemStyle={{ color: '#f1f5f9', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
              labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 800, marginBottom: '4px' }}
              formatter={(value: any) => [`RM${(Number(value) || 0).toFixed(2)}`, 'Spending']}
            />
            <Area 
              type="monotone" 
              dataKey="spending" 
              stroke={color} 
              fillOpacity={1} 
              fill="url(#colorSpending)" 
              strokeWidth={3}
            />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              width={30}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
              itemStyle={{ color: '#f1f5f9', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
              labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 800, marginBottom: '4px' }}
              cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
            />
            <Bar 
              dataKey="usage" 
              fill={color} 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
