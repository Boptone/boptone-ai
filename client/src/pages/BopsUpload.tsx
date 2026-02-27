/**
 * BopsUpload Page
 *
 * Full-page wrapper for the Bops video upload flow.
 * Protected route — artist must be authenticated.
 * After successful upload, redirects to the artist's Bops feed.
 */
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import BopsVideoUpload from "@/components/BopsVideoUpload";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function BopsUpload() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { data: artistProfile, isLoading: profileLoading } = trpc.artistProfile.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Redirect to onboarding wizard if profile not complete
  useEffect(() => {
    if (!loading && !profileLoading && isAuthenticated) {
      const profile = artistProfile as { onboardingCompleted?: boolean } | null | undefined;
      if (!profile || !profile.onboardingCompleted) {
        navigate("/artist/setup");
      }
    }
  }, [loading, profileLoading, isAuthenticated, artistProfile, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/bops")}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to Bops"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm tracking-wide uppercase">Post a Bop</span>
      </header>

      {/* Upload form */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        <BopsVideoUpload
          onSuccess={(bopId) => {
            // Navigate to the newly created Bop
            navigate(`/bops/${bopId}`);
          }}
          onCancel={() => navigate("/bops")}
        />
      </main>
    </div>
  );
}
