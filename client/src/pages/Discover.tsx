import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Heart, Share2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  // Fetch tracks from BAP router
  const { data: allTracks = [] } = trpc.bap.discover.trending.useQuery({
    limit: 100,
    genre: selectedGenre === "ALL" ? undefined : selectedGenre,
  });

  // Get featured artist (first track)
  const featuredArtist = allTracks[0];

  // Get discovery tracks (skip first, show up to displayLimit)
  const discoveryTracks = allTracks.slice(1, displayLimit + 1);

  // Genre list
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

  // Endless scroll observer
  useEffect(() => {
    if (selectedGenre !== "ALL") {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && displayLimit < 100) {
            setDisplayLimit((prev) => Math.min(prev + 12, 100));
          }
        },
        { threshold: 0.1 }
      );

      if (scrollObserverRef.current) {
        observer.observe(scrollObserverRef.current);
      }

      return () => observer.disconnect();
    }
  }, [selectedGenre, displayLimit]);

  // Reset display limit when genre changes
  useEffect(() => {
    setDisplayLimit(12);
  }, [selectedGenre]);

  const handlePlayTrack = (trackId: number) => {
    const track = allTracks.find((t) => t.id === trackId);
    console.log('[handlePlayTrack] trackId:', trackId, 'track:', track);
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(true);
      console.log('[handlePlayTrack] currentTrack set to:', track);
      toast.success(`Now playing: ${track.title}`);
    } else {
      console.error('[handlePlayTrack] Track not found for ID:', trackId);
    }
  };

  const handleSupportArtist = (artistName: string) => {
    toast.info(`Support feature coming soon for ${artistName}!`);
  };

  const handleShare = (trackTitle: string) => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(`Link copied for "${trackTitle}"!`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO: Featured Artist Spotlight */}
      {featuredArtist && (
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Featured Badge */}
              <div className="inline-block">
                <span className="px-4 py-2 bg-cyan-500 text-black font-bold text-sm rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  FEATURED ARTIST
                </span>
              </div>

              {/* Artist Name */}
              <h1 className="text-6xl md:text-8xl font-extrabold leading-tight">
                {featuredArtist.artist}
              </h1>

              {/* Genre Badge */}
              <div className="inline-block">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-cyan-500 font-semibold text-sm rounded-full border border-cyan-500">
                  {featuredArtist.genre}
                </span>
              </div>

              {/* Featured Track */}
              <div className="flex flex-col items-center gap-6 pt-8">
                {/* Album Artwork */}
                <div className="w-64 h-64 rounded-2xl border-2 border-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
                  {featuredArtist.coverArtUrl ? (
                    <img
                      src={featuredArtist.coverArtUrl}
                      alt={featuredArtist.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Music className="w-24 h-24 text-white opacity-50" />
                    </div>
                  )}
                </div>

                {/* Track Title */}
                <h2 className="text-3xl font-bold">{featuredArtist.title}</h2>

                {/* CTAs */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handlePlayTrack(featuredArtist.id)}
                    className="px-8 py-6 bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-lg rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Now
                  </Button>
                  <Button
                    onClick={() => handleSupportArtist(featuredArtist.artist)}
                    variant="outline"
                    className="px-8 py-6 bg-transparent hover:bg-white hover:text-black text-white font-bold text-lg rounded-full border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] transition-all"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Support Artist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GENRE NAVIGATION */}
      <section className="bg-white border-b-2 border-black sticky top-0 z-40">
        <div className="container py-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-6 py-3 font-bold text-sm rounded-full border-2 border-black whitespace-nowrap transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                  selectedGenre === genre
                    ? "bg-cyan-500 text-black"
                    : "bg-white text-black hover:bg-gray-50"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DISCOVERY ENGINE: Artists You Need to Hear */}
      <section className="container py-16">
        <div className="mb-12">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4">
            {selectedGenre === "ALL" ? "Discover Artists" : `${selectedGenre} Artists`}
          </h2>
          <p className="text-xl text-gray-600">
            Curated music from artists building sustainable careers
          </p>
        </div>

        {/* Artist Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {discoveryTracks.map((track) => (
            <div
              key={track.id}
              className="group relative bg-white border-2 border-black rounded-2xl overflow-hidden hover:border-cyan-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(6,182,212,0.3)]"
            >
              {/* Album Artwork */}
              <div className="aspect-square relative overflow-hidden">
                {track.coverArtUrl ? (
                  <img
                    src={track.coverArtUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Music className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handlePlayTrack(track.id)}
                    className="w-16 h-16 rounded-full bg-cyan-500 border-2 border-black flex items-center justify-center hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Play className="w-7 h-7 text-black ml-1" />
                  </button>
                </div>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(track.title)}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Share2 className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Track Info */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg line-clamp-1">{track.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">{track.artist}</p>
                </div>

                {/* Genre Badge */}
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-300">
                  {track.genre}
                </span>

                {/* Support Button */}
                <Button
                  onClick={() => handleSupportArtist(track.artist)}
                  variant="outline"
                  className="w-full border-2 border-black rounded-full font-bold hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Support
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Observer for Endless Loading */}
        {selectedGenre !== "ALL" && displayLimit < 100 && (
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
      </section>

      {/* MINI-PLAYER (Bottom Bar) */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black">
          <div className="container py-4">
            <div className="flex items-center gap-6">
              {/* Track Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-lg border-2 border-black flex-shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
                  <h4 className="font-bold text-base truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Play/Pause Button */}
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-600 border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black ml-0.5" />
                )}
              </Button>

              {/* Support Artist CTA */}
              <Button
                onClick={() => handleSupportArtist(currentTrack.artist)}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Support Artist
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
