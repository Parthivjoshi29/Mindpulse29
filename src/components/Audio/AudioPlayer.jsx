import { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Repeat, RotateCcw, Music } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AudioService from '../../services/freesoundAudioService';

export default function AudioPlayer({ trackId, autoPlay = false, showControls = true }) {
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(70);
  const [isLooping, setIsLooping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Update state when AudioService status changes
    const updateStatus = () => {
      const status = AudioService.getStatus();
      setIsPlaying(status.isPlaying);
      setCurrentTrack(status.currentTrack);
      setVolume(Math.round(status.volume * 100));
      setIsLooping(status.isLooping);
    };

    // Initial status
    updateStatus();

    // Set up polling for status updates (simple approach)
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (trackId && autoPlay) {
      handlePlay();
    }
  }, [trackId, autoPlay]);

  const handlePlay = async () => {
    if (!trackId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await AudioService.play(trackId);
      
      if (result.success) {
        setIsPlaying(true);
        setCurrentTrack(result.track);

        if (result.source === 'generated') {
          setError(result.note || 'Using synthesized audio - Freesound tracks loading');
        } else if (result.source === 'freesound') {
          setError(null); // Clear any previous errors - real Freesound audio
        } else if (result.source === 'pixabay') {
          setError(null); // Clear any previous errors - real Pixabay audio
        } else if (result.source === 'real_audio') {
          setError(null); // Clear any previous errors
        }
      } else {
        setError(result.message || 'Failed to play audio');
      }
    } catch (err) {
      setError('Audio playback failed');
      console.error('Audio play error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (AudioService.pause()) {
      setIsPlaying(false);
    }
  };

  const handleResume = () => {
    if (AudioService.resume()) {
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    AudioService.stop();
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const handleVolumeChange = (newVolume) => {
    const volumeValue = newVolume / 100;
    AudioService.setVolume(volumeValue);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (volume > 0) {
      handleVolumeChange(0);
    } else {
      handleVolumeChange(70);
    }
  };

  const toggleLoop = () => {
    const newLoopState = AudioService.toggleLoop();
    setIsLooping(newLoopState);
  };

  if (!showControls && !currentTrack) {
    return null;
  }

  return (
    <div className={`p-4 rounded-xl ${
      isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
    } border shadow-lg`}>
      
      {/* Track Info */}
      {currentTrack && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Music className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentTrack.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentTrack.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${
              isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {currentTrack.category}
            </span>
            <span className={`px-2 py-1 rounded-full ${
              isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              {currentTrack.mood}
            </span>
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentTrack.duration}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`mb-4 p-3 rounded-lg ${
          isDark ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        } border text-sm`}>
          {error}
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={isPlaying ? handlePause : (currentTrack ? handleResume : handlePlay)}
            disabled={isLoading || !trackId}
            className={`p-3 rounded-full transition-all ${
              isLoading || !trackId
                ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                : isPlaying
                  ? isDark ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                  : isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            disabled={!currentTrack}
            className={`p-2 rounded-lg transition-all ${
              !currentTrack
                ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                : isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Loop Button */}
          <button
            onClick={toggleLoop}
            className={`p-2 rounded-lg transition-all ${
              isLooping
                ? isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                : isDark ? 'bg-slate-600 hover:bg-slate-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
            title={isLooping ? 'Disable loop' : 'Enable loop'}
          >
            {isLooping ? (
              <Repeat className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Status Indicator */}
        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Playing
            </span>
          </div>
        )}
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg transition-all ${
            isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
          }`}
        >
          {volume === 0 ? (
            <VolumeX className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          ) : (
            <Volume2 className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              isDark ? 'bg-slate-600' : 'bg-gray-200'
            }`}
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volume}%, ${
                isDark ? '#475569' : '#e5e7eb'
              } ${volume}%, ${isDark ? '#475569' : '#e5e7eb'} 100%)`
            }}
          />
        </div>

        <span className={`text-sm min-w-[3rem] text-right ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {volume}%
        </span>
      </div>

      {/* Quick Actions */}
      {!currentTrack && trackId && (
        <div className="mt-4 text-center">
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-all ${
              isLoading
                ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                : isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {isLoading ? 'Loading...' : 'Play Track'}
          </button>
        </div>
      )}
    </div>
  );
}
