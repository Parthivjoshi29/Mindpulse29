// Text-to-Speech Service for AI Responses
class TextToSpeechService {
  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.voices = [];
    this.selectedVoice = null;
    this.isEnabled = true;
    this.rate = 0.9; // Slightly slower for better comprehension
    this.pitch = 1.0;
    this.volume = 0.8;
    
    if (this.isSupported) {
      this.initializeVoices();
    }
  }

  async initializeVoices() {
    // Wait for voices to load
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = speechSynthesis.getVoices();
        
        if (this.voices.length > 0) {
          this.selectBestVoice();
          resolve();
        } else {
          // Some browsers load voices asynchronously
          setTimeout(loadVoices, 100);
        }
      };

      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    });
  }

  selectBestVoice() {
    // Prefer female voices for mental health context (often perceived as more empathetic)
    const preferredVoices = [
      'Google UK English Female',
      'Microsoft Zira Desktop',
      'Alex',
      'Samantha',
      'Victoria',
      'Karen',
      'Moira',
      'Tessa',
      'Veena',
      'Fiona'
    ];

    // Try to find a preferred voice
    for (const voiceName of preferredVoices) {
      const voice = this.voices.find(v => 
        v.name.includes(voiceName) || 
        v.name.toLowerCase().includes(voiceName.toLowerCase())
      );
      if (voice) {
        this.selectedVoice = voice;
        console.log('🔊 Selected voice:', voice.name);
        return;
      }
    }

    // Fallback: Find any English female voice
    const femaleVoice = this.voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('woman') ||
       v.name.toLowerCase().includes('zira') ||
       v.name.toLowerCase().includes('hazel'))
    );

    if (femaleVoice) {
      this.selectedVoice = femaleVoice;
      console.log('🔊 Selected female voice:', femaleVoice.name);
      return;
    }

    // Final fallback: Any English voice
    const englishVoice = this.voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      this.selectedVoice = englishVoice;
      console.log('🔊 Selected English voice:', englishVoice.name);
    } else if (this.voices.length > 0) {
      this.selectedVoice = this.voices[0];
      console.log('🔊 Selected default voice:', this.voices[0].name);
    }
  }

  async speak(text, options = {}) {
    if (!this.isSupported || !this.isEnabled || !text.trim()) {
      return Promise.resolve();
    }

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        // Clean the text for better speech
        const cleanText = this.cleanTextForSpeech(text);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Configure voice settings
        utterance.voice = this.selectedVoice;
        utterance.rate = options.rate || this.rate;
        utterance.pitch = options.pitch || this.pitch;
        utterance.volume = options.volume || this.volume;

        // Event handlers
        utterance.onstart = () => {
          console.log('🔊 Started speaking:', cleanText.substring(0, 50) + '...');
        };

        utterance.onend = () => {
          console.log('✅ Finished speaking');
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event.error);
          reject(new Error(`Speech synthesis failed: ${event.error}`));
        };

        // Start speaking
        speechSynthesis.speak(utterance);

      } catch (error) {
        console.error('❌ Text-to-speech error:', error);
        reject(error);
      }
    });
  }

  cleanTextForSpeech(text) {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/#{1,6}\s/g, '') // Headers
      
      // Remove emojis and special characters that don't speak well
      .replace(/[🎯🔄✅❌💙🌟⭐🎉🚀🎪🏆🎨🔧💡🎭🎤🔊]/g, '')
      
      // Replace common abbreviations
      .replace(/\bAI\b/g, 'A I')
      .replace(/\bUI\b/g, 'U I')
      .replace(/\bUX\b/g, 'U X')
      .replace(/\bAPI\b/g, 'A P I')
      
      // Add pauses for better flow
      .replace(/\. /g, '. ') // Ensure space after periods
      .replace(/\? /g, '? ') // Ensure space after questions
      .replace(/! /g, '! ') // Ensure space after exclamations
      
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  stop() {
    if (this.isSupported && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      console.log('🔇 Stopped speaking');
    }
  }

  pause() {
    if (this.isSupported && speechSynthesis.speaking) {
      speechSynthesis.pause();
      console.log('⏸️ Paused speaking');
    }
  }

  resume() {
    if (this.isSupported && speechSynthesis.paused) {
      speechSynthesis.resume();
      console.log('▶️ Resumed speaking');
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
    }
    console.log('🔊 Text-to-speech:', this.isEnabled ? 'enabled' : 'disabled');
    return this.isEnabled;
  }

  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(2.0, rate));
    console.log('🔊 Speech rate set to:', this.rate);
  }

  setPitch(pitch) {
    this.pitch = Math.max(0.0, Math.min(2.0, pitch));
    console.log('🔊 Speech pitch set to:', this.pitch);
  }

  setVolume(volume) {
    this.volume = Math.max(0.0, Math.min(1.0, volume));
    console.log('🔊 Speech volume set to:', this.volume);
  }

  getAvailableVoices() {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  setVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
      console.log('🔊 Voice changed to:', voice.name);
      return true;
    }
    return false;
  }

  getStatus() {
    return {
      isSupported: this.isSupported,
      isEnabled: this.isEnabled,
      isSpeaking: this.isSupported ? speechSynthesis.speaking : false,
      isPaused: this.isSupported ? speechSynthesis.paused : false,
      selectedVoice: this.selectedVoice?.name || 'None',
      availableVoices: this.voices.length,
      settings: {
        rate: this.rate,
        pitch: this.pitch,
        volume: this.volume
      }
    };
  }

  // Test function
  async test() {
    try {
      console.log('🧪 Testing text-to-speech...');
      await this.speak('Hello! I am your AI wellness companion. How are you feeling today?');
      console.log('✅ Text-to-speech test completed');
      return true;
    } catch (error) {
      console.error('❌ Text-to-speech test failed:', error);
      return false;
    }
  }
}

export default new TextToSpeechService();
