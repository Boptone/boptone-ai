import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart,
  Share2,
  Search,
  Music,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PayToStreamButton } from "@/components/PayToStreamButton";
import { AddToPlaylistModal } from "@/components/AddToPlaylistModal";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<{ id: number; title: string } | null>(null);
  const [playerCollapsed, setPlayerCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('boptone-player-collapsed');
    return saved === 'true';
  });

  // Save collapsed state to localStorage
  const togglePlayerCollapsed = () => {
    const newState = !playerCollapsed;
    setPlayerCollapsed(newState);
    localStorage.setItem('boptone-player-collapsed', String(newState));
  };

  const genres = [
    "ALL", "HIP-HOP", "POP", "ROCK", "ELECTRONIC", "R&B", 
    "JAZZ", "COUNTRY", "LATIN", "INDIE", "ALTERNATIVE"
  ];

  // Fetch tracks from BAP router
  const { data: trendingTracks = [] } = trpc.bap.discover.trending.useQuery({ 
    limit: 20
  });
  const { data: newReleases = [] } = trpc.bap.discover.newReleases.useQuery({ 
    limit: 20
  });
  const { data: searchResults = [] } = trpc.bap.discover.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  // Combine all tracks for display
  const allTracks = searchQuery 
    ? searchResults 
    : [...(trendingTracks || []), ...(newReleases || [])];

  // Get featured/spotlight track (first trending track)
  const spotlightTrack = trendingTracks?.[0];
  
  // Get trending tracks for display (first 6)
  const trendingTracksDisplay = trendingTracks?.slice(0, 6) || [];
  
  // Get new releases for display (first 12)
  const newReleasesDisplay = newReleases?.slice(0, 12) || [];

  // Get editor's picks (curated selection from trending)
  const editorsPicks = trendingTracks?.slice(6, 11) || []; // 1 large + 4 small = 5 total

  const likeTrackMutation = trpc.bap.social.likeTrack.useMutation();

  const handlePlayTrack = (trackId: number) => {
    if (currentTrackId === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrackId(trackId);
      setIsPlaying(true);
    }
  };

  const handleLike = async (trackId: number) => {
    try {
      await likeTrackMutation.mutateAsync({ trackId });
      toast.success("Added to your liked songs");
    } catch (error) {
      toast.error("Failed to like track");
    }
  };

  const handleShare = (trackId: number) => {
    const trackUrl = `${window.location.origin}/track/${trackId}`;
    navigator.clipboard.writeText(trackUrl);
    toast.success("Link copied to clipboard");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Audio player effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => {
        console.error("Failed to play audio:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const currentTrack = allTracks.find(t => t.id === currentTrackId);

  return (
    <div className="min-h-screen bg-white pb-32">
      
      {/* IMMERSIVE HERO SECTION - Full-screen featured artist spotlight */}
      {spotlightTrack && (
        <div className="relative h-screen min-h-[600px] max-h-[900px] bg-black overflow-hidden border-b-2 border-black">
          {/* Background Album Artwork with Gradient Overlay */}
          <div className="absolute inset-0">
            {spotlightTrack.coverArtUrl ? (
              <img
                src={spotlightTrack.coverArtUrl}
                alt={spotlightTrack.title}
                className="w-full h-full object-cover opacity-40 blur-sm scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 opacity-40" />
            )}
            {/* Gradient Overlays for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              
              {/* Left: Album Artwork */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative group">
                  <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-2xl border-4 border-white shadow-[12px_12px_0px_0px_rgba(6,182,212,1)] overflow-hidden">
                    {spotlightTrack.coverArtUrl ? (
                      <img
                        src={spotlightTrack.coverArtUrl}
                        alt={spotlightTrack.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-32 h-32 rounded-full bg-cyan-500/20 border-4 border-cyan-500 flex items-center justify-center mb-6">
                          <Music className="w-16 h-16 text-cyan-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2 line-clamp-2">{spotlightTrack.title}</h3>
                        <p className="text-xl text-cyan-400 font-medium">{spotlightTrack.artist}</p>
                      </div>
                    )}
                  </div>
                  {/* Play Button Overlay */}
                  <button
                    onClick={() => handlePlayTrack(spotlightTrack.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                  >
                    <div className="w-24 h-24 rounded-full bg-cyan-500 border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-110 transition-transform">
                      {currentTrackId === spotlightTrack.id && isPlaying ? (
                        <Pause className="w-12 h-12 text-black" />
                      ) : (
                        <Play className="w-12 h-12 text-black ml-1" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Right: Track Info */}
              <div className="text-white space-y-6 px-4 lg:px-0">
                <div className="inline-block px-4 py-2 bg-cyan-500 text-black font-bold text-sm rounded-full border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  FEATURED NOW
                </div>
                
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-none">
                  {spotlightTrack.title}
                </h1>
                
                <p className="text-3xl md:text-4xl text-cyan-400 font-bold">
                  {spotlightTrack.artist}
                </p>
                
                {spotlightTrack.genre && (
                  <div className="flex gap-3">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm border-2 border-white rounded-full text-white font-bold text-lg">
                      {spotlightTrack.genre.toUpperCase()}
                    </span>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm border-2 border-white rounded-full text-white font-bold text-lg">
                      {formatDuration(spotlightTrack.duration)}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    onClick={() => handlePlayTrack(spotlightTrack.id)}
                    className="rounded-full text-xl px-12 py-8 bg-cyan-500 hover:bg-cyan-600 text-black font-bold border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Play Now
                  </Button>
                  
                  <Button
                    onClick={() => handleLike(spotlightTrack.id)}
                    variant="outline"
                    className="rounded-full text-xl px-8 py-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Heart className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    onClick={() => handleShare(spotlightTrack.id)}
                    variant="outline"
                    className="rounded-full text-xl px-8 py-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* SEARCH & GENRE FILTERS */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-black shadow-lg">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tracks, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-black rounded-full shadow-[4px_4px_0px_0px_black] focus:shadow-[2px_2px_0px_0px_black] transition-all"
              />
            </div>

            {/* Genre Filters - Horizontal Scroll on Mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  className={`rounded-full px-6 py-3 font-bold text-sm whitespace-nowrap border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all ${
                    selectedGenre === genre
                      ? "bg-cyan-500 text-black"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EDITOR'S PICKS - Asymmetric Layout (1 Large + 4 Small) */}
      {editorsPicks.length > 0 && (
        <section className="container py-16 border-b-2 border-black">
          <div className="flex items-center gap-4 mb-8">
            <Sparkles className="w-10 h-10 text-cyan-500" />
            <h2 className="text-5xl md:text-6xl font-bold">Editor's Picks</h2>
          </div>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl">
            Hand-selected tracks that define the sound of right now. Curated by music lovers, for music lovers.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large Featured Card */}
            {editorsPicks[0] && (
              <div className="lg:col-span-2 lg:row-span-2">
                <div className="relative group h-full bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_black] hover:shadow-[4px_4px_0px_0px_black] transition-all">
                  {/* Album Artwork */}
                  <div className="aspect-square lg:aspect-video relative overflow-hidden">
                    {editorsPicks[0].coverArtUrl ? (
                      <img
                        src={editorsPicks[0].coverArtUrl}
                        alt={editorsPicks[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Music className="w-24 h-24 text-white opacity-50" />
                      </div>
                    )}
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handlePlayTrack(editorsPicks[0].id)}
                        className="w-20 h-20 rounded-full bg-cyan-500 border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Play className="w-10 h-10 text-black ml-1" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Track Info */}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      {editorsPicks[0].genre && (
                        <span className="px-3 py-1 bg-cyan-500 text-black font-bold text-xs rounded-full border border-black">
                          {editorsPicks[0].genre.toUpperCase()}
                        </span>
                      )}
                      <span className="text-gray-600 font-medium">
                        {formatDuration(editorsPicks[0].duration)}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-2 line-clamp-2">
                      {editorsPicks[0].title}
                    </h3>
                    <p className="text-2xl text-gray-700 font-medium mb-6">
                      {editorsPicks[0].artist}
                    </p>
                    
                    <div className="flex gap-3 flex-wrap">
                      <PayToStreamButton
                        trackId={editorsPicks[0].id}
                        trackTitle={editorsPicks[0].title}
                        artistName={editorsPicks[0].artist}
                        artistId={editorsPicks[0].artistId || 1}
                        defaultPrice={3}
                      />
                      <Button
                        onClick={() => handleLike(editorsPicks[0].id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Like
                      </Button>
                      <Button
                        onClick={() => handleShare(editorsPicks[0].id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Small Cards Grid */}
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-6">
              {editorsPicks.slice(1, 5).map((track) => (
                <div
                  key={track.id}
                  className="relative group bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
                >
                  <div className="aspect-square relative overflow-hidden">
                    {track.coverArtUrl ? (
                      <img
                        src={track.coverArtUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Music className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handlePlayTrack(track.id)}
                        className="w-14 h-14 rounded-full bg-cyan-500 border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Play className="w-6 h-6 text-black ml-0.5" />
                      </button>
                    </div>
                  </div>
                   <div className="p-4">
                  <h4 className="font-bold text-base line-clamp-1 mb-1">{track.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-3">{track.artist}</p>
                  <Button
                    onClick={() => {
                      setSelectedTrackForPlaylist({ id: track.id, title: track.title });
                      setPlaylistModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-2 border-black rounded-full text-xs font-bold hover:bg-cyan-500 hover:text-white transition-colors"
                  >
                    + Playlist
                  </Button>
                </div>
              </div>
            ))}
            </div>
          </div>
        </section>
      )}

      {/* Add to Playlist Modal */}
      {selectedTrackForPlaylist && (
        <AddToPlaylistModal
          open={playlistModalOpen}
          onOpenChange={setPlaylistModalOpen}
          trackId={selectedTrackForPlaylist.id}
          trackTitle={selectedTrackForPlaylist.title}
        />
      )}

      {/* FIXED PLAYER BAR */}  {/* TRENDING NOW - Grid */}
      {trendingTracksDisplay.length > 0 && (
        <section className="container py-16 border-b-2 border-black">
          <div className="flex items-center gap-4 mb-8">
            <TrendingUp className="w-10 h-10 text-cyan-500" />
            <h2 className="text-5xl md:text-6xl font-bold">Trending Now</h2>
          </div>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl">
            The hottest tracks on BopAudio right now. See what everyone's listening to.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trendingTracksDisplay.map((track) => (
              <div
                key={track.id}
                className="relative group bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
              >
                <div className="aspect-square relative overflow-hidden">
                  {track.coverArtUrl ? (
                    <img
                      src={track.coverArtUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Music className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handlePlayTrack(track.id)}
                      className="w-14 h-14 rounded-full bg-cyan-500 border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Play className="w-6 h-6 text-black ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-base line-clamp-1 mb-1">{track.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-3">{track.artist}</p>
                  <Button
                    onClick={() => {
                      setSelectedTrackForPlaylist({ id: track.id, title: track.title });
                      setPlaylistModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-2 border-black rounded-full text-xs font-bold hover:bg-cyan-500 hover:text-white transition-colors"
                  >
                    + Playlist
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEW MUSIC - Grid Layout */}
      {newReleasesDisplay.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center gap-4 mb-8">
            <Music className="w-10 h-10 text-cyan-500" />
            <h2 className="text-5xl md:text-6xl font-bold">New Music</h2>
          </div>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl">
            Fresh releases from artists around the world. Discover your next favorite track.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newReleasesDisplay.map((track) => (
              <div
                key={track.id}
                className="relative group bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
              >
                <div className="aspect-square relative overflow-hidden">
                  {track.coverArtUrl ? (
                    <img
                      src={track.coverArtUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Music className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handlePlayTrack(track.id)}
                      className="w-14 h-14 rounded-full bg-cyan-500 border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Play className="w-6 h-6 text-black ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-base line-clamp-1 mb-1">{track.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1">{track.artist}</p>
                  {track.genre && (
                    <span className="inline-block mt-2 px-2 py-1 bg-cyan-500 text-black font-bold text-xs rounded-full border border-black">
                      {track.genre.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FIXED PLAYER BAR AT BOTTOM */}
      {currentTrack && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-black shadow-[0_-8px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 ${playerCollapsed ? 'translate-y-0' : 'translate-y-0'}`}>
          {/* Collapse/Expand Button */}
          <button
            onClick={togglePlayerCollapsed}
            className="absolute -top-10 right-4 bg-white border-4 border-black rounded-t-xl px-4 py-2 shadow-[4px_0px_0px_0px_black] hover:bg-cyan-50 transition-colors"
          >
            {playerCollapsed ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {/* Collapsed State - Compact Bar */}
          {playerCollapsed ? (
            <div className="container py-3">
              <div className="flex items-center gap-4">
                {/* Track Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_black] flex-shrink-0 overflow-hidden">
                    {currentTrack.coverArtUrl ? (
                      <img
                        src={currentTrack.coverArtUrl}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
                    <p className="text-xs text-gray-600 truncate">{currentTrack.artist}</p>
                  </div>
                </div>

                {/* Compact Play Button */}
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-600 border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-black" />
                  ) : (
                    <Play className="w-4 h-4 text-black ml-0.5" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Expanded State - Full Player */
            <div className="container py-4">
            <div className="flex items-center gap-6">
              {/* Track Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_black] flex-shrink-0 overflow-hidden">
                  {currentTrack.coverArtUrl ? (
                    <img
                      src={currentTrack.coverArtUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-lg truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-600 border-2 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-black" />
                  ) : (
                    <Play className="w-6 h-6 text-black ml-0.5" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 hidden lg:flex items-center gap-4">
                <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    const audio = audioRef.current;
                    if (audio) {
                      audio.currentTime = Number(e.target.value);
                    }
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-sm font-medium">{formatTime(duration)}</span>
              </div>

              {/* Volume & Actions */}
              <div className="hidden md:flex items-center gap-3">
                <Button
                  onClick={() => handleLike(currentTrack.id)}
                  variant="outline"
                  size="icon"
                  className="rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all"
                >
                  <Heart className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      const newVolume = Number(e.target.value);
                      setVolume(newVolume);
                      if (audioRef.current) {
                        audioRef.current.volume = newVolume;
                      }
                    }}
                    className="w-24 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={currentTrack?.audioUrl} />
    </div>
  );
}
