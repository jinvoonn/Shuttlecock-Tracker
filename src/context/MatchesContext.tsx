"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MatchesContextType {
  matches: any[];
  addOptimisticMatch: (match: any) => void;
  setMatches: (matches: any[]) => void;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export function MatchesProvider({ children, initialMatches }: { children: React.ReactNode, initialMatches: any[] }) {
  const [matches, setMatchesState] = useState(initialMatches);

  const addOptimisticMatch = useCallback((newMatch: any) => {
    setMatchesState(prev => {
      const matchWithTime = { 
        ...newMatch, 
        id: `temp-${Date.now()}`, 
        created_at: new Date().toISOString(),
        played_at: newMatch.played_at || new Date().toISOString()
      };
      const next = [...prev, matchWithTime];
      // Keep optimistic matches sorted for consistent UI
      return next.sort((a, b) => 
        new Date(a.played_at || a.created_at).getTime() - 
        new Date(b.played_at || b.created_at).getTime()
      );
    });
  }, []);

  const setMatches = useCallback((newMatches: any[]) => {
    setMatchesState(newMatches);
  }, []);

  // Initial fetch
  useEffect(() => {
    async function fetchMatches() {
      if (initialMatches && initialMatches.length > 0) return;
      
      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('played_at', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (data) setMatchesState(data);
    }
    
    fetchMatches();
  }, [initialMatches]);

  // Sync with Supabase Realtime globally
  useEffect(() => {
    const channel = supabase
      .channel('global-matches-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMatchesState(prev => {
              // Remove optimistic match if exists (based on some logic or just filter out temp ids)
              const nonTemp = prev.filter(m => !m.id.toString().startsWith('temp-'));
              // Check if already exists
              if (nonTemp.some(m => m.id === payload.new.id)) return prev;
              return [...nonTemp, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setMatchesState(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          } else if (payload.eventType === 'DELETE') {
            setMatchesState(prev => prev.filter(m => m.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <MatchesContext.Provider value={{ matches, addOptimisticMatch, setMatches }}>
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
}
