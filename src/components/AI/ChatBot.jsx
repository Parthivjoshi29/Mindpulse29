import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../../context/ThemeContext';
import { Send, Mic, MicOff, Bot, User, Loader, Sparkles, X, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import GroqService from '../../services/groqService';
import SpeechService from '../../services/speechService';
import TextToSpeechService from '../../services/textToSpeechService';

export default function ChatBot({ userContext = {}, onRecommendation }) {
  const { user } = useUser();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hi ${user?.firstName || 'there'}! 👋 I'm your MindPulse AI companion. I'm here to listen, support, and help you with your mental wellness journey. How are you feeling today?`,
      timestamp: new Date().toISOString(),
      recommendations: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceReview, setShowVoiceReview] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingMessageId, setCurrentSpeakingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize TTS service
    TextToSpeechService.initializeVoices();
  }, []);

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI response from Groq
      const aiResponse = await GroqService.getChatResponse(messageText, {
        ...userContext,
        userName: user?.firstName,
        conversationHistory: messages.slice(-5) // Last 5 messages for context
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.message,
        timestamp: aiResponse.timestamp,
        recommendations: aiResponse.recommendations || [],
        confidence: aiResponse.confidence
      };

      setMessages(prev => [...prev, aiMessage]);

      // Trigger recommendation callback if provided
      if (onRecommendation && aiResponse.recommendations?.length > 0) {
        onRecommendation(aiResponse.recommendations);
      }

      // Speak AI response if TTS is enabled
      if (isTTSEnabled) {
        setTimeout(() => {
          handleSpeakMessage(aiMessage);
        }, 500); // Small delay to ensure message is rendered
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having a moment of technical difficulty, but I'm still here for you. Can you try sending your message again? 💙",
        timestamp: new Date().toISOString(),
        recommendations: []
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      // Check for microphone support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Check MediaRecorder support and use best available format
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessingVoice(true);

        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // Use SpeechService for transcription
          const transcript = await SpeechService.transcribeAudio(audioBlob);

          // Show the transcript in the input field for review
          setVoiceTranscript(transcript);
          setInputMessage(transcript);
          setShowVoiceReview(true);

        } catch (error) {
          console.error('Voice transcription failed:', error);
          const errorMessage = 'Voice transcription failed. Please edit this text to match what you said.';
          setVoiceTranscript(errorMessage);
          setInputMessage(errorMessage);
          setShowVoiceReview(true);
        } finally {
          setIsProcessingVoice(false);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access error:', error);

      let errorMessage = 'Unable to access microphone. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone access in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Voice input is not supported in this browser. Please try typing your message.';
      } else {
        errorMessage += 'Please check your microphone settings and try again.';
      }

      // Show error in the input field for user to edit
      setInputMessage(errorMessage);
      setShowVoiceReview(true);
      setVoiceTranscript(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      console.log('🎤 Transcribing audio with Whisper API...');

      // Use OpenAI Whisper API for reliable transcription
      const transcript = await transcribeWithWhisper(audioBlob);

      if (transcript && transcript.trim()) {
        console.log('✅ Whisper transcription successful:', transcript);
        return transcript;
      } else {
        throw new Error('Empty transcription received');
      }

    } catch (error) {
      console.log('❌ Whisper API failed:', error.message);
      console.log('Using intelligent fallback...');

      // Fallback: Intelligent placeholder with user guidance
      return await transcribeWithFallback(audioBlob);
    }
  };

  const transcribeWithWhisper = async (audioBlob) => {
    try {
      // Convert audio blob to the format expected by Whisper
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      // Use OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key'}`,
        },
        body: formData
      });

      if (!response.ok) {
        // If OpenAI fails, try Groq Whisper (which is free and fast)
        return await transcribeWithGroqWhisper(audioBlob);
      }

      const result = await response.json();
      return result.text || '';

    } catch (error) {
      console.error('OpenAI Whisper failed:', error);
      // Fallback to Groq Whisper
      return await transcribeWithGroqWhisper(audioBlob);
    }
  };

  const transcribeWithGroqWhisper = async (audioBlob) => {
    try {
      // Convert audio blob for Groq
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      // Use Groq Whisper API (free and fast)
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const result = await response.json();
      return result.text || '';

    } catch (error) {
      console.error('Groq Whisper failed:', error);
      throw new Error('All speech recognition services failed');
    }
  };

  const transcribeWithFallback = async (audioBlob) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Provide helpful guidance based on common scenarios
    const fallbackMessages = [
      "I heard you speaking! Please type what you said here, then click Send.",
      "Voice recorded successfully! Please edit this text to match your message.",
      "Audio captured! Replace this text with what you wanted to say.",
      "I'm listening! Please type your message here and I'll help you.",
      "Voice input received! Edit this text to tell me how you're feeling."
    ];

    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    console.log('💡 Using fallback transcription with helpful guidance');
    return randomMessage;
  };

  const handleVoiceConfirm = () => {
    setShowVoiceReview(false);
    setVoiceTranscript('');
    handleSendMessage(inputMessage);
  };

  const handleVoiceCancel = () => {
    setShowVoiceReview(false);
    setVoiceTranscript('');
    setInputMessage('');
  };

  const handleVoiceRetry = () => {
    setShowVoiceReview(false);
    setVoiceTranscript('');
    setInputMessage('');
    startRecording();
  };

  const handleSpeakMessage = async (message) => {
    try {
      if (isSpeaking) {
        TextToSpeechService.stop();
        setIsSpeaking(false);
        setCurrentSpeakingMessageId(null);
        return;
      }

      setIsSpeaking(true);
      setCurrentSpeakingMessageId(message.id);

      await TextToSpeechService.speak(message.content);

      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    }
  };

  const toggleTTS = () => {
    const newState = TextToSpeechService.toggle();
    setIsTTSEnabled(newState);

    if (!newState && isSpeaking) {
      TextToSpeechService.stop();
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    }
  };

  const stopSpeaking = () => {
    TextToSpeechService.stop();
    setIsSpeaking(false);
    setCurrentSpeakingMessageId(null);
  };

  const handleRecommendationClick = (recommendation) => {
    // Handle different recommendation actions
    switch (recommendation.action) {
      case 'start-breathing':
        // Navigate to breathing exercise
        window.location.href = '/calm-zone';
        break;
      case 'open-journal':
        // Navigate to journal
        window.location.href = '/journal';
        break;
      case 'open-calm-zone':
        // Navigate to calm zone
        window.location.href = '/calm-zone';
        break;
      case 'mood-check':
        // Navigate to dashboard for mood tracking
        window.location.href = '/dashboard';
        break;
      default:
        // Send a follow-up message
        handleSendMessage(`I'd like to try: ${recommendation.title}`);
    }
  };

  return (
    <div className={`flex flex-col h-[600px] rounded-2xl border ${
      isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
    } shadow-lg overflow-hidden`}>
      
      {/* Chat Header */}
      <div className={`p-4 border-b ${
        isDark ? 'border-white/10 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isDark ? 'bg-indigo-600' : 'bg-indigo-500'
          }`}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              MindPulse AI
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {isSpeaking ? '🔊 Speaking...' : 'Your wellness companion'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* TTS Controls */}
            <button
              onClick={toggleTTS}
              className={`p-2 rounded-lg transition-all ${
                isTTSEnabled
                  ? isDark
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  : isDark
                    ? 'bg-slate-600 hover:bg-slate-500 text-gray-400'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
              }`}
              title={isTTSEnabled ? 'Disable AI voice' : 'Enable AI voice'}
            >
              {isTTSEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } animate-pulse`}
                title="Stop speaking"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            <Sparkles className={`w-5 h-5 ${
              isDark ? 'text-indigo-400' : 'text-indigo-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${
            message.type === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            
            {message.type === 'ai' && (
              <div className={`p-2 rounded-full ${
                isDark ? 'bg-indigo-600' : 'bg-indigo-500'
              } flex-shrink-0`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[80%] ${
              message.type === 'user' ? 'order-1' : ''
            }`}>
              <div className={`p-3 rounded-2xl ${
                message.type === 'user'
                  ? isDark
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-500 text-white'
                  : isDark
                    ? 'bg-slate-700 text-gray-100'
                    : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed flex-1">{message.content}</p>

                  {/* Speaker button for AI messages */}
                  {message.type === 'ai' && isTTSEnabled && (
                    <button
                      onClick={() => handleSpeakMessage(message)}
                      className={`flex-shrink-0 p-1 rounded transition-all ${
                        currentSpeakingMessageId === message.id
                          ? 'bg-indigo-500 text-white animate-pulse'
                          : isDark
                            ? 'hover:bg-slate-600 text-gray-400 hover:text-gray-200'
                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                      title={currentSpeakingMessageId === message.id ? 'Stop speaking' : 'Speak this message'}
                    >
                      {currentSpeakingMessageId === message.id ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.recommendations.map((rec, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecommendationClick(rec)}
                      className={`w-full p-3 rounded-lg border text-left transition-all hover:scale-105 ${
                        isDark 
                          ? 'bg-slate-600/50 border-slate-500 hover:bg-slate-600 text-gray-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{rec.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className={`text-xs mt-1 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.type === 'user' && (
              <div className={`p-2 rounded-full ${
                isDark ? 'bg-gray-600' : 'bg-gray-300'
              } flex-shrink-0`}>
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className={`p-2 rounded-full ${
              isDark ? 'bg-indigo-600' : 'bg-indigo-500'
            }`}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className={`p-3 rounded-2xl ${
              isDark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${
        isDark ? 'border-white/10 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
      }`}>

        {/* Voice Review Panel */}
        {showVoiceReview && (
          <div className={`mb-4 p-4 rounded-lg border-2 border-dashed ${
            isDark ? 'border-indigo-400 bg-indigo-900/20' : 'border-indigo-300 bg-indigo-50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Mic className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                Voice Message Transcribed
              </span>
            </div>

            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Please review and edit the transcription below, then choose an action:
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleVoiceConfirm}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
                Send Message
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
          <div className={`mb-4 p-4 rounded-lg ${
            isDark ? 'bg-slate-600/50' : 'bg-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-indigo-500" />
              <div>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Converting speech to text...
                </span>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This may take a moment. If it fails, you can edit the text manually.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className={`mb-4 p-4 rounded-lg border-2 border-dashed ${
            isDark ? 'border-red-400 bg-red-900/20' : 'border-red-300 bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <Mic className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <span className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  Recording your voice...
                </span>
                <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Speak clearly and click the microphone again when finished.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Input Area */}
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={showVoiceReview ? "Edit your voice message above..." : "Share how you're feeling..."}
            disabled={isLoading || isProcessingVoice}
            className={`flex-1 p-3 rounded-lg border resize-none ${
              showVoiceReview
                ? isDark
                  ? 'bg-indigo-900/20 border-indigo-500 text-white placeholder-indigo-300'
                  : 'bg-indigo-50 border-indigo-300 text-gray-900 placeholder-indigo-600'
                : isDark
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            rows={showVoiceReview ? 3 : 1}
          />

          {!showVoiceReview && (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessingVoice}
                className={`p-3 rounded-lg transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : isProcessingVoice
                      ? isDark ? 'bg-slate-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                      : isDark
                        ? 'bg-slate-600 hover:bg-slate-500'
                        : 'bg-gray-200 hover:bg-gray-300'
                } ${isDark ? 'text-white' : 'text-gray-700'}`}
              >
                {isProcessingVoice ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading || isProcessingVoice}
                className={`p-3 rounded-lg transition-all ${
                  !inputMessage.trim() || isLoading || isProcessingVoice
                    ? isDark ? 'bg-slate-600 text-gray-500' : 'bg-gray-200 text-gray-400'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
