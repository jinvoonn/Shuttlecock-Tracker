"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

export function useRouteLoading() {
  const pathname = usePathname();
  const { setLoading } = useLoading();

  useEffect(() => {
    // Turn off loading whenever the path changes
    setLoading(false);
  }, [pathname, setLoading]);

  return {
    startLoading: () => {
      // Small delay prevents flicker on instant loads
      setTimeout(() => setLoading(true), 100);
    },
  };
}
