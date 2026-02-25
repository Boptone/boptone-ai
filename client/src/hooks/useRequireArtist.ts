import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

/**
 * useRequireArtist - Hook to enforce artist authentication on a page
 * 
 * Usage: Add `useRequireArtist()` at the top of any artist-only page component
 * 
 * Example:
 * ```tsx
 * export default function Dashboard() {
 *   useRequireArtist();
 *   // ... rest of component
 * }
 * ```
 */
export function useRequireArtist() {
  // DEVELOPMENT MODE: Auth checks disabled for unrestricted page viewing
  // TODO: Re-enable auth guards before production deployment
  
  const { user, loading, isAuthenticated } = useAuth();
  // const [, setLocation] = useLocation();

  // useEffect(() => {
  //   if (!loading) {
  //     // Redirect to login if not authenticated
  //     if (!isAuthenticated) {
  //       const currentPath = window.location.pathname;
  //       setLocation(`/login?redirect=${encodeURIComponent(currentPath)}`);
  //       return;
  //     }

  //     // Redirect non-artists to public music discovery page
  //     if (user && user.role !== "artist" && user.role !== "admin") {
  //       setLocation("/music");
  //       return;
  //     }
  //   }
  // }, [loading, isAuthenticated, user, setLocation]);

  return { user, loading, isAuthenticated };
}
