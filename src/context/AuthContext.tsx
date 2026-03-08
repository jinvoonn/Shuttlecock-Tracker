"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type Role = "admin" | "viewer";

interface AuthContextType {
    role: Role;
    setRole: (role: Role) => void;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRoleState] = useState<Role>("admin"); // Default to admin for now
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Try to get role from localStorage (for simple toggling)
        const savedRole = localStorage.getItem("shuttle_role") as Role;
        if (savedRole) {
            setRoleState(savedRole);
        }

        // 2. In a real app, you would fetch the role from Supabase profiles table here
        // const fetchRole = async () => {
        //     const { data: { user } } = await supabase.auth.getUser();
        //     if (user) {
        //         const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        //         if (data) setRoleState(data.role);
        //     }
        //     setLoading(false);
        // };
        // fetchRole();

        setLoading(false);
    }, []);

    const setRole = (newRole: Role) => {
        setRoleState(newRole);
        localStorage.setItem("shuttle_role", newRole);
    };

    const isAdmin = role === "admin";

    return (
        <AuthContext.Provider value={{ role, setRole, isAdmin, loading }}>
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
