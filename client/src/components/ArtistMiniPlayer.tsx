import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Music } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ArtistMiniPlayerProps {
  artistId: number;
  themeColor?: string;
}

export function ArtistMiniPlayer({ artistId, themeColor = "#06b6d4" }: ArtistMiniPlayerProps) {
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch artist's tracks
  const { data: tracks, isLoading } = trpc.music.getArtistTracks.useQuery({
    artistId,
    limit: 10,
  });

  const handlePlayTrack = (trackId: number) => {
    if (currentTrackId === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrackId(trackId);
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-black shadow-[4px_4px_0px_0px_black]">
        <CardContent className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008B8B]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Card className="rounded-xl border border-black shadow-[4px_4px_0px_0px_black]">
        <CardContent className="p-8">
          <div className="text-center py-12">
            <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">No tracks available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-black shadow-[4px_4px_0px_0px_black]">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Music className="h-6 w-6 text-[#008B8B]" />
          Tracks on BopAudio
        </h2>
        
        <div className="space-y-3">
          {tracks.map((track: any, index: number) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-black bg-white hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black]"
            >
              {/* Track Number */}
              <div className="w-8 text-center">
                <span className="text-sm font-bold text-gray-600">{index + 1}</span>
              </div>

              {/* Album Artwork */}
              <div className="w-12 h-12 rounded-lg border border-black shadow-[2px_2px_0px_0px_black] flex-shrink-0 overflow-hidden">
                {track.coverArtUrl ? (
                  <img
                    src={track.coverArtUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Music className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{track.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {track.genre && (
                    <span className="px-2 py-0.5 rounded-full bg-[#008B8B] text-white text-xs font-bold border border-black">
                      {track.genre.toUpperCase()}
                    </span>
                  )}
                  <span>{formatDuration(track.duration)}</span>
                </div>
              </div>

              {/* Play Button */}
              <Button
                size="icon"
                className="rounded-full w-10 h-10 bg-[#008B8B] hover:bg-[#006666] border border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all flex-shrink-0"
                onClick={() => handlePlayTrack(track.id)}
              >
                {currentTrackId === track.id && isPlaying ? (
                  <Pause className="h-4 w-4 text-black" />
                ) : (
                  <Play className="h-4 w-4 text-black ml-0.5" />
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* View All Tracks Link */}
        {tracks.length >= 10 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="rounded-full border border-black shadow-[2px_2px_0px_0px_black] hover:shadow-[1px_1px_0px_0px_black] transition-all font-bold"
              onClick={() => (window.location.href = "/music")}
            >
              View All Tracks on BopAudio
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
