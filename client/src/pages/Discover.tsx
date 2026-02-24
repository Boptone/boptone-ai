import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Play, Pause, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [displayLimit, setDisplayLimit] = useState(12);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollObserverRef = useRef<HTMLDivElement>(null);
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

  // Featured track (first trending track)
  const featuredTrack = trendingTracks[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Featured Artist Spotlight */}
      {featuredTrack && (
        <section className="py-20 md:py-32 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Left: MASSIVE Typography */}
              <div className="lg:col-span-3">
                <div className="inline-block px-4 py-2 bg-cyan-500 text-white text-sm font-bold rounded-full mb-6">
                  FEATURED ARTIST
                </div>
                
                <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-none">
                  {featuredTrack.title}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 mb-8">
                  {featuredTrack.genre}
                </p>
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => handlePlayTrack(featuredTrack.id, trendingTracks)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-lg px-8 py-6 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Play Now
                  </Button>
                </div>
              </div>

              {/* Right: Album Artwork */}
              <div className="lg:col-span-2">
                <div className="aspect-square bg-gray-200 rounded-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <svg
                    className="w-32 h-32 text-gray-400"
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
                className="bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-cyan-500 transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border-2 border-black flex-shrink-0 flex items-center justify-center">
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
                    <p className="text-gray-600 mb-4">{track.artistName}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, trendingTracks)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-12 h-12 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                      <Play className="w-5 h-5" />
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
                className="bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-cyan-500 transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border-2 border-black flex-shrink-0 flex items-center justify-center">
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
                    <p className="text-gray-600 mb-4">{track.artistName}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, newReleases)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-12 h-12 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                      <Play className="w-5 h-5" />
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
                className="bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-cyan-500 transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border-2 border-black flex-shrink-0 flex items-center justify-center">
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
                    <p className="text-gray-600 mb-4">{track.artistName}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, picksForYou)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-12 h-12 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                      <Play className="w-5 h-5" />
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
          
          {/* Genre Pills */}
          <div className="flex flex-wrap gap-3 mb-12">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-6 py-3 rounded-full text-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  selectedGenre === genre
                    ? "bg-cyan-500 text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Endless Scroll Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {endlessScrollTracks.slice(0, displayLimit).map((track) => (
              <div
                key={track.id}
                className="bg-white border-2 border-black rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-cyan-500 transition-all"
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg border-2 border-black flex-shrink-0 flex items-center justify-center">
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
                    <p className="text-gray-600 mb-4">{track.artistName}</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                      {track.genre}
                    </span>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center">
                    <Button
                      onClick={() => handlePlayTrack(track.id, endlessScrollTracks)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-12 h-12 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    >
                      <Play className="w-5 h-5" />
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
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mini-Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4 z-50">
          <div className="container mx-auto flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 bg-gray-200 rounded-lg border-2 border-black flex-shrink-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg truncate">{currentTrack.title}</h4>
                <p className="text-gray-600 text-sm truncate">{currentTrack.artistName}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                onClick={isPlaying ? handlePauseTrack : () => setIsPlaying(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-12 h-12 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={() => setCurrentTrack(null)}
                variant="outline"
                className="rounded-full w-10 h-10 p-0 border-2 border-black"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
