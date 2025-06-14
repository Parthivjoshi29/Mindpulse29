// Enhanced Audio Service with Multiple Free Sources
class EnhancedAudioService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.currentTrack = null;
    this.isLooping = true;
    this.fadeInterval = null;
  }

  // Audio library with real sounds from multiple free sources
  getAudioLibrary() {
    return {
      meditation: [
        {
          id: 'meditation-1',
          title: 'Tibetan Singing Bowl',
          description: 'Authentic Tibetan singing bowl meditation',
          duration: '5:00',
          urls: [
            'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a'
          ],
          category: 'meditation',
          mood: 'zen',
          type: 'real'
        },
        {
          id: 'meditation-2',
          title: 'Meditation Chimes',
          description: 'Gentle chimes for mindfulness practice',
          duration: '8:00',
          urls: [
            'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
            'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3'
          ],
          category: 'meditation',
          mood: 'peaceful',
          type: 'real'
        },
        {
          id: 'meditation-3',
          title: 'Deep Meditation Bell',
          description: 'Traditional meditation bell for deep practice',
          duration: '10:00',
          urls: [
            'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav'
          ],
          category: 'meditation',
          mood: 'calm',
          type: 'real'
        },
        {
          id: 'meditation-4',
          title: 'Om Chanting',
          description: 'Sacred Om meditation sound',
          duration: '12:00',
          urls: ['generated'],
          category: 'meditation',
          mood: 'spiritual',
          type: 'generated'
        }
      ],
      nature: [
        {
          id: 'rain-1',
          title: 'Gentle Rain',
          description: 'Soft rain sounds for relaxation',
          duration: '30:00',
          urls: [
            'https://www.soundjay.com/misc/sounds/rain-01.wav',
            'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/start.ogg'
          ],
          category: 'nature',
          mood: 'cozy',
          type: 'real'
        },
        {
          id: 'rain-2',
          title: 'Heavy Rainfall',
          description: 'Deep rain sounds for focus',
          duration: '45:00',
          urls: ['generated'],
          category: 'nature',
          mood: 'focus',
          type: 'generated'
        },
        {
          id: 'ocean-1',
          title: 'Ocean Waves',
          description: 'Peaceful ocean waves',
          duration: '25:00',
          urls: [
            'https://www.soundjay.com/nature/sounds/ocean-wave-1.wav',
            'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg'
          ],
          category: 'nature',
          mood: 'serene',
          type: 'real'
        },
        {
          id: 'forest-1',
          title: 'Forest Ambience',
          description: 'Birds and forest sounds',
          duration: '35:00',
          urls: ['generated'],
          category: 'nature',
          mood: 'natural',
          type: 'generated'
        },
        {
          id: 'wind-1',
          title: 'Gentle Wind',
          description: 'Soft wind through trees',
          duration: '20:00',
          urls: ['generated'],
          category: 'nature',
          mood: 'airy',
          type: 'generated'
        }
      ],
      ambient: [
        {
          id: 'ambient-1',
          title: 'Space Ambient',
          description: 'Cosmic ambient soundscape',
          duration: '45:00',
          urls: [
            'https://www.soundjay.com/misc/sounds/magic-chime-02.wav',
            'https://commondatastorage.googleapis.com/codeskulptor-demos/GalaxyInvaders/theme_01.mp3'
          ],
          category: 'ambient',
          mood: 'dreamy',
          type: 'real'
        },
        {
          id: 'ambient-2',
          title: 'Healing Frequencies',
          description: 'Therapeutic healing tones',
          duration: '30:00',
          urls: ['generated'],
          category: 'ambient',
          mood: 'healing',
          type: 'generated'
        },
        {
          id: 'ambient-3',
          title: 'Binaural Focus',
          description: 'Binaural beats for concentration',
          duration: '40:00',
          urls: ['generated'],
          category: 'ambient',
          mood: 'focus',
          type: 'generated'
        },
        {
          id: 'ambient-4',
          title: 'Crystal Bowls',
          description: 'Crystal singing bowl harmonics',
          duration: '25:00',
          urls: [
            'https://www.soundjay.com/misc/sounds/magic-chime-01.wav'
          ],
          category: 'ambient',
          mood: 'ethereal',
          type: 'real'
        }
      ],
      instrumental: [
        {
          id: 'piano-1',
          title: 'Peaceful Piano',
          description: 'Soft piano melodies for relaxation',
          duration: '20:00',
          urls: [
            'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
            'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
          ],
          category: 'instrumental',
          mood: 'gentle',
          type: 'real'
        },
        {
          id: 'flute-1',
          title: 'Meditation Flute',
          description: 'Traditional flute music',
          duration: '18:00',
          urls: ['generated'],
          category: 'instrumental',
          mood: 'spiritual',
          type: 'generated'
        },
        {
          id: 'guitar-1',
          title: 'Acoustic Calm',
          description: 'Gentle acoustic guitar',
          duration: '22:00',
          urls: ['generated'],
          category: 'instrumental',
          mood: 'warm',
          type: 'generated'
        },
        {
          id: 'harp-1',
          title: 'Celestial Harp',
          description: 'Ethereal harp melodies',
          duration: '15:00',
          urls: ['generated'],
          category: 'instrumental',
          mood: 'heavenly',
          type: 'generated'
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
    
    return Object.values(library).flat();
  }

  // Get tracks by mood
  getTracksByMood(mood) {
    const allTracks = this.getTracks();
    return allTracks.filter(track => track.mood === mood);
  }

  // Try multiple URLs until one works
  async tryUrls(urls) {
    for (const url of urls) {
      if (url === 'generated') {
        continue; // Skip generated placeholder
      }
      
      try {
        const audio = new Audio(url);
        
        // Test if the audio can be loaded
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
          
          audio.oncanplaythrough = () => {
            clearTimeout(timeout);
            resolve();
          };
          audio.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Load failed'));
          };
          audio.onabort = () => {
            clearTimeout(timeout);
            reject(new Error('Load aborted'));
          };
          
          audio.load();
        });
        
        return audio;
      } catch (error) {
        console.log(`Failed to load ${url}:`, error.message);
        continue;
      }
    }
    
    throw new Error('All audio URLs failed to load');
  }

  // Play a track with fallback support
  async play(trackId) {
    try {
      const allTracks = this.getTracks();
      const track = allTracks.find(t => t.id === trackId);
      
      if (!track) {
        throw new Error('Track not found');
      }

      // Stop current audio if playing
      this.stop();

      console.log('🎵 Attempting to play:', track.title);

      // If track is designed for generated audio or all URLs fail
      if (track.type === 'generated' || track.urls[0] === 'generated') {
        return this.playGeneratedAudio(track);
      }

      try {
        // Try to load real audio files
        this.currentAudio = await this.tryUrls(track.urls);
        this.currentTrack = track;
        
        // Configure audio
        this.currentAudio.volume = this.volume;
        this.currentAudio.loop = this.isLooping;
        
        // Set up event listeners
        this.currentAudio.onplay = () => {
          this.isPlaying = true;
          console.log('▶️ Playing real audio:', track.title);
        };

        this.currentAudio.onpause = () => {
          this.isPlaying = false;
          console.log('⏸️ Paused:', track.title);
        };

        this.currentAudio.onended = () => {
          this.isPlaying = false;
          console.log('⏹️ Ended:', track.title);
        };

        this.currentAudio.onerror = (error) => {
          console.error('❌ Audio playback error:', error);
          this.isPlaying = false;
        };

        // Start playing
        await this.currentAudio.play();
        
        return {
          success: true,
          track: track,
          message: `Now playing: ${track.title}`,
          source: 'real_audio'
        };

      } catch (audioError) {
        console.log('Real audio failed, using generated fallback');
        return this.playGeneratedAudio(track);
      }

    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      return {
        success: false,
        message: `Failed to play: ${error.message}`
      };
    }
  }

  // Generate enhanced audio using Web Audio API
  playGeneratedAudio(track) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Get configuration based on track
      let config = this.getEnhancedAudioConfig(track);
      
      // Create multiple oscillators for richer sound
      const oscillators = [];
      const gainNodes = [];
      const filterNodes = [];

      for (let i = 0; i < config.oscillators.length; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        const oscConfig = config.oscillators[i];

        // Configure oscillator
        osc.type = oscConfig.waveType;
        osc.frequency.setValueAtTime(oscConfig.frequency, audioContext.currentTime);

        // Configure filter
        filter.type = oscConfig.filterType;
        filter.frequency.setValueAtTime(oscConfig.filterFreq, audioContext.currentTime);
        filter.Q.setValueAtTime(oscConfig.filterQ, audioContext.currentTime);

        // Configure gain with envelope
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(
          this.volume * oscConfig.volume, 
          audioContext.currentTime + oscConfig.attack
        );

        // Connect nodes
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();

        oscillators.push(osc);
        gainNodes.push(gain);
        filterNodes.push(filter);
      }

      // Store for cleanup
      this.currentAudio = {
        pause: () => {
          gainNodes.forEach(gain => {
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
          });
          setTimeout(() => {
            oscillators.forEach(osc => {
              try { osc.stop(); } catch (e) {}
            });
          }, 500);
          this.isPlaying = false;
        },
        stop: () => {
          oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
          });
          this.isPlaying = false;
        },
        volume: this.volume,
        loop: this.isLooping
      };

      this.currentTrack = track;
      this.isPlaying = true;

      console.log('🎵 Playing enhanced generated audio for:', track.title);
      
      return {
        success: true,
        track: track,
        message: `Playing enhanced audio for: ${track.title}`,
        source: 'generated',
        note: 'Using high-quality synthesized audio'
      };

    } catch (error) {
      console.error('❌ Generated audio failed:', error);
      return {
        success: false,
        message: 'Audio playback not supported'
      };
    }
  }

  // Get enhanced configuration for generated audio
  getEnhancedAudioConfig(track) {
    const configs = {
      'meditation-4': { // Om Chanting
        oscillators: [
          { waveType: 'sine', frequency: 110, filterType: 'lowpass', filterFreq: 400, filterQ: 1, volume: 0.3, attack: 3 },
          { waveType: 'sine', frequency: 220, filterType: 'lowpass', filterFreq: 600, filterQ: 1, volume: 0.2, attack: 4 }
        ]
      },
      'rain-2': { // Heavy Rainfall
        oscillators: [
          { waveType: 'triangle', frequency: 80, filterType: 'bandpass', filterFreq: 300, filterQ: 3, volume: 0.4, attack: 1 },
          { waveType: 'sawtooth', frequency: 40, filterType: 'highpass', filterFreq: 100, filterQ: 0.5, volume: 0.3, attack: 2 }
        ]
      },
      'forest-1': { // Forest Ambience
        oscillators: [
          { waveType: 'triangle', frequency: 200, filterType: 'bandpass', filterFreq: 800, filterQ: 2, volume: 0.2, attack: 1 },
          { waveType: 'sine', frequency: 400, filterType: 'lowpass', filterFreq: 1200, filterQ: 1, volume: 0.15, attack: 3 }
        ]
      },
      'wind-1': { // Gentle Wind
        oscillators: [
          { waveType: 'sawtooth', frequency: 60, filterType: 'lowpass', filterFreq: 200, filterQ: 0.7, volume: 0.3, attack: 2 }
        ]
      },
      'ambient-2': { // Healing Frequencies
        oscillators: [
          { waveType: 'sine', frequency: 174, filterType: 'lowpass', filterFreq: 800, filterQ: 1, volume: 0.25, attack: 4 },
          { waveType: 'sine', frequency: 528, filterType: 'lowpass', filterFreq: 1000, filterQ: 1, volume: 0.2, attack: 5 }
        ]
      },
      'ambient-3': { // Binaural Focus
        oscillators: [
          { waveType: 'sine', frequency: 40, filterType: 'lowpass', filterFreq: 100, filterQ: 1, volume: 0.3, attack: 3 },
          { waveType: 'sine', frequency: 50, filterType: 'lowpass', filterFreq: 120, filterQ: 1, volume: 0.3, attack: 3 }
        ]
      },
      'flute-1': { // Meditation Flute
        oscillators: [
          { waveType: 'sine', frequency: 440, filterType: 'lowpass', filterFreq: 2000, filterQ: 1, volume: 0.3, attack: 1.5 },
          { waveType: 'triangle', frequency: 880, filterType: 'lowpass', filterFreq: 1500, filterQ: 1, volume: 0.15, attack: 2 }
        ]
      },
      'guitar-1': { // Acoustic Calm
        oscillators: [
          { waveType: 'triangle', frequency: 220, filterType: 'lowpass', filterFreq: 1000, filterQ: 1, volume: 0.35, attack: 1 },
          { waveType: 'sine', frequency: 330, filterType: 'lowpass', filterFreq: 800, filterQ: 1, volume: 0.2, attack: 1.5 }
        ]
      },
      'harp-1': { // Celestial Harp
        oscillators: [
          { waveType: 'sine', frequency: 523, filterType: 'lowpass', filterFreq: 2000, filterQ: 1, volume: 0.3, attack: 0.5 },
          { waveType: 'triangle', frequency: 659, filterType: 'lowpass', filterFreq: 1800, filterQ: 1, volume: 0.2, attack: 1 }
        ]
      }
    };

    // Default configuration
    const defaultConfig = {
      oscillators: [
        { waveType: 'sine', frequency: 174, filterType: 'lowpass', filterFreq: 800, filterQ: 1, volume: 0.3, attack: 2 }
      ]
    };

    return configs[track.id] || defaultConfig;
  }

  // Pause current audio
  pause() {
    if (this.currentAudio && this.isPlaying) {
      if (typeof this.currentAudio.pause === 'function') {
        this.currentAudio.pause();
      }
      return true;
    }
    return false;
  }

  // Resume current audio
  resume() {
    if (this.currentAudio && !this.isPlaying) {
      if (typeof this.currentAudio.play === 'function') {
        this.currentAudio.play();
      }
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

  // Get recommended tracks
  getRecommendations(context = 'general') {
    const allTracks = this.getTracks();
    
    const recommendations = {
      stress: allTracks.filter(t => ['calm', 'peaceful', 'zen'].includes(t.mood)).slice(0, 5),
      anxiety: allTracks.filter(t => t.category === 'meditation').slice(0, 5),
      focus: allTracks.filter(t => t.mood === 'focus' || t.category === 'ambient').slice(0, 5),
      sleep: allTracks.filter(t => ['nature', 'ambient'].includes(t.category)).slice(0, 5),
      general: allTracks.slice(0, 8)
    };
    
    return recommendations[context] || recommendations.general;
  }
}

export default new EnhancedAudioService();
