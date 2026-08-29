"use client";

import { usePathname } from "next/navigation";
import { ADMIN_SECRET } from "@/lib/constants";

export interface AppRouteInfo {
  pathname: string;
  currentMode: string;
  basePath: string;
  isAdmin: boolean;
  getRoute: (subPath?: string) => string;
}

/**
 * Centralized hook for URL mode and route resolution.
 * Prevents hardcoding `/${currentMode}` or string split mistakes throughout components.
 */
export function useAppRoute(): AppRouteInfo {
  const pathname = usePathname() || "";
  const segments = pathname.split("/").filter(Boolean);
  const currentMode = segments[0] || "view";
  const basePath = `/${currentMode}`;
  const isAdmin = currentMode === ADMIN_SECRET;

  const getRoute = (subPath: string = "") => {
    const cleanSubPath = subPath.startsWith("/") ? subPath.slice(1) : subPath;
    if (!cleanSubPath) return basePath;
    return `${basePath}/${cleanSubPath}`;
  };

  return {
    pathname,
    currentMode,
    basePath,
    isAdmin,
    getRoute
  };
}
