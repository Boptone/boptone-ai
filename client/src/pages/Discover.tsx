import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [displayLimit, setDisplayLimit] = useState(12);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const scrollObserverRef = useRef<HTMLDivElement>(null);
  const genreScrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // tRPC queries
  const { data: trendingTracks = [] } = trpc.bap.discover.trending.useQuery({
    limit: 8,
    genre: selectedGenre === "ALL" ? undefined : selectedGenre,
  });

  const { data: newReleases = [] } = trpc.bap.discover.newReleases.useQuery({
    limit: 8,
    genre: selectedGenre === "ALL" ? undefined : selectedGenre,
  });

  // Picks For You - based on user's genre preferences (mock for now)
  const userGenres = user?.preferences?.genres || ["Hip-Hop", "Electronic"];
  const { data: picksForYou = [] } = trpc.bap.discover.trending.useQuery({
    limit: 8,
    genre: userGenres[0], // Use first genre preference
  });

  // Endless scroll tracks (for bottom section)
  const { data: endlessScrollTracks = [] } = trpc.bap.discover.trending.useQuery({
    limit: displayLimit,
    genre: selectedGenre === "ALL" ? undefined : selectedGenre,
  });

  // Reset display limit when genre changes
  useEffect(() => {
    setDisplayLimit(12);
  }, [selectedGenre]);

  // Endless scroll observer
  useEffect(() => {
    if (!scrollObserverRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < 100) {
          setDisplayLimit((prev) => Math.min(prev + 12, 100));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(scrollObserverRef.current);
    return () => observer.disconnect();
  }, [displayLimit]);

  const handlePlayTrack = (trackId: number, trackList: any[]) => {
    const track = trackList.find((t) => t.id === trackId);
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(true);
      toast.success(`Now playing: ${track.title}`);
    }
  };

  const handlePauseTrack = () => {
    setIsPlaying(false);
  };

  const genres = [
    "ALL",
    "Hip-Hop",
    "Pop",
    "Rock",
    "Electronic",
    "R&B",
    "Jazz",
    "Country",
    "Latin",
    "Indie",
    "Alternative",
  ];

  // Smooth scroll carousel - no arrow buttons needed

  // Featured track (first trending track)
  const featuredTrack = trendingTracks[0];

  return (
    <div className="min-h-screen bg-white">
      {/* BopAudio Logo Header */}
      <div className="py-8 md:py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-center">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/98208888/scmTXnouyohxCIHo.png" 
            alt="BopAudio" 
            className="h-20 md:h-28 w-auto"
          />
        </div>
      </div>

      {/* Hero Section - Featured Artist Spotlight */}
      {featuredTrack && (
        <section className="py-20 md:py-32 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Left: MASSIVE Typography */}
              <div className="lg:col-span-3">
                <div className="inline-block px-4 py-2 bg-[#008B8B] text-white text-sm font-bold rounded-full mb-6">
                  FEATURED ARTIST
                </div>
                
                <h1 className="text-6xl md:text-8xl font-extrabold leading-none mb-4">
                  {featuredTrack.title}
                </h1>
                
                <p className="text-2xl md:text-3xl font-medium text-gray-800 mb-6">
                  {featuredTrack.artist}
                </p>
                
                <p className="text-xl md:text-2xl text-gray-600">
                  {featuredTrack.genre}
                </p>
              </div>

              {/* Right: Album Artwork with Play Button Overlay */}
              <div className="lg:col-span-2">
                <div className="relative aspect-square border border-black overflow-hidden">
                  <img
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/98208888/lFyBmeOuCgCpujMK.png"
                    alt={featuredTrack.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Button Overlay - Bottom Right Corner */}
                  <button
                    onClick={() => handlePlayTrack(featuredTrack.id, trendingTracks)}
                    className="absolute bottom-4 right-4 w-16 h-16 md:w-20 md:h-20 bg-[#008B8B] rounded-full flex items-center justify-center hover:bg-[#006666] transition-colors"
                  >
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top Bops Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-12">
            Top Bops
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trendingTracks.slice(1, 9).map((track) => (
              <div
                key={track.id}
                className="bg-white border border-black rounded-lg p-8   hover:border-[#008B8B] transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border border-black flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold mb-2 truncate">
                      {track.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{track.artist}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, trendingTracks)}
                      className="bg-[#008B8B] hover:bg-[#006666] text-white rounded-full w-12 h-12 p-0"
                    >
                      <Play className="w-5 h-5 text-white fill-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Music Section */}
      <section className="py-20 md:py-32 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-12">
            Fresh Music
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {newReleases.map((track) => (
              <div
                key={track.id}
                className="bg-white border border-black rounded-lg p-8   hover:border-[#008B8B] transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border border-black flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold mb-2 truncate">
                      {track.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{track.artist}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, newReleases)}
                      className="bg-[#008B8B] hover:bg-[#006666] text-white rounded-full w-12 h-12 p-0"
                    >
                      <Play className="w-5 h-5 text-white fill-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Picks For You Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-12">
            Picks For You
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {picksForYou.map((track) => (
              <div
                key={track.id}
                className="bg-white border border-black rounded-lg p-8   hover:border-[#008B8B] transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border border-black flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold mb-2 truncate">
                      {track.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{track.artist}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, picksForYou)}
                      className="bg-[#008B8B] hover:bg-[#006666] text-white rounded-full w-12 h-12 p-0"
                    >
                      <Play className="w-5 h-5 text-white fill-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genre Picker + Endless Scroll Section */}
      <section className="py-20 md:py-32 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-8">
            Explore by Genre
          </h2>
          
          {/* Genre Carousel - World-Class Smooth Scroll */}
          <div className="relative mb-12 -mx-4 md:mx-0">
            {/* Fade-out edges to indicate scrollable content */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            
            {/* Genre Pills Container - Smooth Horizontal Scroll */}
            <div
              ref={genreScrollRef}
              className="flex gap-3 overflow-x-auto px-4 md:px-0 scroll-smooth"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x proximity'
              }}
            >
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-6 py-3 rounded-full text-lg font-bold border border-black transition-all whitespace-nowrap flex-shrink-0 scroll-snap-align-start ${
                    selectedGenre === genre
                      ? "bg-[#008B8B] text-white border-[#008B8B]"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Endless Scroll Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {endlessScrollTracks.slice(0, displayLimit).map((track) => (
              <div
                key={track.id}
                className="bg-white border border-black rounded-lg p-8   hover:border-[#008B8B] transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border border-black flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold mb-2 truncate">
                      {track.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{track.artist}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, endlessScrollTracks)}
                      className="bg-[#008B8B] hover:bg-[#006666] text-white rounded-full w-12 h-12 p-0"
                    >
                      <Play className="w-5 h-5 text-white fill-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Indicator */}
          {displayLimit < endlessScrollTracks.length && (
            <div ref={scrollObserverRef} className="flex justify-center mt-12">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-[#008B8B] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-[#008B8B] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-[#008B8B] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mini-Player */}
      {currentTrack && (
        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-50 transition-all duration-300 ${
          isPlayerMinimized ? 'h-16' : 'h-auto'
        }`}>
          <div className="container mx-auto px-4">
            {!isPlayerMinimized ? (
              /* Full Player */
              <div className="flex items-center justify-between gap-4 py-4">
                {/* Track Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-lg border border-black flex-shrink-0 overflow-hidden">
                    <img
                      src="https://files.manuscdn.com/user_upload_by_module/session_file/98208888/lFyBmeOuCgCpujMK.png"
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg truncate">{currentTrack.title}</h4>
                    <p className="text-gray-600 text-sm truncate">{currentTrack.artistName}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={isPlaying ? handlePauseTrack : () => setIsPlaying(true)}
                    className="bg-[#008B8B] hover:bg-[#006666] text-white rounded-full w-12 h-12 p-0"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 text-white fill-white" /> : <Play className="w-5 h-5 text-white fill-white" />}
                  </Button>
                  
                  <Button
                    onClick={() => setIsPlayerMinimized(true)}
                    variant="outline"
                    className="rounded-full w-10 h-10 p-0 border border-black"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Minimized Player */
              <div className="flex items-center justify-between gap-4 h-16">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Button
                    onClick={isPlaying ? handlePauseTrack : () => setIsPlaying(true)}
                    className="bg-[#008B8B] hover:bg-[#006666] text-white rounded-full w-10 h-10 p-0 flex-shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white fill-white" /> : <Play className="w-4 h-4 text-white fill-white" />}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{currentTrack.title}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsPlayerMinimized(false)}
                  variant="outline"
                  className="rounded-full w-8 h-8 p-0 border border-black flex-shrink-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
