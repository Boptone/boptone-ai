import { useState, useEffect, useRef } from "react";
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
    <Card className="rounded-none border-4 border-black hover:shadow-lg transition-all bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0 group">
            <img
              src={track.artworkUrl || `https://via.placeholder.com/96x96?text=${encodeURIComponent(track.title)}`}
              alt={track.title}
              className="w-24 h-24 rounded-none object-cover border-4 border-black"
            />
            <Button 
              className="rounded-full absolute inset-0 m-auto w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black hover:bg-gray-800" 
              size="icon"
              onClick={() => handlePlayTrack(track)}
            >
              <span className="text-white text-2xl">
                {currentTrack?.id === track.id && isPlaying ? "❚❚" : "▶"}
              </span>
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-black truncate">{track.title}</h3>
            <p className="text-lg text-gray-600 font-medium truncate">{track.artist}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
              {track.genre && (
                <Badge className="rounded-full border-2 border-black bg-white text-black font-bold text-xs px-3 py-1 uppercase">
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
            className="rounded-full border-2 border-black px-6 py-2" 
            variant="outline"
            onClick={() => handleLikeTrack(track.id)}
          >
            <span className="text-sm font-bold">LIKE</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full border-2 border-black px-6 py-2" variant="outline">
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
                <span className="mr-2">{copiedTrackId === track.id ? "✓" : "⎘"}</span>
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
              Stream directly from artists. Every play supports creators through BAP.
            </p>
          </div>

          {/* Right: Stats Card - Simplified without heavy black boxes */}
          <Card className="border-4 border-black bg-white rounded-none">
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="text-5xl">♪</div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">Total Tracks</p>
                    <p className="text-3xl font-bold">{trendingTracks?.length || 0}+</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-5xl">↗</div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">Trending Now</p>
                    <p className="text-3xl font-bold">{trendingTracks?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-5xl">◉</div>
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
        <Card className="border-4 border-black bg-white mb-12 rounded-none">
          <CardContent className="p-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tracks, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-2xl py-8 pl-6 pr-6 border-2 border-gray-300 rounded-none font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Genre Filter - Rounded-full buttons */}
        <div className="flex flex-wrap gap-3 mb-12">
          {GENRES.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-full border-2 border-black font-bold uppercase text-sm px-6 py-3 ${
                selectedGenre === genre
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-white"
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
              <Card className="rounded-none border-4 border-black bg-white">
                <CardContent className="p-16 text-center">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No results found</h3>
                  <p className="text-gray-600 text-lg">Try a different search term</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tabs - Simplified without inverted backgrounds */}
        {!searchQuery && (
          <Tabs defaultValue="trending" className="space-y-8">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 h-auto p-2 bg-white rounded-none border-4 border-black">
              <TabsTrigger 
                value="trending"
                className="text-xl py-4 px-8 font-bold uppercase rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-black"
              >
                Trending
              </TabsTrigger>
              <TabsTrigger 
                value="new"
                className="text-xl py-4 px-8 font-bold uppercase rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-black"
              >
                New This Week
              </TabsTrigger>
              <TabsTrigger 
                value="rising"
                className="text-xl py-4 px-8 font-bold uppercase rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-black"
              >
                Rising Artists
              </TabsTrigger>
            </TabsList>

            {/* Trending Tab */}
            <TabsContent value="trending" className="space-y-4">
              {trendingTracks && trendingTracks.length > 0 ? (
                trendingTracks.map((track: any) => (
                  <TrackCard key={track.id} track={track} />
                ))
              ) : (
                <Card className="rounded-none border-4 border-black bg-white">
                  <CardContent className="p-16 text-center">
                    <div className="text-6xl mb-6">♪</div>
                    <h3 className="text-2xl font-bold mb-2">No trending tracks yet</h3>
                    <p className="text-gray-600 text-lg mb-6">Be the first to upload!</p>
                    <Link href="/upload">
                      <Button className="rounded-full text-xl px-10 py-7 bg-black hover:bg-gray-800 font-bold uppercase">
                        Upload Your Music
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* New Releases Tab */}
            <TabsContent value="new" className="space-y-4">
              {newReleases && newReleases.length > 0 ? (
                newReleases.map((track: any) => (
                  <TrackCard key={track.id} track={track} />
                ))
              ) : (
                <Card className="rounded-none border-4 border-black bg-white">
                  <CardContent className="p-16 text-center">
                    <div className="text-6xl mb-6">♪</div>
                    <h3 className="text-2xl font-bold mb-2">No new releases yet</h3>
                    <p className="text-gray-600 text-lg mb-6">Check back soon for fresh music!</p>
                    <Link href="/upload">
                      <Button className="rounded-full text-xl px-10 py-7 bg-black hover:bg-gray-800 font-bold uppercase">
                        Upload Your Music
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Rising Artists Tab */}
            <TabsContent value="rising" className="space-y-4">
              {risingArtists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {risingArtists.map((artist: any) => (
                    <Card className="rounded-none border-4 border-black hover:shadow-lg transition-all bg-white" key={artist.id}>
                      <CardContent className="p-8 text-center">
                        <div className="text-6xl mb-6">♪</div>
                        <h3 className="text-2xl font-bold mb-2">{artist.name}</h3>
                        <p className="text-gray-600 mb-6">{artist.genre}</p>
                        <Link href={`/@${artist.username}`}>
                          <Button className="rounded-full w-full text-lg px-6 py-6 bg-black hover:bg-gray-800 font-bold uppercase">
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-none border-4 border-black bg-white">
                  <CardContent className="p-16 text-center">
                    <div className="text-6xl mb-6">👥</div>
                    <h3 className="text-2xl font-bold mb-2">No rising artists yet</h3>
                    <p className="text-gray-600 text-lg mb-6">Be the first to rise!</p>
                    <Link href="/upload">
                      <Button className="rounded-full text-xl px-10 py-7 bg-black hover:bg-gray-800 font-bold uppercase">
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black z-50 shadow-2xl">
          <div className="container mx-auto px-4 py-6">
            {/* Track Info & Controls */}
            <div className="flex items-center gap-6 mb-4">
              <img
                src={currentTrack.artworkUrl || `https://via.placeholder.com/80x80?text=${encodeURIComponent(currentTrack.title)}`}
                alt={currentTrack.title}
                className="w-20 h-20 rounded-none object-cover flex-shrink-0 border-4 border-black"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xl text-black truncate">{currentTrack.title}</h4>
                <p className="text-lg text-gray-600 font-medium truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-full border-2 border-black" size="icon" variant="outline">
                  <span className="text-lg">🔀</span>
                </Button>
                <Button className="rounded-full border-2 border-black" size="icon" variant="outline">
                  <span className="text-xl">⏮</span>
                </Button>
                <Button 
                  className="rounded-full w-14 h-14 bg-black hover:bg-gray-800 border-2 border-black" 
                  size="icon" 
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <span className="text-white text-2xl">
                    {isPlaying ? "❚❚" : "▶"}
                  </span>
                </Button>
                <Button className="rounded-full border-2 border-black" size="icon" variant="outline">
                  <span className="text-xl">⏭</span>
                </Button>
                <Button className="rounded-full border-2 border-black" size="icon" variant="outline">
                  <span className="text-lg">🔁</span>
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-full border-2 border-black" size="icon"
                  variant="outline"
                  onClick={() => handleLikeTrack(currentTrack.id)}
                >
                  <span className="text-sm font-bold">LIKE</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="rounded-full border-2 border-black" size="icon" variant="outline">
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
                      <span className="mr-2">{copiedTrackId === currentTrack.id ? "✓" : "⎘"}</span>
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-gray-600 text-lg">🔊</span>
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

            {/* Progress Bar */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-mono w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-3 bg-white border-2 border-black rounded-none">
                    <div
                      className="h-full bg-black transition-all"
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
