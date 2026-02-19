import { useEffect, useRef, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Music, TrendingUp, Radio, Search, Heart, Share2, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Copy, Check } from "lucide-react";
import SoundwavePlayer from "@/components/SoundwavePlayer";

const GENRES = [
  "All", "Hip-Hop", "Pop", "Rock", "Electronic", "R&B", "Jazz",
  "Country", "Latin", "Indie", "Alternative"
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [copiedTrackId, setCopiedTrackId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getTrackUrl = (trackId: number) => {
    return `${window.location.origin}/track/${trackId}`;
  };

  const handleShare = (track: any, platform: string) => {
    const trackUrl = getTrackUrl(track.id);
    const text = `Check out "${track.title}" by ${track.artist} on Boptone`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(trackUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(trackUrl);
        setCopiedTrackId(track.id);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopiedTrackId(null), 2000);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Fetch tracks from BAP
  const { data: trendingTracks } = trpc.bap.discover.trending.useQuery({ 
    limit: 10
  });
  const { data: newReleases } = trpc.bap.discover.newReleases.useQuery({ 
    limit: 10
  });

  // Select random track for spotlight (rotates on page load)
  const spotlightTrack = useMemo(() => {
    const allTracks = [...(trendingTracks || []), ...(newReleases || [])];
    if (allTracks.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allTracks.length);
    return allTracks[randomIndex];
  }, [trendingTracks, newReleases]);
  // Rising artists feature not yet implemented
  const risingArtists: any[] = [];
  const { data: searchResults } = trpc.bap.discover.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const likeTrackMutation = trpc.bap.social.likeTrack.useMutation();
  const recordStreamMutation = trpc.bap.stream.record.useMutation();

  // Audio player effects
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Load new track
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    audioRef.current.src = currentTrack.audioUrl;
    audioRef.current.volume = volume / 100;
    
    if (isPlaying) {
      audioRef.current.play();
      // Record stream after 30 seconds of playback
      const streamTimer = setTimeout(() => {
        recordStreamMutation.mutate({ 
          trackId: currentTrack.id,
          durationPlayed: 30,
          source: "feed" as const
        });
      }, 30000);
      
      return () => clearTimeout(streamTimer);
    }
  }, [currentTrack, volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = (track: any) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleLikeTrack = async (trackId: number) => {
    try {
      await likeTrackMutation.mutateAsync({ trackId });
    } catch (error) {
      console.error("Failed to like track:", error);
    }
  };

  const TrackCard = ({ track }: { track: any }) => (
    <Card className="rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0 group">
            <img
              src={track.artworkUrl || `https://via.placeholder.com/96x96?text=${encodeURIComponent(track.title)}`}
              alt={track.title}
              className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200"
            />
            <Button 
              className="rounded-full absolute inset-0 m-auto w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black hover:bg-gray-800" 
              size="icon"
              onClick={() => handlePlayTrack(track)}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white ml-0.5" />
              )}
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-black truncate">{track.title}</h3>
            <p className="text-lg text-gray-600 font-medium truncate">{track.artist}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
              {track.genre && (
                <Badge className="rounded-full border-2 border-gray-200 bg-white text-black font-bold text-xs px-3 py-1 uppercase">
                  {track.genre}
                </Badge>
              )}
              <span className="font-mono">{formatTime(track.duration)}</span>
              {track.streamCount > 0 && (
                <span className="font-medium">
                  {track.streamCount.toLocaleString()} plays
                </span>
              )}
            </div>
          </div>
          <Button 
            className="rounded-full border-2 border-gray-200 hover:border-gray-400 px-6 py-2" 
            variant="outline"
            onClick={() => handleLikeTrack(track.id)}
          >
            <Heart className="h-4 w-4 mr-2" />
            <span className="text-sm font-bold">LIKE</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full border-2 border-gray-200 hover:border-gray-400 px-6 py-2" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                <span className="text-sm font-bold">SHARE</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare(track, 'twitter')}>
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(track, 'facebook')}>
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(track, 'copy')}>
                {copiedTrackId === track.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Content */}
          <div>
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6">
              Discover
              <br />
              New Music.
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Stream directly from artists. Every play supports creators through BopAudio.
            </p>
          </div>

          {/* Right: Stats Card */}
          <Card className="border-2 border-gray-200 hover:border-gray-400 transition-colors bg-white rounded-xl">
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Music className="h-7 w-7 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">Total Tracks</p>
                    <p className="text-3xl font-bold">{trendingTracks?.length || 0}+</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-7 w-7 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">Trending Now</p>
                    <p className="text-3xl font-bold">{trendingTracks?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Radio className="h-7 w-7 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">Live Streams</p>
                    <p className="text-3xl font-bold">24/7</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="border-2 border-gray-200 hover:border-gray-400 transition-colors bg-white mb-12 rounded-xl">
          <CardContent className="p-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tracks, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-2xl py-8 pl-16 pr-6 border-2 border-gray-200 rounded-xl font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {GENRES.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-full border-2 font-bold uppercase text-sm px-6 py-3 ${
                selectedGenre === genre
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-black hover:border-gray-400"
              }`}
            >
              {genre}
            </Button>
          ))}
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-6">Search Results</h2>
            {searchResults && searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((track: any) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <Card className="rounded-xl border-2 border-gray-200 bg-white">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No results found</h3>
                  <p className="text-gray-600 text-lg">Try a different search term</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Artist Spotlight with Soundwave Player */}
        {!searchQuery && spotlightTrack && (
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-6">Artist Spotlight</h2>
            <Card className="rounded-xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <SoundwavePlayer track={spotlightTrack} />
              </CardContent>
            </Card>
          </div>
        )}


      </div>

      {/* Music Player (Fixed Bottom) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-50 shadow-2xl">
          <div className="container mx-auto px-4 py-6">
            {/* Track Info & Controls */}
            <div className="flex items-center gap-6 mb-4">
              <img
                src={currentTrack.artworkUrl || `https://via.placeholder.com/80x80?text=${encodeURIComponent(currentTrack.title)}`}
                alt={currentTrack.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xl text-black truncate">{currentTrack.title}</h4>
                <p className="text-lg text-gray-600 font-medium truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-full border-2 border-gray-200 hover:border-gray-400" size="icon" variant="outline">
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button className="rounded-full border-2 border-gray-200 hover:border-gray-400" size="icon" variant="outline">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  className="rounded-full w-14 h-14 bg-black hover:bg-gray-800 border-2 border-gray-200" 
                  size="icon" 
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white ml-0.5" />
                  )}
                </Button>
                <Button className="rounded-full border-2 border-gray-200 hover:border-gray-400" size="icon" variant="outline">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button className="rounded-full border-2 border-gray-200 hover:border-gray-400" size="icon" variant="outline">
                  <Repeat className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-full border-2 border-gray-200 hover:border-gray-400 px-6 py-2" 
                  variant="outline"
                  onClick={() => handleLikeTrack(currentTrack.id)}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  <span className="text-sm font-bold">LIKE</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="rounded-full border-2 border-gray-200 hover:border-gray-400 px-6 py-2" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      <span className="text-sm font-bold">SHARE</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare(currentTrack, 'twitter')}>
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Share on Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(currentTrack, 'facebook')}>
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(currentTrack, 'copy')}>
                      {copiedTrackId === currentTrack.id ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-24 h-2"
                  />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-mono w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-3 bg-white border-2 border-gray-200 rounded-xl">
                    <div
                      className="h-full bg-black rounded-xl transition-all"
                      style={{ width: `${(currentTime / (duration || currentTrack.duration)) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || currentTrack.duration}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = parseInt(e.target.value);
                      setCurrentTime(newTime);
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                      }
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 font-mono w-12">
                {formatTime(duration || currentTrack.duration)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
