import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Settings, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import TextToSpeechService from '../../services/textToSpeechService';

export default function TTSTestComponent() {
  const { isDark } = useTheme();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [testText, setTestText] = useState('Hello! I am your AI wellness companion. How are you feeling today?');
  const [status, setStatus] = useState({});

  useEffect(() => {
    initializeTTS();
  }, []);

  const initializeTTS = async () => {
    await TextToSpeechService.initializeVoices();
    updateStatus();
    setVoices(TextToSpeechService.getAvailableVoices());
    setSelectedVoice(TextToSpeechService.selectedVoice?.name || '');
  };

  const updateStatus = () => {
    setStatus(TextToSpeechService.getStatus());
    setIsEnabled(TextToSpeechService.isEnabled);
    setIsSpeaking(TextToSpeechService.getStatus().isSpeaking);
  };

  const handleToggleTTS = () => {
    const newState = TextToSpeechService.toggle();
    setIsEnabled(newState);
    updateStatus();
  };

  const handleSpeak = async () => {
    try {
      if (isSpeaking) {
        TextToSpeechService.stop();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);
      await TextToSpeechService.speak(testText, { rate, pitch, volume });
      setIsSpeaking(false);
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const handleVoiceChange = (voiceName) => {
    TextToSpeechService.setVoice(voiceName);
    setSelectedVoice(voiceName);
    updateStatus();
  };

  const handleRateChange = (newRate) => {
    setRate(newRate);
    TextToSpeechService.setRate(newRate);
  };

  const handlePitchChange = (newPitch) => {
    setPitch(newPitch);
    TextToSpeechService.setPitch(newPitch);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    TextToSpeechService.setVolume(newVolume);
  };

  const testSamples = [
    "Hello! I'm your AI wellness companion.",
    "I understand you're feeling stressed. Let's work through this together.",
    "Take a deep breath in... and slowly breathe out. You're doing great!",
    "Remember, it's okay to not be okay sometimes. I'm here to support you.",
    "Would you like to try a quick breathing exercise or perhaps write in your journal?"
  ];

  return (
    <div className={`p-6 rounded-2xl ${
      isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
    } border shadow-lg`}>
      
      <h3 className={`text-lg font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        🔊 Text-to-Speech Test
      </h3>

      {/* TTS Status */}
      <div className="mb-4 space-y-2">
        <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          System Status:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            {status.isSupported ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Browser Support
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-orange-500" />
            )}
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              TTS Enabled
            </span>
          </div>
          <div className="flex items-center gap-2">
            {status.availableVoices > 0 ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {status.availableVoices || 0} Voices Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleToggleTTS}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isEnabled
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-gray-400 hover:bg-gray-500 text-white'
          }`}
        >
          {isEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
          <span>{isEnabled ? 'TTS Enabled' : 'TTS Disabled'}</span>
        </button>

        <button
          onClick={handleSpeak}
          disabled={!isEnabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            !isEnabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isSpeaking
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isSpeaking ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span>{isSpeaking ? 'Stop Speaking' : 'Test Speech'}</span>
        </button>
      </div>

      {/* Test Text */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Test Text:
        </label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className={`w-full p-3 rounded-lg border resize-none ${
            isDark 
              ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          rows={3}
          placeholder="Enter text to test speech synthesis..."
        />
      </div>

      {/* Quick Test Samples */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Quick Test Samples:
        </label>
        <div className="grid grid-cols-1 gap-2">
          {testSamples.map((sample, index) => (
            <button
              key={index}
              onClick={() => setTestText(sample)}
              className={`p-2 text-left rounded-lg transition-all ${
                isDark 
                  ? 'bg-slate-600 hover:bg-slate-500 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <span className="text-sm">{sample}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      {voices.length > 0 && (
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Voice Selection:
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className={`w-full p-2 rounded-lg border ${
              isDark 
                ? 'bg-slate-600 border-slate-500 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Voice Settings */}
      <div className="space-y-4">
        <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Voice Settings:
        </h4>
        
        {/* Rate */}
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Speed: {rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Pitch */}
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Pitch: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Volume */}
        <div>
          <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Current Status */}
      <div className={`mt-4 p-3 rounded-lg ${
        isDark ? 'bg-slate-700/50' : 'bg-gray-50'
      }`}>
        <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Current Status:
        </h4>
        <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Voice: {status.selectedVoice || 'None'}</p>
          <p>Speaking: {status.isSpeaking ? 'Yes' : 'No'}</p>
          <p>Paused: {status.isPaused ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}
