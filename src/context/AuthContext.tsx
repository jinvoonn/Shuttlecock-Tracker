"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_SECRET, ViewerPermission, VIEWER_PERMISSIONS } from "@/lib/constants";
import { getViewerUnlockState, lockViewerSession } from "@/lib/actions/viewerPin";

type Role = "admin" | "viewer";

interface AuthContextType {
    role: Role;
    isAdmin: boolean;
    loading: boolean;
    viewerUnlocked: boolean;
    viewerPermissions: ViewerPermission[];
    lockViewer: () => Promise<void>;
    refreshViewerState: () => Promise<void>;
    canPerform: (permission: ViewerPermission) => boolean;
    canEdit: (feature: 'sessions' | 'purchases' | 'payments' | 'players') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const role: Role = pathname.includes(`/${ADMIN_SECRET}`) ? "admin" : "viewer";
    const isAdmin = role === "admin";
    const [viewerUnlocked, setViewerUnlocked] = useState(false);
    const [viewerPermissions, setViewerPermissions] = useState<ViewerPermission[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshViewerState = useCallback(async () => {
        if (isAdmin) {
            setViewerUnlocked(false);
            setViewerPermissions([]);
            setLoading(false);
            return;
        }

        try {
            const state = await getViewerUnlockState();
            setViewerUnlocked(state.unlocked);
            setViewerPermissions(state.permissions);
        } catch {
            setViewerUnlocked(false);
            setViewerPermissions([]);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        refreshViewerState();
    }, [refreshViewerState, pathname]);

    const lockViewer = async () => {
        await lockViewerSession();
        setViewerUnlocked(false);
        setViewerPermissions([]);
    };

    const canPerform = (permission: ViewerPermission): boolean => {
        if (isAdmin) return true;
        if (!viewerUnlocked) return false;
        return viewerPermissions.includes(permission);
    };

    const canEdit = (feature: 'sessions' | 'purchases' | 'payments' | 'players') => {
        if (isAdmin) return true;
        if (feature === 'sessions' && viewerUnlocked && (viewerPermissions.includes(VIEWER_PERMISSIONS.EDIT_SESSION) || viewerPermissions.includes(VIEWER_PERMISSIONS.ADD_SESSION))) {
            return true;
        }
        if (feature === 'purchases' && viewerUnlocked && viewerPermissions.includes(VIEWER_PERMISSIONS.EDIT_STOCK)) {
            return true;
        }
        if (feature === 'payments' && viewerUnlocked && viewerPermissions.includes(VIEWER_PERMISSIONS.EDIT_PAYMENT)) {
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider
            value={{
                role,
                isAdmin,
                loading,
                viewerUnlocked,
                viewerPermissions,
                lockViewer,
                refreshViewerState,
                canPerform,
                canEdit,
            }}
        >
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
