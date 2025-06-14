import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

export default function SpeechRecognition({ onResult, isActive, onToggle }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        if (finalTranscript && onResult) {
          onResult(finalTranscript);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult]);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isActive && isSupported) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      recognitionRef.current.stop();
      setTranscript("");
    }
  }, [isActive, isSupported]);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MicOff className="w-4 h-4" />
        <span>Speech recognition not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`p-2 rounded-lg transition-all ${
          isActive
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        title={isActive ? "Stop recording" : "Start recording"}
      >
        {isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      <div className="flex flex-col">
        <span className={`text-sm ${isListening ? "text-green-600" : "text-gray-500"}`}>
          {isListening ? "Listening..." : isActive ? "Click to start" : "Voice input ready"}
        </span>
        {transcript && (
          <span className="text-xs text-gray-400 italic">
            "{transcript}"
          </span>
        )}
      </div>
    </div>
  );
}
