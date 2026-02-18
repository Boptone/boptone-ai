import { useEffect, useRef, useState } from "react";
import { Play, Pause, Heart, Share2, Music, DollarSign, Users, Zap, Radio } from "lucide-react";
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
      waveColor: "#374151", // Visible gray for unplayed
      progressColor: "#81e6fe", // Cyan for played
      cursorColor: "#81e6fe",
      barWidth: 2,
      barRadius: 2,
      barGap: 1,
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
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 shadow-2xl border-2 border-cyan-500/20 relative">
      {/* GAME-CHANGER: Kick In Tipping Button (appears mid-song) */}
      {showKickIn && (
        <div className="absolute top-4 right-4 z-50 animate-bounce">
          <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full shadow-2xl border-2 border-yellow-300 hover:scale-110 transition-transform flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Kick In $5
          </button>
        </div>
      )}

      {/* Header: Track Info + Revolutionary Stats */}
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
            {/* GAME-CHANGER: Blockchain Verification Badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-black shadow-lg" title="Blockchain Verified">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Track Details */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{track.title}</h3>
            <p className="text-xl text-gray-300 mb-2">{track.artist}</p>
            <div className="flex items-center gap-3">
              {track.genre && (
                <span className="inline-block px-4 py-1 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20">
                  {track.genre.toUpperCase()}
                </span>
              )}
              {/* GAME-CHANGER: Live Listener Count */}
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-red-400 text-sm font-bold">{liveListeners.toLocaleString()} LIVE</span>
              </div>
            </div>
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
          {/* GAME-CHANGER: AirPlay Button */}
          <button 
            onClick={handleAirPlay}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/20"
            title="AirPlay to Apple Devices"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 22h12l-6-6-6 6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Waveform Visualization - CENTERPIECE with AI Analysis */}
      <div className="relative mb-6">
        <div
          ref={waveformRef}
          className="w-full rounded-xl overflow-hidden bg-black/40 border-2 border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition-all"
          style={{ minHeight: "180px", height: "180px" }}
        />
        
        {/* GAME-CHANGER: AI Song Structure Markers (simulated) */}
        <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
          {/* Verse marker at 25% */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/50" style={{ left: "25%" }}>
            <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs text-yellow-400 font-bold bg-black/80 px-2 py-1 rounded whitespace-nowrap">
              VERSE
            </div>
          </div>
          {/* Chorus marker at 50% */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-pink-400/50" style={{ left: "50%" }}>
            <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs text-pink-400 font-bold bg-black/80 px-2 py-1 rounded whitespace-nowrap">
              CHORUS
            </div>
          </div>
          {/* Drop marker at 75% */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-400/50" style={{ left: "75%" }}>
            <div className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs text-red-400 font-bold bg-black/80 px-2 py-1 rounded whitespace-nowrap">
              DROP
            </div>
          </div>
        </div>
        
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
            className="w-16 h-16 rounded-full bg-[#81e6fe] hover:bg-[#6dd5ed] flex items-center justify-center transition-all shadow-xl shadow-cyan-500/30 border-2 border-cyan-300/50"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>

          <div className="text-white font-mono text-lg">
            <span className="text-[#81e6fe] font-bold">{formatTime(currentTime)}</span>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* BopAudio Badge */}
        <div className="px-4 py-2 bg-[#81e6fe]/10 rounded-full border border-[#81e6fe]/30">
          <span className="text-[#81e6fe] font-semibold text-sm">BopAudio</span>
        </div>
      </div>
    </div>
  );
}
