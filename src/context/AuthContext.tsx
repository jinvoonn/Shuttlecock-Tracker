"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

type Role = "admin" | "viewer";

interface AuthContextType {
    role: Role;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [role, setRole] = useState<Role>("viewer");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pathname.startsWith("/admin")) {
            setRole("admin");
        } else {
            setRole("viewer");
        }
        setLoading(false);
    }, [pathname]);

    const isAdmin = role === "admin";

    return (
        <AuthContext.Provider value={{ role, isAdmin, loading }}>
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
