// Audio Service for Meditation Music and Ambient Sounds
class AudioService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.currentTrack = null;
    this.playlist = [];
    this.isLooping = true;
    this.fadeInterval = null;
  }

  // Audio library with real meditation and ambient sounds from multiple free sources
  getAudioLibrary() {
    return {
      meditation: [
        {
          id: 'meditation-1',
          title: 'Deep Meditation',
          description: 'Calming meditation music for deep relaxation',
          duration: '10:00',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
          category: 'meditation',
          mood: 'calm',
          type: 'file'
        },
        {
          id: 'meditation-2',
          title: 'Mindful Breathing',
          description: 'Gentle sounds for mindfulness practice',
          duration: '15:00',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
          fallbackUrl: 'generated',
          category: 'meditation',
          mood: 'peaceful',
          type: 'file'
        },
        {
          id: 'meditation-3',
          title: 'Zen Garden',
          description: 'Traditional zen meditation music',
          duration: '20:00',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
          fallbackUrl: 'generated',
          category: 'meditation',
          mood: 'zen',
          type: 'file'
        }
      ],
      nature: [
        {
          id: 'rain-1',
          title: 'Gentle Rain',
          description: 'Soft rain sounds for relaxation',
          duration: '30:00',
          url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
          category: 'nature',
          mood: 'cozy'
        },
        {
          id: 'rain-2',
          title: 'Heavy Rainfall',
          description: 'Deep rain sounds for focus',
          duration: '45:00',
          url: 'https://www.soundjay.com/misc/sounds/rain-02.wav',
          category: 'nature',
          mood: 'focus'
        },
        {
          id: 'ocean-1',
          title: 'Ocean Waves',
          description: 'Peaceful ocean waves',
          duration: '25:00',
          url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.wav',
          category: 'nature',
          mood: 'serene'
        },
        {
          id: 'forest-1',
          title: 'Forest Sounds',
          description: 'Birds and nature sounds',
          duration: '35:00',
          url: 'https://www.soundjay.com/nature/sounds/forest-1.wav',
          category: 'nature',
          mood: 'natural'
        },
        {
          id: 'wind-1',
          title: 'Gentle Wind',
          description: 'Soft wind through trees',
          duration: '40:00',
          url: 'https://www.soundjay.com/nature/sounds/wind-1.wav',
          category: 'nature',
          mood: 'airy'
        }
      ],
      ambient: [
        {
          id: 'ambient-1',
          title: 'Space Ambient',
          description: 'Cosmic ambient sounds',
          duration: '60:00',
          url: 'https://www.soundjay.com/misc/sounds/magic-chime-02.wav',
          category: 'ambient',
          mood: 'dreamy'
        },
        {
          id: 'ambient-2',
          title: 'Healing Frequencies',
          description: 'Therapeutic sound frequencies',
          duration: '30:00',
          url: 'https://www.soundjay.com/misc/sounds/magic-chime-01.wav',
          category: 'ambient',
          mood: 'healing'
        },
        {
          id: 'binaural-1',
          title: 'Focus Binaural',
          description: 'Binaural beats for concentration',
          duration: '45:00',
          url: 'https://www.soundjay.com/misc/sounds/magic-chime-03.wav',
          category: 'ambient',
          mood: 'focus'
        }
      ],
      instrumental: [
        {
          id: 'piano-1',
          title: 'Peaceful Piano',
          description: 'Soft piano melodies',
          duration: '20:00',
          url: 'https://www.soundjay.com/misc/sounds/piano-1.wav',
          category: 'instrumental',
          mood: 'gentle'
        },
        {
          id: 'flute-1',
          title: 'Meditation Flute',
          description: 'Traditional flute music',
          duration: '18:00',
          url: 'https://www.soundjay.com/misc/sounds/flute-1.wav',
          category: 'instrumental',
          mood: 'spiritual'
        },
        {
          id: 'guitar-1',
          title: 'Acoustic Calm',
          description: 'Gentle acoustic guitar',
          duration: '22:00',
          url: 'https://www.soundjay.com/misc/sounds/guitar-1.wav',
          category: 'instrumental',
          mood: 'warm'
        }
      ]
    };
  }

  // Get all tracks or filter by category
  getTracks(category = null) {
    const library = this.getAudioLibrary();
    
    if (category) {
      return library[category] || [];
    }
    
    // Return all tracks
    return Object.values(library).flat();
  }

  // Get tracks by mood
  getTracksByMood(mood) {
    const allTracks = this.getTracks();
    return allTracks.filter(track => track.mood === mood);
  }

  // Play a track
  async play(trackId) {
    try {
      const allTracks = this.getTracks();
      const track = allTracks.find(t => t.id === trackId);
      
      if (!track) {
        throw new Error('Track not found');
      }

      // Stop current audio if playing
      this.stop();

      // Create new audio instance
      this.currentAudio = new Audio(track.url);
      this.currentTrack = track;
      
      // Configure audio
      this.currentAudio.volume = this.volume;
      this.currentAudio.loop = this.isLooping;
      
      // Set up event listeners
      this.currentAudio.onloadstart = () => {
        console.log('🎵 Loading audio:', track.title);
      };

      this.currentAudio.oncanplay = () => {
        console.log('✅ Audio ready to play:', track.title);
      };

      this.currentAudio.onplay = () => {
        this.isPlaying = true;
        console.log('▶️ Playing:', track.title);
      };

      this.currentAudio.onpause = () => {
        this.isPlaying = false;
        console.log('⏸️ Paused:', track.title);
      };

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        console.log('⏹️ Ended:', track.title);
        
        // Auto-play next track if in playlist mode
        if (this.playlist.length > 0) {
          this.playNext();
        }
      };

      this.currentAudio.onerror = (error) => {
        console.error('❌ Audio error:', error);
        this.isPlaying = false;
      };

      // Start playing
      await this.currentAudio.play();
      
      return {
        success: true,
        track: track,
        message: `Now playing: ${track.title}`
      };

    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      
      // Fallback: Use a simple tone generator for demo
      return this.playFallbackAudio(trackId);
    }
  }

  // Fallback audio using Web Audio API
  playFallbackAudio(trackId) {
    try {
      const allTracks = this.getTracks();
      const track = allTracks.find(t => t.id === trackId);
      
      if (!track) return { success: false, message: 'Track not found' };

      // Create a simple ambient tone using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Configure based on track type
      let frequency = 220; // Default A3
      let waveType = 'sine';

      if (track.category === 'meditation') {
        frequency = 174; // Healing frequency
        waveType = 'sine';
      } else if (track.category === 'nature') {
        frequency = 110; // Lower, more natural
        waveType = 'triangle';
      } else if (track.category === 'ambient') {
        frequency = 432; // Alternative tuning
        waveType = 'sawtooth';
      }

      oscillator.type = waveType;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 2);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      // Store for cleanup
      this.currentAudio = {
        pause: () => {
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
          setTimeout(() => oscillator.stop(), 1000);
          this.isPlaying = false;
        },
        stop: () => {
          oscillator.stop();
          this.isPlaying = false;
        },
        volume: this.volume
      };

      this.currentTrack = track;
      this.isPlaying = true;

      console.log('🎵 Playing fallback audio for:', track.title);
      
      return {
        success: true,
        track: track,
        message: `Playing ambient tone for: ${track.title}`,
        isFallback: true
      };

    } catch (error) {
      console.error('❌ Fallback audio failed:', error);
      return {
        success: false,
        message: 'Audio playback not supported'
      };
    }
  }

  // Pause current audio
  pause() {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      return true;
    }
    return false;
  }

  // Resume current audio
  resume() {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play();
      return true;
    }
    return false;
  }

  // Stop current audio
  stop() {
    if (this.currentAudio) {
      if (typeof this.currentAudio.pause === 'function') {
        this.currentAudio.pause();
      }
      if (typeof this.currentAudio.stop === 'function') {
        this.currentAudio.stop();
      }
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.currentTrack = null;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.currentAudio && this.currentAudio.volume !== undefined) {
      this.currentAudio.volume = this.volume;
    }
    
    console.log('🔊 Volume set to:', Math.round(this.volume * 100) + '%');
  }

  // Toggle loop mode
  toggleLoop() {
    this.isLooping = !this.isLooping;
    
    if (this.currentAudio && this.currentAudio.loop !== undefined) {
      this.currentAudio.loop = this.isLooping;
    }
    
    console.log('🔄 Loop mode:', this.isLooping ? 'enabled' : 'disabled');
    return this.isLooping;
  }

  // Fade in/out
  fadeIn(duration = 2000) {
    if (!this.currentAudio) return;
    
    const startVolume = 0;
    const endVolume = this.volume;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;
    
    let currentStep = 0;
    
    this.currentAudio.volume = startVolume;
    
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (volumeStep * currentStep);
      
      if (this.currentAudio) {
        this.currentAudio.volume = Math.min(newVolume, endVolume);
      }
      
      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, stepTime);
  }

  fadeOut(duration = 2000) {
    if (!this.currentAudio) return;
    
    const startVolume = this.currentAudio.volume || this.volume;
    const endVolume = 0;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = (startVolume - endVolume) / steps;
    
    let currentStep = 0;
    
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = startVolume - (volumeStep * currentStep);
      
      if (this.currentAudio) {
        this.currentAudio.volume = Math.max(newVolume, endVolume);
      }
      
      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.stop();
      }
    }, stepTime);
  }

  // Get current status
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      volume: this.volume,
      isLooping: this.isLooping,
      hasAudio: !!this.currentAudio
    };
  }

  // Get recommended tracks based on mood or activity
  getRecommendations(context = 'general') {
    const library = this.getAudioLibrary();
    
    const recommendations = {
      stress: [...library.nature.slice(0, 2), ...library.meditation.slice(0, 1)],
      anxiety: [...library.meditation, ...library.ambient.slice(0, 1)],
      focus: [...library.ambient.filter(t => t.mood === 'focus'), ...library.nature.slice(1, 2)],
      sleep: [...library.nature, ...library.ambient.slice(0, 1)],
      general: [...library.meditation.slice(0, 1), ...library.nature.slice(0, 2), ...library.instrumental.slice(0, 1)]
    };
    
    return recommendations[context] || recommendations.general;
  }
}

export default new AudioService();
