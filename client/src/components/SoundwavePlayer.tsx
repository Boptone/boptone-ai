import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Heart, Share2, Music, SkipBack, SkipForward, Shuffle, Volume2, List, Radio, Zap, Bluetooth, Speaker } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
  const [liveListeners, setLiveListeners] = useState(847);
  const [showKickIn, setShowKickIn] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  
  // Mobile gesture controls
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

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
      setTimeout(() => setShowKickIn(false), 8000);
    }
  }, [currentTime, showKickIn]);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#9ca3af",
      progressColor: "#81e6fe",
      cursorColor: "#81e6fe",
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 100,
      normalize: true,
      backend: "WebAudio",
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.load(track.audioUrl);

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

  // Mobile gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;

    // Horizontal swipes (left/right for prev/next)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe left - next track
        toast.info("⏭️ Next track");
        // TODO: Implement next track functionality
      } else {
        // Swipe right - previous track
        toast.info("⏮️ Previous track");
        // TODO: Implement previous track functionality
      }
    }
    // Vertical swipe up for queue
    else if (deltaY > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
      // Swipe up - open queue
      toast.info("📋 Opening queue...");
      // TODO: Implement queue panel
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAirPlay = () => {
    const video = document.createElement('video');
    video.src = track.audioUrl;
    if ('webkitShowPlaybackTargetPicker' in video) {
      (video as any).webkitShowPlaybackTargetPicker();
    } else {
      alert("AirPlay is only supported on Apple devices with Safari browser");
    }
  };

  const handleConnectSpeaker = async () => {
    try {
      if ('bluetooth' in navigator) {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ services: ['audio_sink'] }],
          optionalServices: ['battery_service']
        });
        setConnectedDevice(device.name || 'Bluetooth Speaker');
      } else if ('mediaDevices' in navigator) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        if (audioOutputs.length > 0) {
          alert('Audio output devices detected. Use your system settings to select a speaker.');
        } else {
          alert('No external speakers detected. Please connect a Bluetooth speaker or use system audio settings.');
        }
      } else {
        alert('Speaker connectivity is not supported in this browser. Try Chrome or Edge.');
      }
    } catch (error) {
      console.error('Speaker connection error:', error);
      alert('Failed to connect to speaker. Make sure Bluetooth is enabled.');
    }
  };

  const disconnectSpeaker = () => {
    setConnectedDevice(null);
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden shadow-2xl" 
      style={{ minHeight: "320px" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* IMMERSIVE: Full-bleed artwork background with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: track.artworkUrl ? `url(${track.artworkUrl})` : 'none',
          filter: 'blur(40px) brightness(0.3)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Solid black overlay */}
      <div className="absolute inset-0 bg-black" style={{ opacity: 0.85 }} />

      {/* GAME-CHANGER: Kick In Tipping Button */}
      {showKickIn && (
        <KickInButton track={track} />
      )}

      {/* Main Content */}
      <div className="relative z-10 p-8 flex flex-col items-center justify-center" style={{ minHeight: "400px" }}>
        {/* Hero Artwork */}
        <div className="relative group mb-6">
          {track.artworkUrl ? (
            <img
              src={track.artworkUrl}
              alt={track.title}
              className={`w-40 h-40 rounded-2xl object-cover shadow-2xl border-4 ${isPlaying ? 'border-[#81e6fe] animate-pulse' : 'border-white/20'} transition-all duration-300`}
            />
          ) : (
            <div className={`w-40 h-40 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl border-4 ${isPlaying ? 'border-[#81e6fe] animate-pulse' : 'border-white/20'}`}>
              <Music className="w-20 h-20 text-white" />
            </div>
          )}
          {/* Blockchain Verification Badge */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-black shadow-xl" title="Blockchain Verified">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          {isPlaying && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-6 max-w-2xl">
          <h2 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">{track.title}</h2>
          <p className="text-2xl text-white/80 mb-4">{track.artist}</p>
          <div className="flex items-center justify-center gap-3">
            {track.genre && (
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20">
                {track.genre.toUpperCase()}
              </span>
            )}
            {/* Live Listener Count */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-500/30">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-red-300 text-sm font-bold">{liveListeners.toLocaleString()} LIVE</span>
            </div>
          </div>
        </div>

        {/* Waveform */}
        <div className="w-full max-w-3xl mb-4">
          <div
            ref={waveformRef}
            className="w-full rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10 cursor-pointer hover:border-[#81e6fe]/50 transition-all"
            style={{ minHeight: "60px", height: "60px" }}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3 md:gap-4 mb-3">
          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <SkipBack className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-[#81e6fe] hover:bg-[#6dd5ed] flex items-center justify-center transition-all shadow-2xl hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>

          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <SkipForward className="w-5 h-5 text-white" />
          </button>

          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <Shuffle className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Time Display */}
        <div className="text-lg font-mono text-white/80 mb-6">
          <span className="text-[#81e6fe] font-bold">{formatTime(currentTime)}</span>
          <span className="text-white/40 mx-2">/</span>
          <span className="text-white/60">{formatTime(duration)}</span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={handleAirPlay}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20"
            title="AirPlay to Apple Devices"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 22h12l-6-6-6 6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
          {connectedDevice ? (
            <button 
              onClick={disconnectSpeaker}
              className="w-10 h-10 rounded-full bg-[#81e6fe]/30 backdrop-blur-sm hover:bg-[#81e6fe]/40 flex items-center justify-center transition-all border border-[#81e6fe]/50"
              title={`Connected to ${connectedDevice}`}
            >
              <Speaker className="w-5 h-5 text-[#81e6fe]" />
            </button>
          ) : (
            <button 
              onClick={handleConnectSpeaker}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20"
              title="Connect to Bluetooth/Sonos Speaker"
            >
              <Bluetooth className="w-5 h-5 text-white" />
            </button>
          )}
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all border border-white/20">
            <List className="w-5 h-5 text-white" />
          </button>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-2">
            <Volume2 className="w-5 h-5 text-white/80" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#81e6fe]"
            />
          </div>
        </div>
      </div>

      {/* BopAudio Badge with Favicon */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2">
        <img src="/favicon-48.png" alt="Boptone" className="w-8 h-8" />
        <div className="px-3 py-1.5 bg-[#81e6fe]/20 backdrop-blur-sm rounded-full border border-[#81e6fe]/30">
          <span className="text-[#81e6fe] font-semibold text-sm">BopAudio</span>
        </div>
      </div>
    </div>
  );
}

// Kick In Button Component with Stripe Integration
function KickInButton({ track }: { track: Track }) {
  const createTipCheckout = trpc.kickin.createStripeTipCheckout.useMutation();

  const handleKickIn = async () => {
    try {
      toast.info("Opening payment checkout...");
      
      const result = await createTipCheckout.mutateAsync({
        artistId: 1, // TODO: Get actual artist ID from track
        artistName: track.artist,
        trackTitle: track.title,
        amount: 5,
      });

      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank");
        toast.success("Checkout opened in new tab!");
      }
    } catch (error) {
      console.error("Kick In error:", error);
      toast.error("Failed to open checkout. Please try again.");
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 animate-bounce">
      <button 
        onClick={handleKickIn}
        disabled={createTipCheckout.isPending}
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-full shadow-2xl border border-green-400 hover:scale-110 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#008000' }}
      >
        <Zap className="w-5 h-5" />
        {createTipCheckout.isPending ? "Opening..." : "Kick In $5"}
      </button>
    </div>
  );
}
