import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Music, 
  Search,
  TrendingUp,
  Clock,
  Users,
  Volume2,
  Repeat,
  Shuffle,
  Share2,
  Copy,
  Check,
  Sparkles,
  Radio
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

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
    <Card className="rounded-3xl border-4 border-gray-300 shadow-xl hover:scale-[1.02] hover:border-indigo-500 transition-all bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={track.artworkUrl || `https://via.placeholder.com/96x96?text=${encodeURIComponent(track.title)}`}
              alt={track.title}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
            />
            <Button 
              className="rounded-full absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
              size="icon"
              onClick={() => handlePlayTrack(track)}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-900 truncate">{track.title}</h3>
            <p className="text-lg text-gray-600 font-bold truncate">{track.artist}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
              {track.genre && (
                <Badge className="rounded-full border-2 border-gray-200 bg-gray-100 text-gray-700 font-semibold text-xs px-3 py-1">
                  {track.genre}
                </Badge>
              )}
              <span className="font-bold">{formatTime(track.duration)}</span>
              {track.streamCount > 0 && (
                <span className="flex items-center gap-1 font-bold">
                  <Users className="h-4 w-4" />
                  {track.streamCount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Button 
            className="rounded-full" 
            size="icon"
            variant="ghost"
            onClick={() => handleLikeTrack(track.id)}
          >
            <Heart className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full" size="icon" variant="ghost">
                <Share2 className="h-5 w-5" />
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
                  <Check className="h-4 w-4 mr-2 text-primary" />
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
      {/* Revolutionary Header with Asymmetric Layout */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Content */}
          <div>
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6 text-foreground">
              Discover
              <br />
              New Music.
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Stream directly from artists. Every play supports creators through BAP.
            </p>
          </div>

          {/* Right: Stats Card */}
          <Card className="border-2 border-gray-200 bg-white">
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                    <Music className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">Direct Streams</div>
                    <div className="text-lg text-gray-600">Artist to Fan</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">Trending</div>
                    <div className="text-lg text-gray-600">Fresh Releases</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                    <Radio className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">Live Feed</div>
                    <div className="text-lg text-gray-600">Real-Time Updates</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar - Revolutionary Design */}
        <Card className="border-2 border-gray-200 bg-white mb-12">
          <CardContent className="p-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for tracks, artists, or albums..."
                className="pl-16 h-16 text-xl font-bold border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Genre Filters - Color-Coded Pills */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Genre</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <Badge
                  key={genre}
                  className={`cursor-pointer whitespace-nowrap px-6 py-3 text-base font-semibold rounded-full border-2 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && searchResults && (
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Results</span>
            </h2>
            <div className="space-y-4">
              {searchResults.length > 0 ? (
                searchResults.map((track) => <TrackCard key={track.id} track={track} />)
              ) : (
                <Card className="rounded-3xl border-4 border-gray-300 shadow-2xl bg-white">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl mx-auto mb-6">
                      <Search className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-xl text-gray-600 font-medium">
                      No tracks found for "{searchQuery}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Discovery Tabs */}
        {!searchQuery && (
          <Tabs defaultValue="trending" className="space-y-8">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 h-auto p-2 bg-white rounded-3xl border-4 border-gray-300 shadow-2xl">
              <TabsTrigger 
                value="trending" 
                className="flex items-center gap-2 text-lg font-bold py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <TrendingUp className="h-5 w-5" />
                Trending
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="flex items-center gap-2 text-lg font-bold py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Clock className="h-5 w-5" />
                New This Week
              </TabsTrigger>
              <TabsTrigger 
                value="rising" 
                className="flex items-center gap-2 text-lg font-bold py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="h-5 w-5" />
                Rising Artists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Trending on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">BAP</span>
              </h2>
              {trendingTracks && trendingTracks.length > 0 ? (
                trendingTracks.map((track) => <TrackCard key={track.id} track={track} />)
              ) : (
                <Card className="rounded-3xl border-4 border-gray-300 shadow-2xl bg-white">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl mx-auto mb-6">
                      <Music className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">No Trending Tracks Yet</h3>
                    <p className="text-xl text-gray-600 font-medium mb-8">
                      Be the first to upload and start trending!
                    </p>
                    <Link href="/upload">
                      <Button className="rounded-full text-xl px-10 py-7 bg-primary hover:bg-primary/90 font-bold">
                        Upload Your Music
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                New This <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Week</span>
              </h2>
              {newReleases && newReleases.length > 0 ? (
                newReleases.map((track) => <TrackCard key={track.id} track={track} />)
              ) : (
                <Card className="rounded-3xl border-4 border-gray-300 shadow-2xl bg-white">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl mx-auto mb-6">
                      <Music className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">No New Releases Yet</h3>
                    <p className="text-xl text-gray-600 font-medium mb-8">
                      Upload your music to BAP and be featured here!
                    </p>
                    <Link href="/upload">
                      <Button className="rounded-full text-xl px-10 py-7 bg-primary hover:bg-primary/90 font-bold">
                        Upload Your Music
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rising" className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Rising <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Artists</span>
              </h2>
              {risingArtists && risingArtists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {risingArtists.map((artist: any) => (
                    <Card className="rounded-3xl border-4 border-gray-300 shadow-xl hover:scale-105 hover:border-indigo-500 transition-all bg-white" key={artist.id}>
                      <CardContent className="p-8 text-center">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 mx-auto mb-6 flex items-center justify-center shadow-lg">
                          <Music className="h-16 w-16 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-2xl text-gray-900 mb-2">{artist.name}</h3>
                        <p className="text-lg text-gray-600 font-bold mb-6">
                          {artist.followerCount?.toLocaleString() || 0} followers
                        </p>
                        <Link href={`/@${artist.username}`}>
                          <Button className="rounded-full w-full text-lg px-6 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl font-bold">
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-3xl border-4 border-gray-300 shadow-2xl bg-white">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl mx-auto mb-6">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">No Rising Artists Yet</h3>
                    <p className="text-xl text-gray-600 font-medium mb-8">
                      Start uploading to grow your audience and get featured!
                    </p>
                    <Link href="/upload">
                      <Button className="rounded-full text-xl px-10 py-7 bg-primary hover:bg-primary/90 font-bold">
                        Upload Your Music
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Music Player (Fixed Bottom) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-300 z-50 shadow-2xl">
          <div className="container mx-auto px-4 py-6">
            {/* Track Info & Controls */}
            <div className="flex items-center gap-6 mb-4">
              <img
                src={currentTrack.artworkUrl || `https://via.placeholder.com/80x80?text=${encodeURIComponent(currentTrack.title)}`}
                alt={currentTrack.title}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-2 border-gray-300 shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xl text-gray-900 truncate">{currentTrack.title}</h4>
                <p className="text-lg text-gray-600 font-bold truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-full" size="icon" variant="ghost">
                  <Shuffle className="h-5 w-5" />
                </Button>
                <Button className="rounded-full" size="icon" variant="ghost">
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button 
                  className="rounded-full w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl" 
                  size="icon" 
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
                </Button>
                <Button className="rounded-full" size="icon" variant="ghost">
                  <SkipForward className="h-6 w-6" />
                </Button>
                <Button className="rounded-full" size="icon" variant="ghost">
                  <Repeat className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-full" size="icon"
                  variant="ghost"
                  onClick={() => handleLikeTrack(currentTrack.id)}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="rounded-full" size="icon" variant="ghost">
                      <Share2 className="h-5 w-5" />
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
                        <Check className="h-4 w-4 mr-2 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Volume2 className="h-5 w-5 text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-bold w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1">
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
                  className="w-full h-2 rounded-full"
                />
              </div>
              <span className="text-sm text-gray-600 font-bold w-12">
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
