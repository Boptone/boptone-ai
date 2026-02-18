import { useEffect, useRef, useState } from "react";
import { Play, Pause, Heart, Share2, Music, SkipBack, SkipForward, Shuffle, Volume2, List, Radio, Zap } from "lucide-react";
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
  const [volume, setVolume] = useState(0.7);
  
  // GAME-CHANGING FEATURES
  const [liveListeners, setLiveListeners] = useState(847); // Simulated live count
  const [showKickIn, setShowKickIn] = useState(false); // Tipping modal

  // Simulate live listener count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveListeners(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show "Kick In" button at 30 seconds
  useEffect(() => {
    if (currentTime >= 30 && currentTime <= 35 && !showKickIn) {
      setShowKickIn(true);
      setTimeout(() => setShowKickIn(false), 8000); // Show for 8 seconds
    }
  }, [currentTime, showKickIn]);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer with visible waveform
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#9ca3af", // Gray for unplayed
      progressColor: "#81e6fe", // Cyan for played
      cursorColor: "#81e6fe",
      barWidth: 2,
      barRadius: 2,
      barGap: 1,
      height: 60,
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

    // Add click-to-seek functionality
    wavesurfer.on("interaction", () => {
      if (wavesurferRef.current) {
        setCurrentTime(wavesurferRef.current.getCurrentTime());
      }
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [track.audioUrl, autoPlay]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAirPlay = () => {
    // AirPlay functionality (requires native browser support)
    const video = document.createElement('video');
    video.src = track.audioUrl;
    if ('webkitShowPlaybackTargetPicker' in video) {
      (video as any).webkitShowPlaybackTargetPicker();
    } else {
      alert("AirPlay is only supported on Apple devices with Safari browser");
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 rounded-xl p-4 shadow-lg border border-gray-200/50 relative">
      {/* GAME-CHANGER: Kick In Tipping Button (appears mid-song) */}
      {showKickIn && (
        <div className="absolute -top-12 right-4 z-50 animate-bounce">
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full shadow-2xl border-2 border-yellow-300 hover:scale-110 transition-transform flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            Kick In $5
          </button>
        </div>
      )}

      {/* Compact Horizontal Layout */}
      <div className="flex items-center gap-4">
        {/* Left: Artwork + Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          {/* Artwork */}
          <div className="relative group flex-shrink-0">
            {track.artworkUrl ? (
              <img
                src={track.artworkUrl}
                alt={track.title}
                className="w-14 h-14 rounded-lg object-cover shadow-md border border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md border border-gray-200">
                <Music className="w-7 h-7 text-white" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg" />
            )}
            {/* GAME-CHANGER: Blockchain Verification Badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md" title="Blockchain Verified">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Track Info */}
          <div className="min-w-0 flex-shrink-0" style={{ width: "200px" }}>
            <h4 className="text-sm font-bold text-gray-900 truncate">{track.title}</h4>
            <p className="text-xs text-gray-600 truncate">{track.artist}</p>
            <div className="flex items-center gap-2 mt-1">
              {track.genre && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                  {track.genre.toUpperCase()}
                </span>
              )}
              {/* GAME-CHANGER: Live Listener Count */}
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-full border border-red-200">
                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="text-red-600 text-xs font-bold">{liveListeners.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls + Waveform */}
        <div className="flex-1 min-w-0">
          {/* Controls Row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Prev */}
            <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
              <SkipBack className="w-4 h-4 text-gray-700" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-[#81e6fe] hover:bg-[#6dd5ed] flex items-center justify-center transition-all shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-black" />
              ) : (
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
              <SkipForward className="w-4 h-4 text-gray-700" />
            </button>

            {/* Shuffle */}
            <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
              <Shuffle className="w-4 h-4 text-gray-700" />
            </button>

            {/* Time Display */}
            <div className="text-xs font-mono text-gray-700 ml-2">
              <span className="text-[#81e6fe] font-bold">{formatTime(currentTime)}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-500">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Waveform */}
          <div
            ref={waveformRef}
            className="w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-200 cursor-pointer hover:border-[#81e6fe]/50 transition-all"
            style={{ minHeight: "60px", height: "60px" }}
          />
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
            <Heart className="w-4 h-4 text-gray-700" />
          </button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
          <button 
            onClick={handleAirPlay}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
            title="AirPlay to Apple Devices"
          >
            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 22h12l-6-6-6 6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
            <List className="w-4 h-4 text-gray-700" />
          </button>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-2">
            <Volume2 className="w-4 h-4 text-gray-700 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#81e6fe]"
            />
          </div>
        </div>
      </div>

      {/* BopAudio Badge */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-[#81e6fe]/10 rounded-full border border-[#81e6fe]/30">
        <span className="text-[#81e6fe] font-semibold text-xs">BopAudio</span>
      </div>
    </div>
  );
}
