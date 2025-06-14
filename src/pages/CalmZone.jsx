import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Timer,
  Waves,
  Wind,
  Zap,
  Heart,
  Music,
  Headphones
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import AudioLibrary from "../components/Audio/AudioLibrary";
import MeditationAudioService from "../services/meditationAudioService";

export default function CalmZone() {
  const { user } = useUser();
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5); // minutes
  const [selectedSounds, setSelectedSounds] = useState(new Set(["rain"])); // Support multiple sounds
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale"); // inhale, hold, exhale
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const intervalRef = useRef(null);
  const breathingIntervalRef = useRef(null);
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);

  const durations = [1, 3, 5, 10, 15, 20, 30];

  // Get meditation sounds from the audio service
  const sounds = MeditationAudioService.getMeditationSounds();

  const breathingPatterns = [
    { name: "4-7-8 Breathing", inhale: 4, hold: 7, exhale: 8 },
    { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4 },
    { name: "Simple Breathing", inhale: 4, hold: 0, exhale: 6 },
  ];

  const [selectedPattern, setSelectedPattern] = useState(breathingPatterns[0]);

  // Initialize meditation audio service
  useEffect(() => {
    const initAudio = async () => {
      try {
        await MeditationAudioService.initializeAudio();
        setAudioContext(MeditationAudioService.audioContext);
      } catch (error) {
        console.error('Error initializing meditation audio:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Simple audio notification using meditation audio service
  const playNotificationSound = () => {
    if (isMuted) return;

    try {
      MeditationAudioService.playNotificationSound();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Play ambient sound with real audio from Freesound
  const playAmbientSound = async (soundType) => {
    try {
      console.log('🎵 Starting ambient sound:', soundType);

      // Use meditation audio service for real audio
      const result = await MeditationAudioService.playBackgroundSound(soundType, volume);

      if (result.success) {
        console.log('✅ Ambient sound started:', result.message);

        // Return control interface compatible with existing code
        return {
          stop: () => {
            MeditationAudioService.stopBackgroundSound();
          },
          setVolume: (vol) => {
            MeditationAudioService.setVolume(vol);
          },
          type: result.type,
          track: result.track
        };
      } else {
        console.error('❌ Failed to start ambient sound:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error playing ambient sound:', error);
      return null;
    }
  };

  useEffect(() => {
    if (isPlaying && currentTime > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            playNotificationSound(); // Play sound when meditation ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentTime]);

  useEffect(() => {
    if (isBreathing) {
      const totalCycle = selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale;
      let phaseTime = 0;

      breathingIntervalRef.current = setInterval(() => {
        phaseTime++;

        if (phaseTime <= selectedPattern.inhale) {
          setBreathingPhase("inhale");
        } else if (phaseTime <= selectedPattern.inhale + selectedPattern.hold) {
          setBreathingPhase("hold");
        } else {
          setBreathingPhase("exhale");
        }

        if (phaseTime >= totalCycle) {
          phaseTime = 0;
          setBreathingCount(prev => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(breathingIntervalRef.current);
    }

    return () => clearInterval(breathingIntervalRef.current);
  }, [isBreathing, selectedPattern]);

  const startMeditation = async () => {
    setCurrentTime(selectedDuration * 60);
    setIsPlaying(true);

    // Start multiple ambient sounds with real audio
    if (!isMuted) {
      try {
        const audioPromises = [];
        for (const soundType of selectedSounds) {
          audioPromises.push(playAmbientSound(soundType));
        }

        const results = await Promise.all(audioPromises);
        audioRef.current = {
          stop: () => {
            MeditationAudioService.stopBackgroundSound(); // Stop all sounds
          }
        };

        console.log('🎵 Started multiple ambient sounds:', Array.from(selectedSounds));
      } catch (error) {
        console.error('Error starting ambient sounds:', error);
      }
    }
  };

  const pauseMeditation = () => {
    setIsPlaying(false);

    // Stop ambient sound
    if (audioRef.current) {
      try {
        audioRef.current.stop();
        audioRef.current = null;
      } catch (error) {
        console.error('Error stopping ambient sound:', error);
      }
    }
  };

  const resetMeditation = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    // Stop ambient sound
    if (audioRef.current) {
      try {
        audioRef.current.stop();
        audioRef.current = null;
      } catch (error) {
        console.error('Error stopping ambient sound:', error);
      }
    }
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathingCount(0);
    setBreathingPhase("inhale");
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathingCount(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      default:
        return "Breathe";
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case "inhale":
        return "from-blue-400 to-blue-600";
      case "hold":
        return "from-purple-400 to-purple-600";
      case "exhale":
        return "from-green-400 to-green-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen pt-4 pb-10 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Calm Zone
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Find your inner peace with guided meditation and breathing exercises
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meditation Timer */}
          <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
            isDark ? "bg-slate-800/50 border-white/10" : "bg-white/50 border-gray-200/50"
          }`}>
            <div className="text-center space-y-6">
              <h2 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Meditation Timer
              </h2>

              {/* Timer Display */}
              <div className="relative">
                <div className={`w-48 h-48 mx-auto rounded-full border-8 flex items-center justify-center ${
                  isPlaying
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                    : isDark
                    ? "border-slate-600 bg-slate-700/50"
                    : "border-gray-300 bg-gray-100/50"
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl font-mono font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {currentTime > 0 ? formatTime(currentTime) : formatTime(selectedDuration * 60)}
                    </div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {isPlaying ? "Meditating..." : "Ready to start"}
                    </div>
                    {isPlaying && !isMuted && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="w-1 h-3 bg-green-500 rounded animate-pulse"></div>
                        <div className="w-1 h-2 bg-green-500 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-2 bg-green-500 rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
                        <div className="w-1 h-3 bg-green-500 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Duration (minutes)
                </label>
                <div className="flex flex-wrap justify-center gap-2">
                  {durations.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      disabled={isPlaying}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDuration === duration
                          ? "bg-indigo-600 text-white"
                          : isDark
                          ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${isPlaying ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Multiple Sound Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Background Sounds (Select Multiple)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sounds.map((sound) => {
                    const isSelected = selectedSounds.has(sound.id);
                    return (
                      <button
                        key={sound.id}
                        onClick={() => {
                          const newSelectedSounds = new Set(selectedSounds);
                          if (isSelected) {
                            newSelectedSounds.delete(sound.id);
                          } else {
                            newSelectedSounds.add(sound.id);
                          }
                          setSelectedSounds(newSelectedSounds);
                        }}
                        className={`p-3 rounded-lg text-left transition-all relative ${
                          isSelected
                            ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                            : isDark
                            ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sound.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{sound.name}</div>
                            <div className="text-xs opacity-75">{sound.description}</div>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedSounds.size > 0 && (
                  <div className={`mt-2 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Selected: {Array.from(selectedSounds).join(", ")} ({selectedSounds.size} sounds)
                  </div>
                )}
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {isMuted ? (
                    <VolumeX className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
                  ) : (
                    <Volume2 className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    // Update master volume for all active sounds
                    MeditationAudioService.setMasterVolume(newVolume);
                  }}
                  className="flex-1"
                />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetMeditation}
                  className={`p-3 rounded-lg ${
                    isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <RotateCcw className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
                </button>
                <button
                  onClick={isPlaying ? pauseMeditation : startMeditation}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {isPlaying ? (
                    <div className="flex items-center gap-2">
                      <Pause className="w-5 h-5" />
                      Pause
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Start
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Breathing Exercise */}
          <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
            isDark ? "bg-slate-800/50 border-white/10" : "bg-white/50 border-gray-200/50"
          }`}>
            <div className="text-center space-y-6">
              <h2 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Breathing Exercise
              </h2>

              {/* Breathing Circle */}
              <div className="relative">
                <div className={`w-48 h-48 mx-auto rounded-full border-8 flex items-center justify-center transition-all duration-1000 ${
                  isBreathing
                    ? `border-transparent bg-gradient-to-br ${getBreathingColor()} animate-pulse`
                    : isDark
                    ? "border-slate-600 bg-slate-700/50"
                    : "border-gray-300 bg-gray-100/50"
                }`}>
                  <div className="text-center">
                    <div className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {isBreathing ? getBreathingInstruction() : "Ready"}
                    </div>
                    {isBreathing && (
                      <div className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Cycle: {breathingCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pattern Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Breathing Pattern
                </label>
                <div className="space-y-2">
                  {breathingPatterns.map((pattern, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPattern(pattern)}
                      disabled={isBreathing}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedPattern.name === pattern.name
                          ? "bg-indigo-600 text-white"
                          : isDark
                          ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${isBreathing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-medium">{pattern.name}</div>
                      <div className="text-sm opacity-75">
                        Inhale {pattern.inhale}s
                        {pattern.hold > 0 && ` • Hold ${pattern.hold}s`}
                        • Exhale {pattern.exhale}s
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <button
                onClick={isBreathing ? stopBreathing : startBreathing}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                {isBreathing ? (
                  <div className="flex items-center gap-2">
                    <Pause className="w-5 h-5" />
                    Stop Breathing
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Start Breathing
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
            isDark ? "bg-slate-800/50 border-white/10" : "bg-white/50 border-gray-200/50"
          }`}>
            <Waves className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Quick Calm
            </h3>
            <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              2-minute breathing exercise for instant relaxation
            </p>
            <button
              onClick={() => {
                setSelectedDuration(2);
                startMeditation();
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Start 2min
            </button>
          </div>

          <div className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
            isDark ? "bg-slate-800/50 border-white/10" : "bg-white/50 border-gray-200/50"
          }`}>
            <Wind className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-green-400" : "text-green-600"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Deep Focus
            </h3>
            <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              15-minute session for enhanced concentration
            </p>
            <button
              onClick={() => {
                setSelectedDuration(15);
                startMeditation();
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Start 15min
            </button>
          </div>

          <div className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
            isDark ? "bg-slate-800/50 border-white/10" : "bg-white/50 border-gray-200/50"
          }`}>
            <Zap className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Energy Boost
            </h3>
            <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Energizing breathing pattern to revitalize
            </p>
            <button
              onClick={() => {
                setSelectedPattern(breathingPatterns[1]);
                startBreathing();
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Start Breathing
            </button>
          </div>
        </div>

        {/* Audio Library Section */}
        <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
          isDark ? "bg-slate-800/50 border-white/10" : "bg-white/50 border-gray-200/50"
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Meditation Music & Ambient Sounds
              </h2>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Enhance your meditation with calming music and nature sounds
              </p>
            </div>
          </div>

          <AudioLibrary showPlayer={true} />
        </div>
      </div>
    </div>
  );
}
