import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Heart, Share2, Music } from "lucide-react";

interface Track {
  id: number;
  title: string;
  artist: string;
  audioUrl: string;
  artworkUrl?: string | null;
  genre?: string | null;
}

interface SoundwavePlayerProps {
  track: Track;
  autoPlay?: boolean;
}

export function SoundwavePlayer({ track, autoPlay = false }: SoundwavePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const audio = audioRef.current;
    
    // Create audio context and analyser
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Connect audio element to analyser
    if (!sourceRef.current) {
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = source;
    }
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Draw soundwave visualization
  const drawSoundwave = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with white background for better contrast
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate bar width and spacing
      const barCount = 50; // Fewer, thicker bars for better visibility
      const barWidth = canvas.width / barCount;
      const barSpacing = 2;

      // Draw bars with gradient
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const normalizedHeight = dataArray[dataIndex] / 255;
        const barHeight = normalizedHeight * canvas.height * 0.9; // 90% max height
        
        // Create dynamic gradient based on audio intensity
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        
        if (isPlaying) {
          // Electrified cyan blue gradient when playing (#06B6D4)
          const intensity = normalizedHeight;
          
          // Add glow effect
          ctx.shadowBlur = 15 + (intensity * 10);
          ctx.shadowColor = '#06B6D4';
          
          // Vibrant gradient
          gradient.addColorStop(0, `rgba(6, 182, 212, ${1.0})`);
          gradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.95})`);
          gradient.addColorStop(1, `rgba(6, 182, 212, ${0.85 + intensity * 0.15})`);
        } else {
          // Visible but muted cyan when paused
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'rgba(6, 182, 212, 0.3)';
          
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.4)');
        }

        ctx.fillStyle = gradient;
        
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        const width = barWidth - barSpacing;
        const height = Math.max(barHeight, 10); // Minimum height of 10px for visibility

        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 1.5);
        ctx.fill();
      }

      // Draw progress line
      const progressX = (currentTime / duration) * canvas.width;
      if (progressX > 0) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, canvas.height);
        ctx.stroke();
      }
    };

    draw();
  };

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (isPlaying) {
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        setIsPlaying(false);
      });
      
      drawSoundwave();
    } else {
      audio.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isPlaying]);

  // Load new track
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.src = track.audioUrl;
    setCurrentTime(0);
    setIsPlaying(autoPlay);

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track, autoPlay]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl p-8">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Left: Artwork + Controls */}
        <div className="flex-shrink-0 flex flex-col items-center gap-6">
          {/* Artwork */}
          <div className="relative">
            {track.artworkUrl ? (
              <img
                src={track.artworkUrl}
                alt={track.title}
                className="w-48 h-48 rounded-2xl object-cover border-4 border-white shadow-2xl"
              />
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-cyan-500 border-4 border-white shadow-2xl flex items-center justify-center">
                <Music className="w-20 h-20 text-white" />
              </div>
            )}
            {/* Pulsing indicator when playing */}
            {isPlaying && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg" />
            )}
          </div>

          {/* Large Play/Pause Button */}
          <Button 
            className="rounded-full w-20 h-20 bg-black hover:bg-gray-800 shadow-xl hover:shadow-2xl transition-all hover:scale-105" 
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-10 w-10 text-white" fill="white" />
            ) : (
              <Play className="h-10 w-10 text-white ml-1" fill="white" />
            )}
          </Button>
        </div>

        {/* Right: Track Info + Soundwave */}
        <div className="flex-1 w-full min-w-0">
          {/* Track Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-4xl text-black truncate mb-2 leading-tight">{track.title}</h3>
                <p className="text-2xl text-gray-600 font-medium truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {track.genre && (
              <Badge className="rounded-full border-2 border-black bg-white text-black font-bold uppercase text-sm px-4 py-1">
                {track.genre}
              </Badge>
            )}
          </div>

          {/* Soundwave Canvas */}
          <div className="relative mb-4">
            <canvas
              ref={canvasRef}
              width={1000}
              height={120}
              className="w-full h-32 rounded-xl shadow-inner cursor-pointer"
              onClick={(e) => {
                if (!audioRef.current || !canvasRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                audioRef.current.currentTime = percentage * duration;
              }}
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-lg text-gray-700 font-mono font-bold">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-400">•</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
