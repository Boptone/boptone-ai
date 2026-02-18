import { Heart, Music, Pause, Play, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string | null;
  duration: number;
  artworkUrl: string | null;
  audioUrl: string;
}

interface SoundwavePlayerProps {
  track: Track;
  autoPlay?: boolean;
}

export default function SoundwavePlayer({ track, autoPlay = false }: SoundwavePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#e5e7eb', // gray-200
      progressColor: '#81e6fe', // cyan color requested
      cursorColor: '#81e6fe',
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 120,
      normalize: true,
      backend: 'WebAudio',
    });

    // Load audio
    wavesurfer.load(track.audioUrl);

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      if (autoPlay) {
        wavesurfer.play();
        setIsPlaying(true);
      }
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [track.audioUrl, autoPlay]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-8 shadow-lg">
      <div className="flex items-start gap-8">
        {/* Artwork and Play Button */}
        <div className="flex-shrink-0 relative">
          {/* Artwork */}
          <div className="w-64 h-64 rounded-xl overflow-hidden shadow-2xl relative group">
            {track.artworkUrl ? (
              <img
                src={track.artworkUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-cyan-500 flex items-center justify-center">
                <Music className="w-24 h-24 text-white" />
              </div>
            )}
            
            {/* Pulsing indicator when playing */}
            {isPlaying && (
              <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg" />
            )}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-black hover:bg-gray-900 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" fill="white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            )}
          </button>
        </div>

        {/* Track Info and Waveform */}
        <div className="flex-1 min-w-0">
          {/* Track Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-4xl font-bold text-gray-900 mb-2 truncate">
                  {track.title}
                </h3>
                <p className="text-xl text-gray-600 mb-3 truncate">{track.artist}</p>
                {track.genre && (
                  <span className="inline-block px-4 py-1.5 bg-white border-2 border-black rounded-full text-sm font-medium">
                    {track.genre.toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Waveform */}
          <div 
            ref={waveformRef} 
            className="w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 border-gray-200 bg-white"
          />

          {/* Time Display */}
          <div className="flex items-center justify-between mt-4 text-lg font-medium text-gray-700">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
