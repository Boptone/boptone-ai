import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireArtist?: boolean; // If true, requires user to be an artist (not just authenticated)
}

/**
 * ProtectedRoute component - wraps routes that require authentication
 * 
 * @param children - The component to render if authenticated
 * @param requireArtist - If true, requires user role to be 'artist' or 'admin'
 */
export function ProtectedRoute({ children, requireArtist = false }: ProtectedRouteProps) {
  // DEVELOPMENT MODE: Auth checks disabled for unrestricted page viewing
  // TODO: Re-enable auth guards before production deployment
  
  // const { user, loading, isAuthenticated } = useAuth();
  // const [, setLocation] = useLocation();

  // useEffect(() => {
  //   if (!loading) {
  //     // Redirect to login if not authenticated
  //     if (!isAuthenticated) {
  //       setLocation("/login?redirect=" + encodeURIComponent(window.location.pathname));
  //       return;
  //     }

  //     // If artist role is required, check user role
  //     if (requireArtist && user && user.role !== "artist" && user.role !== "admin") {
  //       // Redirect non-artists to public music discovery page
  //       setLocation("/music");
  //       return;
  //     }
  //   }
  // }, [loading, isAuthenticated, user, requireArtist, setLocation]);

  // // Show loading state while checking authentication
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center space-y-4">
  //         <Loader2 className="inline-block h-12 w-12 animate-spin text-[#008B8B]" />
  //         <p className="text-gray-600 font-medium">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // // Don't render anything if not authenticated (redirect will happen)
  // if (!isAuthenticated) {
  //   return null;
  // }

  // // Don't render if artist role is required but user doesn't have it
  // if (requireArtist && user && user.role !== "artist" && user.role !== "admin") {
  //   return null;
  // }

  // Render the protected component (no auth checks in development)
  return <>{children}</>;
}
