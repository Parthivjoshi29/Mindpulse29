import { useState, useRef } from "react";
import { X, Mic, MicOff, Send, Loader, Play, Pause } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "@clerk/clerk-react";
import SpeechService from "../../services/speechService";

export default function SessionModal({ isOpen, onClose, onSave }) {
  const { isDark } = useTheme();
  const { user } = useUser();
  const [mood, setMood] = useState(7);
  const [emotion, setEmotion] = useState("");
  const [journal, setJournal] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [showVoiceReview, setShowVoiceReview] = useState(false);
  const [step, setStep] = useState(1); // 1: mood, 2: emotion, 3: journal

  const emotions = [
    "Happy",
    "Relaxed",
    "Energetic",
    "Creative",
    "Focused",
    "Calm",
    "Optimistic",
    "Excited",
    "Peaceful",
    "Motivated",
    "Anxious",
    "Tired",
    "Stressed",
    "Sad",
    "Frustrated",
  ];

  const startVoiceRecording = async () => {
    try {
      setIsRecording(true);
      setIsProcessingVoice(false);

      console.log('🎤 Starting voice recording for journal...');

      // Use the speech service for recording and transcription
      const result = await SpeechService.recordAndTranscribe(5000); // 5 second recording

      setIsRecording(false);

      if (result.success) {
        // Show the transcript for review
        setVoiceTranscript(result.transcript);
        setShowVoiceReview(true);
        console.log('✅ Voice transcription successful:', result.transcript);
      } else {
        // Show error message for user to handle
        const errorMessage = `Voice recording failed: ${result.error}. Please try again or continue typing.`;
        setVoiceTranscript(errorMessage);
        setShowVoiceReview(true);
        console.error('❌ Voice transcription failed:', result.error);
      }

    } catch (error) {
      setIsRecording(false);
      setIsProcessingVoice(false);

      console.error('❌ Voice recording error:', error);

      const errorMessage = 'Voice input failed. Please check your microphone and try again.';
      setVoiceTranscript(errorMessage);
      setShowVoiceReview(true);
    }
  };

  const handleVoiceConfirm = () => {
    // Add the transcribed text to the journal
    setJournal((prev) => prev + (prev ? " " : "") + voiceTranscript);
    setShowVoiceReview(false);
    setVoiceTranscript("");
  };

  const handleVoiceCancel = () => {
    setShowVoiceReview(false);
    setVoiceTranscript("");
  };

  const handleVoiceRetry = () => {
    setShowVoiceReview(false);
    setVoiceTranscript("");
    startVoiceRecording();
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const sessionData = {
        type: 'journal',
        title: `Daily Check-in - ${new Date().toLocaleDateString()}`,
        content: journal,
        journal: journal, // For backward compatibility
        mood: mood,
        emotion: emotion,
        emotions: emotion ? [{ label: emotion, intensity: 0.8 }] : [],
        tags: [],
        insights: [],
        duration: 0, // Could track time spent in modal
        timestamp: new Date(),
        userId: user.id,
      };

      console.log('📝 Submitting session data:', sessionData);
      await onSave(sessionData);

      // Reset form
      setMood(7);
      setEmotion("");
      setJournal("");
      setStep(1);

      onClose();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-lg ${
          isDark ? "bg-slate-900" : "bg-white"
        } p-6`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"
          }`}
        >
          <X className={isDark ? "text-gray-400" : "text-gray-600"} />
        </button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              New Session
            </h2>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {step === 1
                ? "How are you feeling today?"
                : step === 2
                ? "Select your primary emotion:"
                : "Journal your thoughts..."}
            </p>
          </div>

          {/* Steps */}
          {step === 1 && (
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Not Great (1)
                </span>
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Amazing (10)
                </span>
              </div>
              <div
                className={`text-center text-xl font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {mood}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-3 gap-2">
              {emotions.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmotion(e)}
                  className={`p-2 rounded-lg transition-all ${
                    emotion === e
                      ? "bg-indigo-600 text-white"
                      : isDark
                      ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Write your thoughts here..."
                className={`w-full h-40 p-3 rounded-lg border resize-none ${
                  isDark
                    ? "bg-slate-800 border-slate-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />

              {/* Voice Review Panel */}
              {showVoiceReview && (
                <div className={`p-4 rounded-lg border-2 border-dashed ${
                  isDark ? 'border-indigo-400 bg-indigo-900/20' : 'border-indigo-300 bg-indigo-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Mic className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className={`font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      Voice Message Transcribed
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg mb-3 ${
                    isDark ? 'bg-slate-700' : 'bg-white'
                  }`}>
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      "{voiceTranscript}"
                    </p>
                  </div>

                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Review the transcription above, then choose an action:
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={handleVoiceConfirm}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Add to Journal
                    </button>

                    <button
                      onClick={handleVoiceRetry}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isDark
                          ? 'bg-slate-600 hover:bg-slate-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      Record Again
                    </button>

                    <button
                      onClick={handleVoiceCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Voice Indicator */}
              {isProcessingVoice && (
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-slate-600/50' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <Loader className="w-5 h-5 animate-spin text-indigo-500" />
                    <div>
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Converting speech to text...
                      </span>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        This may take a moment. Please wait.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className={`p-4 rounded-lg border-2 border-dashed ${
                  isDark ? 'border-red-400 bg-red-900/20' : 'border-red-300 bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <Mic className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                        Recording your thoughts...
                      </span>
                      <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Speak clearly for up to 5 seconds. Recording will stop automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Input Button */}
              {!showVoiceReview && !isRecording && !isProcessingVoice && (
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Voice Input
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Click to record your thoughts with voice
                      </p>
                    </div>
                    <button
                      onClick={startVoiceRecording}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isDark
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>Record</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step < 3) setStep(step + 1);
                else handleSubmit();
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 ml-auto"
            >
              {step === 3 ? (
                <div className="flex items-center gap-2">
                  <span>Save Session</span>
                  <Send size={18} />
                </div>
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
