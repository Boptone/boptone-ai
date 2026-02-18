import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface Track {
  id: number;
  title: string;
  artist: string;
  audioUrl: string;
  artworkUrl?: string;
  genre?: string;
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

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate bar width and spacing
      const barCount = 64; // Number of bars to display
      const barWidth = canvas.width / barCount;
      const barSpacing = 2;

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const barHeight = (dataArray[dataIndex] / 255) * canvas.height;
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#4B5563');

        ctx.fillStyle = isPlaying ? gradient : '#E5E7EB';
        
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        const width = barWidth - barSpacing;
        const height = Math.max(barHeight, 4); // Minimum height of 4px

        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 2);
        ctx.fill();
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
    <div className="relative w-full h-full flex items-center gap-6 p-8">
      {/* Artwork */}
      <div className="relative flex-shrink-0 group">
        <img
          src={track.artworkUrl || `https://via.placeholder.com/160x160?text=${encodeURIComponent(track.title)}`}
          alt={track.title}
          className="w-40 h-40 rounded-xl object-cover border-2 border-gray-200"
        />
        <Button 
          className="rounded-full absolute inset-0 m-auto w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity bg-black hover:bg-gray-800" 
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 text-white" />
          ) : (
            <Play className="h-7 w-7 text-white ml-1" />
          )}
        </Button>
      </div>

      {/* Track Info & Soundwave */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h3 className="font-bold text-2xl text-black truncate mb-1">{track.title}</h3>
          <p className="text-lg text-gray-600 font-medium truncate">{track.artist}</p>
        </div>

        {/* Soundwave Canvas */}
        <div className="relative mb-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={80}
            className="w-full h-20 rounded-xl bg-gray-50 border-2 border-gray-200"
          />
          
          {/* Progress Overlay */}
          <div 
            className="absolute top-0 left-0 h-full bg-black/5 rounded-xl pointer-events-none transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between text-sm text-gray-600 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
