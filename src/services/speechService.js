// Speech Recognition Service using Groq Whisper API
class SpeechService {
  constructor() {
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';

    if (!this.groqApiKey) {
      console.error('❌ VITE_GROQ_API_KEY not found in environment variables');
      throw new Error('Groq API key is required. Please add VITE_GROQ_API_KEY to your .env file.');
    }
  }

  async transcribeAudio(audioBlob) {
    try {
      console.log('🎤 Starting audio transcription with Groq Whisper...');
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');
      formData.append('response_format', 'json');
      formData.append('temperature', '0');

      // Make API request
      const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const transcript = result.text || '';

      if (!transcript.trim()) {
        throw new Error('No speech detected in the audio');
      }

      console.log('✅ Transcription successful:', transcript);
      return transcript.trim();

    } catch (error) {
      console.error('❌ Transcription failed:', error);
      throw new Error(`Speech recognition failed: ${error.message}`);
    }
  }

  async recordAudio(duration = 5000) {
    try {
      console.log('🎤 Starting audio recording...');

      // Check for microphone support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser');
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getSupportedMimeType()
      });

      const audioChunks = [];

      return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          console.log('✅ Recording completed, blob size:', audioBlob.size);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          resolve(audioBlob);
        };

        mediaRecorder.onerror = (event) => {
          console.error('❌ Recording error:', event.error);
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Recording failed'));
        };

        // Start recording
        mediaRecorder.start();
        console.log('🔴 Recording started...');

        // Stop recording after specified duration
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            console.log('⏹️ Recording stopped after', duration, 'ms');
          }
        }, duration);
      });

    } catch (error) {
      console.error('❌ Recording setup failed:', error);
      throw new Error(`Recording failed: ${error.message}`);
    }
  }

  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('📱 Using MIME type:', type);
        return type;
      }
    }

    console.log('📱 Using default MIME type');
    return 'audio/webm';
  }

  async recordAndTranscribe(duration = 5000) {
    try {
      console.log('🎤 Starting record and transcribe process...');
      
      // Record audio
      const audioBlob = await this.recordAudio(duration);
      
      // Transcribe audio
      const transcript = await this.transcribeAudio(audioBlob);
      
      return {
        success: true,
        transcript,
        audioBlob,
        duration
      };

    } catch (error) {
      console.error('❌ Record and transcribe failed:', error);
      return {
        success: false,
        error: error.message,
        transcript: '',
        audioBlob: null,
        duration
      };
    }
  }

  // Test function to check if everything is working
  async testSpeechRecognition() {
    try {
      console.log('🧪 Testing speech recognition system...');
      
      // Check browser support
      const support = {
        mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        mediaRecorder: !!window.MediaRecorder,
        fetch: !!window.fetch
      };

      console.log('📱 Browser support:', support);

      if (!support.mediaDevices) {
        throw new Error('Microphone access not supported');
      }

      if (!support.mediaRecorder) {
        throw new Error('Audio recording not supported');
      }

      if (!support.fetch) {
        throw new Error('Network requests not supported');
      }

      // Test microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Microphone access test passed');
      console.log('✅ Speech recognition system ready');

      return {
        success: true,
        support,
        message: 'Speech recognition system is ready'
      };

    } catch (error) {
      console.error('❌ Speech recognition test failed:', error);
      return {
        success: false,
        support: null,
        message: error.message
      };
    }
  }
}

export default new SpeechService();
