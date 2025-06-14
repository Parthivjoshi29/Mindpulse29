import { useState, useRef } from 'react';
import { Mic, MicOff, Loader, Volume2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function VoiceInput({ onTranscription, onError }) {
  const { isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });
          
          // For now, we'll use Web Speech API as fallback
          // In production, you'd send this to Whisper API
          const transcription = await transcribeAudio(audioBlob);
          onTranscription(transcription);
          
        } catch (error) {
          console.error('Transcription failed:', error);
          if (onError) {
            onError('Sorry, I couldn\'t understand that. Please try again or type your message.');
          }
        } finally {
          setIsProcessing(false);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Microphone access denied:', error);
      if (onError) {
        onError('Microphone access is required for voice messages. Please enable it in your browser settings.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob) => {
    // Try Web Speech API first (fastest for demo)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        return await transcribeWithWebSpeech();
      } catch (error) {
        console.log('Web Speech API failed, using fallback');
      }
    }
    
    // Fallback: Convert audio to text using a simple approach
    // In production, you'd send audioBlob to Whisper API here
    return await transcribeWithFallback(audioBlob);
  };

  const transcribeWithWebSpeech = () => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        // If no result was captured, reject
        setTimeout(() => reject(new Error('No speech detected')), 100);
      };

      recognition.start();
    });
  };

  const transcribeWithFallback = async (audioBlob) => {
    // This is a placeholder for when Web Speech API fails
    // In a real implementation, you'd send the audioBlob to Whisper API
    
    // For demo purposes, return a helpful message
    const duration = recordingTime;
    if (duration < 1) {
      throw new Error('Recording too short');
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `Voice message recorded (${duration}s) - Please type your message as voice transcription is being set up.`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isProcessing) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        isDark ? 'bg-slate-600' : 'bg-gray-200'
      }`}>
        <Loader className="w-5 h-5 animate-spin text-indigo-500" />
        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Processing voice...
        </span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={stopRecording}
          className="p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white animate-pulse transition-all"
        >
          <MicOff className="w-5 h-5" />
        </button>
        
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          isDark ? 'bg-slate-700' : 'bg-gray-100'
        }`}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {formatTime(recordingTime)}
            </span>
          </div>
          
          <Volume2 className={`w-4 h-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      className={`p-3 rounded-lg transition-all ${
        isDark 
          ? 'bg-slate-600 hover:bg-slate-500 text-white' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
      title="Record voice message"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
}

// Enhanced Speech Recognition Hook
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();

    return () => {
      recognition.stop();
      setIsListening(false);
    };
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript('')
  };
}
