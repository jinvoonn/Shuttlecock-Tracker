"use client";

import { AuthProvider } from "@/context/AuthContext";
import { MatchesProvider } from "@/context/MatchesContext";

export function ClientProviders({ 
  children, 
  initialMatches 
}: { 
  children: React.ReactNode, 
  initialMatches: any[] 
}) {
  return (
    <AuthProvider>
      <MatchesProvider initialMatches={initialMatches}>
        {children}
      </MatchesProvider>
    </AuthProvider>
  );
}
