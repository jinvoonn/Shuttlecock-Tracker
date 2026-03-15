"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_SECRET } from "@/lib/constants";

type Role = "admin" | "viewer";

interface AuthContextType {
    role: Role;
    isAdmin: boolean;
    loading: boolean;
    canEdit: (feature: 'sessions' | 'purchases' | 'payments' | 'players') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const role: Role = pathname.includes(`/${ADMIN_SECRET}`) ? "admin" : "viewer";
    const loading = false; // Derived synchronously now

    const isAdmin = role === "admin";

    const canEdit = (feature: 'sessions' | 'purchases' | 'payments' | 'players') => {
        if (isAdmin) return true;
        return false;
    };

    return (
        <AuthContext.Provider value={{ role, isAdmin, loading, canEdit }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useRole() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useRole must be used within an AuthProvider");
    }
    return context;
}
