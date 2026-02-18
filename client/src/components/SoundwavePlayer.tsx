import { useEffect, useRef, useState } from "react";
import { Play, Pause, Heart, Share2, Music } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string | null;
  artworkUrl: string | null;
  audioUrl: string;
  duration: number;
}

interface SoundwavePlayerProps {
  track: Track;
  autoPlay?: boolean;
}

export default function SoundwavePlayer({ track, autoPlay = false }: SoundwavePlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#1f2937",
      progressColor: "#81e6fe",
      cursorColor: "#81e6fe",
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 180,
      normalize: true,
      backend: "WebAudio",
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(track.audioUrl);

    // Event listeners
    wavesurfer.on("ready", () => {
      setDuration(wavesurfer.getDuration());
      if (autoPlay) {
        wavesurfer.play();
        setIsPlaying(true);
      }
    });

    wavesurfer.on("audioprocess", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurfer.destroy();
    };
  }, [track.audioUrl, autoPlay]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 shadow-2xl border-2 border-cyan-500/20">
      {/* Header: Track Info + Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          {/* Artwork */}
          <div className="relative group">
            {track.artworkUrl ? (
              <img
                src={track.artworkUrl}
                alt={track.title}
                className="w-24 h-24 rounded-xl object-cover shadow-xl border-2 border-cyan-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl border-2 border-cyan-500/30">
                <Music className="w-12 h-12 text-white" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
            )}
          </div>

          {/* Track Details */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{track.title}</h3>
            <p className="text-xl text-gray-300 mb-2">{track.artist}</p>
            {track.genre && (
              <span className="inline-block px-4 py-1 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20">
                {track.genre.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Waveform Visualization - CENTERPIECE */}
      <div className="relative mb-6">
        <div
          ref={waveformRef}
          className="w-full rounded-xl overflow-hidden bg-black/40 border-2 border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition-all"
          style={{ minHeight: "180px" }}
        />
        
        {/* Grid Overlay for Pro Feel */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(129, 230, 254, 0.1) 25%, rgba(129, 230, 254, 0.1) 26%, transparent 27%, transparent 74%, rgba(129, 230, 254, 0.1) 75%, rgba(129, 230, 254, 0.1) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(129, 230, 254, 0.1) 25%, rgba(129, 230, 254, 0.1) 26%, transparent 27%, transparent 74%, rgba(129, 230, 254, 0.1) 75%, rgba(129, 230, 254, 0.1) 76%, transparent 77%, transparent)
            `,
            backgroundSize: "40px 40px"
          }} />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        {/* Play Button + Time */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 flex items-center justify-center transition-all shadow-xl shadow-cyan-500/30 border-2 border-cyan-300/50"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>

          <div className="text-white font-mono text-lg">
            <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* BopAudio Badge */}
        <div className="px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30">
          <span className="text-cyan-400 font-semibold text-sm">BopAudio</span>
        </div>
      </div>
    </div>
  );
}
