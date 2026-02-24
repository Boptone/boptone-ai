import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Play, Pause, Heart, X } from "lucide-react";
import { toast } from "sonner";

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [displayLimit, setDisplayLimit] = useState(12);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  // tRPC queries
  const { data: trendingTracks = [] } = trpc.bap.discover.trending.useQuery({
    limit: 100,
    genre: selectedGenre === "ALL" ? undefined : selectedGenre,
  });

  const { data: newReleases = [] } = trpc.bap.discover.newReleases.useQuery({
    limit: 100,
    genre: selectedGenre === "ALL" ? undefined : selectedGenre,
  });

  // Combine and deduplicate tracks
  const allTracks = [
    ...trendingTracks,
    ...newReleases.filter(
      (nr) => !trendingTracks.some((tt) => tt.id === nr.id)
    ),
  ];

  // Reset display limit when genre changes
  useEffect(() => {
    setDisplayLimit(12);
  }, [selectedGenre]);

  // Endless scroll observer
  useEffect(() => {
    if (!scrollObserverRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayLimit < allTracks.length) {
          setDisplayLimit((prev) => Math.min(prev + 12, 100));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(scrollObserverRef.current);
    return () => observer.disconnect();
  }, [displayLimit, allTracks.length]);

  const handlePlayTrack = (trackId: number) => {
    const track = allTracks.find((t) => t.id === trackId);
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(true);
      toast.success(`Now playing: ${track.title}`);
    }
  };

  const handlePauseTrack = () => {
    setIsPlaying(false);
  };

  const handleSupportArtist = (artistName: string) => {
    toast.info(`Support feature coming soon for ${artistName}!`);
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

  // Discovery tracks (remaining tracks, limited by displayLimit)
  const discoveryTracks = allTracks.slice(1, displayLimit);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Featured Artist Spotlight */}
      {featuredTrack && (
        <section className="py-20 md:py-32 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Left: MASSIVE Typography */}
              <div className="lg:col-span-3">
                <div className="inline-block px-4 py-2 bg-cyan-500 text-white text-sm font-semibold uppercase tracking-wide rounded-full mb-6">
                  Featured Artist
                </div>
                <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-none">
                  {featuredTrack.artistName}
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-700 mb-6">
                  {featuredTrack.title}
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                  {featuredTrack.genre} • {Math.floor(Math.random() * 10) + 1}K plays
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600 text-lg h-14 px-8 border-2 border-black transition-colors"
                    style={{ boxShadow: "4px 4px 0 0 black" }}
                    onClick={() => handlePlayTrack(featuredTrack.id)}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-2 border-black text-lg h-14 px-8 hover:bg-gray-50 transition-colors"
                    style={{ boxShadow: "4px 4px 0 0 black" }}
                    onClick={() => handleSupportArtist(featuredTrack.artistName)}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Support Artist
                  </Button>
                </div>
              </div>

              {/* Right: Large Album Artwork */}
              <div className="lg:col-span-2">
                <div
                  className="w-full aspect-square max-w-md mx-auto rounded-lg border-2 border-black bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
                  style={{ boxShadow: "8px 8px 0 0 black" }}
                >
                  <div className="text-white text-6xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-32 h-32"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Genre Navigation - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-black">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`flex-shrink-0 px-6 py-3 rounded-full border-2 border-black text-base font-semibold transition-all ${
                  selectedGenre === genre
                    ? "bg-cyan-500 text-white shadow-[4px_4px_0px_0px_black]"
                    : "bg-white text-black shadow-[2px_2px_0px_0px_black] hover:shadow-[4px_4px_0px_0px_black]"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Discovery Grid - 2-Column Generous Spacing */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-16">
            {selectedGenre === "ALL" ? "Discover Music" : `${selectedGenre} Artists`}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {discoveryTracks.map((track) => (
              <div
                key={track.id}
                className="border-2 border-black rounded-lg p-8 bg-white hover:bg-gray-50 transition-colors"
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                <div className="flex gap-6">
                  {/* Album Artwork */}
                  <div
                    className="w-48 h-48 flex-shrink-0 rounded-lg border-2 border-black bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
                    style={{ boxShadow: "2px 2px 0 0 black" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-16 h-16 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                      />
                    </svg>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 truncate">
                        {track.artistName}
                      </h3>
                      <p className="text-xl text-gray-700 mb-3 truncate">
                        {track.title}
                      </p>
                      <span className="inline-block px-3 py-1 bg-cyan-500 text-white text-sm font-semibold uppercase tracking-wide rounded-full">
                        {track.genre}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handlePlayTrack(track.id)}
                        className="w-14 h-14 rounded-full bg-cyan-500 border-2 border-black flex items-center justify-center hover:bg-cyan-600 transition-colors"
                        style={{ boxShadow: "2px 2px 0 0 black" }}
                      >
                        <Play className="w-6 h-6 text-white" />
                      </button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-full border-2 border-black hover:bg-gray-100 transition-colors"
                        style={{ boxShadow: "2px 2px 0 0 black" }}
                        onClick={() => handleSupportArtist(track.artistName)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Support
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Observer for Endless Loading */}
          {selectedGenre !== "ALL" && displayLimit < allTracks.length && (
            <div ref={scrollObserverRef} className="flex justify-center py-12">
              <div className="flex items-center gap-2 text-gray-500">
                <div
                  className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mini-Player (Fixed Bottom Bar) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-6">
              {/* Track Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="w-14 h-14 rounded-lg border-2 border-black flex-shrink-0 bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
                  style={{ boxShadow: "2px 2px 0 0 black" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold truncate">{currentTrack.title}</p>
                  <p className="text-base text-gray-700 truncate">
                    {currentTrack.artistName}
                  </p>
                </div>
              </div>

              {/* Play Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={isPlaying ? handlePauseTrack : () => handlePlayTrack(currentTrack.id)}
                  className="w-12 h-12 rounded-full bg-cyan-500 border-2 border-black flex items-center justify-center hover:bg-cyan-600 transition-colors"
                  style={{ boxShadow: "2px 2px 0 0 black" }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
                <Button
                  variant="outline"
                  className="rounded-full border-2 border-black px-6 hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: "2px 2px 0 0 black" }}
                  onClick={() => handleSupportArtist(currentTrack.artistName)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Support Artist
                </Button>
                <button
                  onClick={() => setCurrentTrack(null)}
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
