"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export const useRequireAuth = (allowedRoles?: string[], redirectUrl: string = "/login") => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`${redirectUrl}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        router.push("/unauthorized"); // Default unauthorized route
      }
    }
  }, [user, loading, router, pathname, allowedRoles, redirectUrl]);

  return { user, loading };
};
