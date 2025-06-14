import { useState } from 'react';
import { Mic, MicOff, Loader, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function VoiceTestComponent() {
  const { isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(null);

  // Check browser support on component mount
  useState(() => {
    checkBrowserSupport();
  }, []);

  const checkBrowserSupport = () => {
    const support = {
      mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      speechRecognition: true, // We're using API-based transcription now
      mediaRecorder: !!window.MediaRecorder
    };

    setBrowserSupport(support);
    return support;
  };

  const startRecording = async () => {
    try {
      setError('');
      setTranscript('');

      // Check for microphone support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser');
      }

      setIsRecording(true);
      setIsProcessing(false);

      // Start recording audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

          // Transcribe using Groq Whisper API
          const transcript = await transcribeWithGroq(audioBlob);

          if (transcript && transcript.trim()) {
            setTranscript(transcript);
            console.log('✅ Transcript:', transcript);
          } else {
            throw new Error('No speech detected in recording');
          }

        } catch (error) {
          setError(error.message);
          console.error('❌ Transcription error:', error);
        } finally {
          setIsProcessing(false);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      // Record for 5 seconds automatically
      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);

    } catch (error) {
      setIsRecording(false);
      setError(error.message);
      console.error('❌ Error starting recording:', error);
    }
  };

  const transcribeWithGroq = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';

    } catch (error) {
      console.error('Groq transcription failed:', error);
      throw new Error('Speech transcription failed. Please try again.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Note: We can't easily stop Web Speech API once started
    // This is more for UI feedback
  };

  const clearResults = () => {
    setTranscript('');
    setError('');
  };

  return (
    <div className={`p-6 rounded-2xl ${
      isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
    } border shadow-lg`}>
      
      <h3 className={`text-lg font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        🎤 Voice Input Test
      </h3>

      {/* Browser Support Status */}
      {browserSupport && (
        <div className="mb-4 space-y-2">
          <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Browser Support:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {browserSupport.mediaDevices ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Microphone Access
              </span>
            </div>
            <div className="flex items-center gap-2">
              {browserSupport.speechRecognition ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                API Transcription
              </span>
            </div>
            <div className="flex items-center gap-2">
              {browserSupport.mediaRecorder ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Audio Recording
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || !browserSupport?.speechRecognition}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : isProcessing
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : browserSupport?.speechRecognition
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
          <span>
            {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
          </span>
        </button>

        {(transcript || error) && (
          <button
            onClick={clearResults}
            className={`px-4 py-2 rounded-lg transition-all ${
              isDark 
                ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Clear
          </button>
        )}
      </div>

      {/* Status Messages */}
      {isRecording && (
        <div className={`p-3 rounded-lg mb-4 ${
          isDark ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              Listening... Speak now!
            </span>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className={`p-3 rounded-lg mb-4 ${
          isDark ? 'bg-indigo-900/20 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200'
        }`}>
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-indigo-500" />
            <span className={`text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
              Converting speech to text...
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {transcript && (
        <div className={`p-4 rounded-lg mb-4 ${
          isDark ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'
        }`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
            ✅ Transcript:
          </h4>
          <p className={`${isDark ? 'text-green-200' : 'text-green-800'}`}>
            "{transcript}"
          </p>
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-lg mb-4 ${
          isDark ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            ❌ Error:
          </h4>
          <p className={`${isDark ? 'text-red-200' : 'text-red-800'}`}>
            {error}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="mb-2">
          <strong>Instructions:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click "Start Recording" and speak clearly for 5 seconds</li>
          <li>The browser may ask for microphone permission</li>
          <li>Audio will be sent to Groq Whisper API for transcription</li>
          <li>Wait for the transcription to appear (may take a few seconds)</li>
          <li>If it fails, try speaking louder or check your internet connection</li>
        </ul>
      </div>
    </div>
  );
}
