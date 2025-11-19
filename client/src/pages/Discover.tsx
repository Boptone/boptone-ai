import { useState } from "react";
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
  Check
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
  const [volume, setVolume] = useState(75);
  const [copiedTrackId, setCopiedTrackId] = useState<number | null>(null);

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
  const { data: trendingTracks } = trpc.bap.getTrendingTracks.useQuery({ 
    limit: 10,
    genre: selectedGenre !== "All" ? selectedGenre : undefined 
  });
  const { data: newReleases } = trpc.bap.getNewReleases.useQuery({ 
    limit: 10,
    genre: selectedGenre !== "All" ? selectedGenre : undefined 
  });
  const { data: risingArtists } = trpc.bap.getRisingArtists.useQuery({ limit: 6 });
  const { data: searchResults } = trpc.bap.searchTracks.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const likeTrackMutation = trpc.bap.likeTrack.useMutation();

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
    <Card className="group hover:bg-muted/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
          <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <img
              src={track.artworkUrl || `https://via.placeholder.com/80x80?text=${encodeURIComponent(track.title)}`}
              alt={track.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handlePlayTrack(track)}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {track.genre && <span className="capitalize">{track.genre}</span>}
              <span>{formatTime(track.duration)}</span>
              {track.streamCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {track.streamCount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleLikeTrack(track.id)}
              >
                <Heart className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Share2 className="h-4 w-4" />
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
                      <Check className="h-4 w-4 mr-2 text-green-500" />
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
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <button className="flex items-center gap-2 font-bold text-xl">
              <Music className="h-6 w-6" />
              Boptone
            </button>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/upload">
              <Button variant="outline">Upload Music</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for tracks, artists, or albums..."
            className="pl-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Genre Filters */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {GENRES.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-2 hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Results */}
        {searchQuery && searchResults && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((track) => <TrackCard key={track.id} track={track} />)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No tracks found for "{searchQuery}"
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Discovery Tabs */}
        {!searchQuery && (
          <Tabs defaultValue="trending" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                New This Week
              </TabsTrigger>
              <TabsTrigger value="rising" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Rising Artists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-2">
              <h2 className="text-2xl font-bold mb-4">Trending on BAP</h2>
              {trendingTracks && trendingTracks.length > 0 ? (
                trendingTracks.map((track) => <TrackCard key={track.id} track={track} />)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trending tracks yet. Be the first to upload!</p>
                    <Link href="/upload">
                      <Button className="mt-4">Upload Your Music</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-2">
              <h2 className="text-2xl font-bold mb-4">New This Week</h2>
              {newReleases && newReleases.length > 0 ? (
                newReleases.map((track) => <TrackCard key={track.id} track={track} />)
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No new releases yet. Upload your music to BAP!</p>
                    <Link href="/upload">
                      <Button className="mt-4">Upload Your Music</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rising" className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Rising Artists</h2>
              {risingArtists && risingArtists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {risingArtists.map((artist: any) => (
                    <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-4 flex items-center justify-center">
                          <Music className="h-12 w-12 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{artist.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {artist.followerCount?.toLocaleString() || 0} followers
                        </p>
                        <Link href={`/@${artist.username}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rising artists yet. Start uploading to grow your audience!</p>
                    <Link href="/upload">
                      <Button className="mt-4">Upload Your Music</Button>
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
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
          <div className="container mx-auto px-4 py-4">
            {/* Track Info & Controls */}
            <div className="flex items-center gap-4 mb-3">
              <img
                src={currentTrack.artworkUrl || `https://via.placeholder.com/60x60?text=${encodeURIComponent(currentTrack.title)}`}
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{currentTrack.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="ghost">
                  <SkipForward className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Repeat className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleLikeTrack(currentTrack.id)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Share2 className="h-4 w-4" />
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
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={currentTrack.duration}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
