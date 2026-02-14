import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { StreamPaymentModal } from "@/components/StreamPaymentModal";

/**
 * BAP Public Streaming Page
 * 
 * World-class listening experience where fans pay artists per stream.
 * Features immersive audio player, artist profile, real-time pricing, and Stripe payment.
 */
export default function Listen() {
  const { trackId } = useParams<{ trackId: string }>();
  const [, navigate] = useLocation();
  
  // Audio player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    // Check localStorage for existing session token
    return localStorage.getItem(`bap_session_${trackId}`);
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Check if user has valid session
  const { data: sessionCheck } = trpc.bap.payments.checkSession.useQuery(
    {
      trackId: parseInt(trackId || "0"),
      sessionToken: sessionToken || "",
    },
    {
      enabled: !!trackId && !!sessionToken,
      retry: false,
    }
  );
  
  // Update unlock status based on session check
  useEffect(() => {
    if (sessionCheck?.unlocked) {
      setIsUnlocked(true);
    } else if (sessionCheck && !sessionCheck.unlocked) {
      // Session expired or invalid, clear it
      localStorage.removeItem(`bap_session_${trackId}`);
      setSessionToken(null);
      setIsUnlocked(false);
    }
  }, [sessionCheck, trackId]);
  
  // Fetch track data
  const { data: track, isLoading, error } = trpc.bap.getTrack.useQuery(
    { trackId: parseInt(trackId || "0") },
    { enabled: !!trackId }
  );
  
  // Fetch artist profile
  const { data: artist } = trpc.bap.getArtistProfile.useQuery(
    { artistId: track?.artistId || 0 },
    { enabled: !!track?.artistId }
  );
  
  // Track play mutation
  const trackPlay = trpc.bap.trackPlay.useMutation({
    onSuccess: () => {
      toast.success("Stream recorded! Artist credited.");
    },
    onError: () => {
      toast.error("Failed to record stream");
    },
  });
  
  // Like track mutation
  const likeTrack = trpc.bap.social.likeTrack.useMutation({
    onSuccess: () => {
      toast.success("Added to your likes!");
    },
  });
  
  // Handle payment success
  const handlePaymentSuccess = (newSessionToken: string) => {
    setSessionToken(newSessionToken);
    setIsUnlocked(true);
    localStorage.setItem(`bap_session_${trackId}`, newSessionToken);
    toast.success("Payment successful! Enjoy your 24-hour access.");
    
    // Auto-play after payment
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 500);
  };
  
  // Audio player controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    // Check if user needs to pay first
    if (!isUnlocked && !isPlaying) {
      setShowPaymentModal(true);
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      if (!hasStartedPlaying) {
        setHasStartedPlaying(true);
        // Track play after 30 seconds or 50% completion
        setTimeout(() => {
          if (audioRef.current && !audioRef.current.paused) {
            trackPlay.mutate({
              trackId: parseInt(trackId || "0"),
              durationPlayed: Math.floor(audioRef.current.currentTime),
              completionRate: Math.floor((audioRef.current.currentTime / duration) * 100),
              source: "direct",
            });
          }
        }, 30000);
      }
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container max-w-4xl">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (error || !track) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md border-2 border-gray-200">
          <h2 className="text-2xl font-bold mb-2">Track Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This track doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }
  
  const priceInDollars = (track.pricePerStream / 100).toFixed(2);
  const artistShareAmount = ((track.pricePerStream * track.artistShare) / 10000).toFixed(2);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-gradient-to-b from-gray-50 to-white border-b-4 border-black overflow-hidden">
        {/* Background artwork (subtle) */}
        {track.artworkUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-5 blur-xl scale-110"
            style={{ backgroundImage: `url(${track.artworkUrl})` }}
          />
        )}
        
        <div className="relative container max-w-6xl py-16">
          <div className="grid md:grid-cols-[auto,1fr] gap-8 items-center w-full">
            {/* Artwork */}
            <div className="relative group">
              {track.artworkUrl ? (
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-none shadow-2xl object-cover border-4 border-black"
                />
              ) : (
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-none shadow-2xl bg-gray-900 flex items-center justify-center border-4 border-black">
                  <span className="text-white text-6xl font-bold">♪</span>
                </div>
              )}
              
              {/* Play button overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-white text-8xl font-bold">
                  {isPlaying ? "❚❚" : "▶"}
                </span>
              </button>
            </div>
            
            {/* Track info */}
            <div className="text-black">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-none">{track.title}</h1>
              <p className="text-3xl text-gray-600 mb-8 font-medium">{track.artist}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {track.genre && (
                  <span className="px-4 py-2 bg-black text-white rounded-none text-sm font-bold uppercase">
                    {track.genre}
                  </span>
                )}
                {track.mood && (
                  <span className="px-4 py-2 border-2 border-black rounded-none text-sm font-bold uppercase">
                    {track.mood}
                  </span>
                )}
                <span className="px-4 py-2 border-2 border-gray-300 rounded-none text-sm font-medium">
                  {formatTime(track.duration)}
                </span>
              </div>
              
              {/* Pricing */}
              <div className="bg-gray-100 rounded-none p-6 border-4 border-black">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-medium uppercase tracking-wide">Price per stream</p>
                    <p className="text-4xl font-bold">${priceInDollars}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Artist receives <span className="font-bold text-black">${artistShareAmount}</span> ({track.artistShare}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Controls */}
      <div className="sticky top-0 z-50 bg-white border-b-2 border-black shadow-lg">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center gap-6">
            {/* Play/Pause */}
            <Button
              size="lg"
              onClick={togglePlay}
              className="h-14 w-14 rounded-full bg-black hover:bg-gray-800"
            >
              <span className="text-white text-2xl">
                {isPlaying ? "❚❚" : "▶"}
              </span>
            </Button>
            
            {/* Progress bar */}
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span className="font-mono">{formatTime(currentTime)}</span>
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
              <div
                className="w-full h-3 bg-gray-200 rounded-none cursor-pointer border border-gray-300"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-black transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => likeTrack.mutate({ trackId: parseInt(trackId || "0") })}
                className="border-2 border-black rounded-none"
              >
                <span className="text-xl">♥</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleShare}
                className="border-2 border-black rounded-none"
              >
                <span className="text-xl">⤴</span>
              </Button>
              {!isUnlocked && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-black hover:bg-gray-800 text-white rounded-none font-bold"
                >
                  Unlock 24h Access
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container max-w-6xl py-12">
        <div className="grid md:grid-cols-[1fr,300px] gap-12">
          {/* Main content */}
          <div className="space-y-8">
            
            {/* Songwriter Splits */}
            {track.songwriterSplits && track.songwriterSplits.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-4">Songwriters</h2>
                <div className="bg-gray-50 p-6 rounded-none border-2 border-gray-200">
                  <div className="space-y-2">
                    {track.songwriterSplits.map((writer: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-medium">{writer.name}</span>
                        <span className="text-gray-600">{writer.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Artist profile */}
            {artist && (
              <Card className="p-6 border-2 border-gray-200 rounded-none">
                <h3 className="text-xl font-bold mb-4">Artist</h3>
                <div className="flex items-center gap-4 mb-4">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.stageName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-black"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center border-2 border-black">
                      <span className="text-white text-3xl font-bold">
                        {artist.stageName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{artist.stageName}</h4>
                    {artist.location && (
                      <p className="text-sm text-gray-600">{artist.location}</p>
                    )}
                  </div>
                </div>
                {artist.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{artist.bio}</p>
                )}
                <Button
                  variant="outline"
                  className="w-full border-2 border-black rounded-none font-bold"
                  onClick={() => navigate(`/artist/${artist.id}`)}
                >
                  View Profile
                </Button>
              </Card>
            )}
            
            {/* Track stats */}
            <Card className="p-6 border-2 border-gray-200 rounded-none">
              <h3 className="text-xl font-bold mb-4">Track Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Plays</span>
                  <span className="font-bold">{track.playCount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Likes</span>
                  <span className="font-bold">{track.likeCount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Released</span>
                  <span className="font-bold">
                    {track.releasedAt ? new Date(track.releasedAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </Card>
            
            {/* Share */}
            <Card className="p-6 border-2 border-gray-200 rounded-none">
              <h3 className="text-xl font-bold mb-4">Share</h3>
              <Button
                variant="outline"
                className="w-full border-2 border-black rounded-none font-bold"
                onClick={handleShare}
              >
                Copy Link
              </Button>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && track && (
        <StreamPaymentModal
          open={showPaymentModal}
          trackId={track.id}
          trackTitle={track.title}
          artistName={track.artist}
          artworkUrl={track.artworkUrl || ''}
          pricePerStream={track.pricePerStream || 100}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
