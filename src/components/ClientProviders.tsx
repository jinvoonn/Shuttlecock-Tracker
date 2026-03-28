"use client";

import { AuthProvider } from "@/context/AuthContext";
import { MatchesProvider } from "@/context/MatchesContext";
import { LoadingProvider } from "@/context/LoadingContext";
import GlobalLoader from "@/components/ui/GlobalLoader";

export function ClientProviders({ 
  children, 
  initialMatches 
}: { 
  children: React.ReactNode, 
  initialMatches: any[] 
}) {
  return (
    <LoadingProvider>
      <AuthProvider>
        <MatchesProvider initialMatches={initialMatches}>
          {children}
        </MatchesProvider>
      </AuthProvider>
      <GlobalLoader />
    </LoadingProvider>
  );
}
