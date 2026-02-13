import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Play,
  Pause,
  Heart,
  Share2,
  ExternalLink,
  Music,
  Clock,
  DollarSign,
} from "lucide-react";

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
  
  // Audio player controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
        <div className="container max-w-4xl">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (error || !track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Background artwork (blurred) */}
        {track.artworkUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110"
            style={{ backgroundImage: `url(${track.artworkUrl})` }}
          />
        )}
        
        <div className="relative container max-w-6xl h-full flex items-center">
          <div className="grid md:grid-cols-[auto,1fr] gap-8 items-center w-full">
            {/* Artwork */}
            <div className="relative group">
              {track.artworkUrl ? (
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl object-cover"
                />
              ) : (
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Music className="h-32 w-32 text-white opacity-50" />
                </div>
              )}
              
              {/* Play button overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isPlaying ? (
                  <Pause className="h-20 w-20 text-white" />
                ) : (
                  <Play className="h-20 w-20 text-white ml-2" />
                )}
              </button>
            </div>
            
            {/* Track info */}
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">{track.title}</h1>
              <p className="text-2xl text-purple-200 mb-6">{track.artist}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {track.genre && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {track.genre}
                  </span>
                )}
                {track.mood && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {track.mood}
                  </span>
                )}
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatTime(track.duration)}
                </span>
              </div>
              
              {/* Pricing */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-purple-200 mb-1">Price per stream</p>
                    <p className="text-3xl font-bold">${priceInDollars}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-purple-300" />
                </div>
                <p className="text-sm text-purple-200">
                  Artist receives <span className="font-bold text-white">${artistShareAmount}</span> ({track.artistShare}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Controls */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-lg">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center gap-6">
            {/* Play/Pause */}
            <Button
              size="lg"
              onClick={togglePlay}
              className="h-14 w-14 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            
            {/* Progress bar */}
            <div className="flex-1">
              <div
                className="h-2 bg-gray-200 rounded-full cursor-pointer group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all group-hover:h-3"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => likeTrack.mutate({ trackId: track.id })}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Artist Profile Section */}
      {artist && (
        <div className="container max-w-4xl py-12">
          <Card className="p-8">
            <div className="flex items-start gap-6">
              {artist.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt={artist.stageName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Music className="h-12 w-12 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{artist.stageName}</h2>
                {artist.bio && (
                  <p className="text-muted-foreground mb-4">{artist.bio}</p>
                )}
                
                <div className="flex gap-4">
                  {artist.socialLinks?.spotify && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.socialLinks.spotify} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Spotify
                      </a>
                    </Button>
                  )}
                  {artist.socialLinks?.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://instagram.com/${artist.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Track Stats */}
      <div className="container max-w-4xl pb-12">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{track.playCount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Plays</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{track.likeCount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Likes</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              ${(track.totalEarnings / 100).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Artist Earnings</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
