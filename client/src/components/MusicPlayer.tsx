import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown, ChevronUp, Shuffle, Repeat } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState([30]); // Current time percentage
  const [isMinimized, setIsMinimized] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  // Mock track data - will be replaced with real data later
  const currentTrack = {
    title: "Midnight Dreams",
    artist: "Luna Rivers",
    album: "Echoes of Tomorrow",
    albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
    currentTime: "2:15",
    totalTime: "4:32",
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => setIsRepeating(!isRepeating);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl transition-all duration-300 z-50 ${
        isMinimized ? "h-16" : "h-24"
      }`}
    >
      <div className="container h-full flex items-center justify-between gap-6 px-6">
        {/* Left: Track Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.album}
            className="w-14 h-14 rounded-lg object-cover shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-semibold text-sm truncate">{currentTrack.title}</h4>
            <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors p-2 hover:bg-gray-800 rounded-full ${
                isShuffled ? "text-cyan-500" : "text-gray-400 hover:text-white"
              }`}
              aria-label="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-3 transition-all hover:scale-105 shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
            </button>

            <button
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`transition-colors p-2 hover:bg-gray-800 rounded-full ${
                isRepeating ? "text-cyan-500" : "text-gray-400 hover:text-white"
              }`}
              aria-label="Repeat"
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          {!isMinimized && (
            <div className="w-full flex items-center gap-3">
              <span className="text-xs text-gray-400 w-10 text-right">{currentTrack.currentTime}</span>
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-10">{currentTrack.totalTime}</span>
            </div>
          )}
        </div>

        {/* Right: Volume & Minimize */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Volume Control */}
          {!isMinimized && (
            <div className="flex items-center gap-2 w-32">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume[0] === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <Slider
                value={isMuted ? [0] : volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          )}

          {/* Minimize/Expand Toggle */}
          <button
            onClick={toggleMinimize}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
            aria-label={isMinimized ? "Expand player" : "Minimize player"}
          >
            {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
