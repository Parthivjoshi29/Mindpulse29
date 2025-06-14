// Pixabay Audio Service for Real Meditation Music and Sounds
class PixabayAudioService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.currentTrack = null;
    this.isLooping = true;
    this.fadeInterval = null;
    this.apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
    this.baseUrl = 'https://pixabay.com/api/sounds/';
    this.cachedTracks = new Map();
  }

  // Search categories for different types of meditation sounds (optimized for Pixabay)
  getSearchCategories() {
    return {
      meditation: [
        'meditation',
        'zen',
        'mindfulness',
        'tibetan',
        'spiritual',
        'relaxation'
      ],
      nature: [
        'rain',
        'ocean',
        'forest',
        'birds',
        'water',
        'nature'
      ],
      ambient: [
        'ambient',
        'space',
        'drone',
        'atmospheric',
        'healing',
        'binaural'
      ],
      instrumental: [
        'piano',
        'flute',
        'guitar',
        'harp',
        'acoustic',
        'instrumental'
      ]
    };
  }

  // Fetch tracks from Pixabay API
  async fetchTracksFromPixabay(category, searchTerm, perPage = 20) {
    try {
      const cacheKey = `${category}-${searchTerm}`;
      
      // Check cache first
      if (this.cachedTracks.has(cacheKey)) {
        console.log('🎵 Using cached tracks for:', searchTerm);
        return this.cachedTracks.get(cacheKey);
      }

      console.log('🔍 Fetching tracks from Pixabay:', searchTerm);

      const params = new URLSearchParams({
        key: this.apiKey,
        q: searchTerm,
        per_page: perPage,
        safesearch: 'true',
        order: 'popular'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.hits || data.hits.length === 0) {
        console.log('No tracks found for:', searchTerm);
        return [];
      }

      // Transform Pixabay sounds data to our format
      const tracks = data.hits.map((hit, index) => ({
        id: `${category}-${hit.id}`,
        title: hit.tags.split(',')[0].trim() || `${category} Sound ${index + 1}`,
        description: hit.tags || `${category} sounds from Pixabay`,
        duration: this.formatDuration(hit.duration),
        url: hit.audio, // Audio file URL from Pixabay sounds API
        previewUrl: hit.audio, // Same as main audio
        category: category,
        mood: this.getMoodFromTags(hit.tags),
        type: 'pixabay',
        pixabayId: hit.id,
        tags: hit.tags,
        user: hit.user,
        downloads: hit.downloads,
        size: hit.size
      }));

      // Cache the results
      this.cachedTracks.set(cacheKey, tracks);
      
      console.log(`✅ Fetched ${tracks.length} tracks for ${searchTerm}`);
      return tracks;

    } catch (error) {
      console.error('❌ Error fetching from Pixabay:', error);
      return [];
    }
  }

  // Get mood from Pixabay tags
  getMoodFromTags(tags) {
    const tagLower = tags.toLowerCase();
    
    if (tagLower.includes('calm') || tagLower.includes('peaceful')) return 'calm';
    if (tagLower.includes('zen') || tagLower.includes('meditation')) return 'zen';
    if (tagLower.includes('relax') || tagLower.includes('soothing')) return 'peaceful';
    if (tagLower.includes('focus') || tagLower.includes('concentration')) return 'focus';
    if (tagLower.includes('healing') || tagLower.includes('therapy')) return 'healing';
    if (tagLower.includes('nature') || tagLower.includes('forest')) return 'natural';
    if (tagLower.includes('rain') || tagLower.includes('water')) return 'cozy';
    if (tagLower.includes('ocean') || tagLower.includes('wave')) return 'serene';
    if (tagLower.includes('ambient') || tagLower.includes('space')) return 'dreamy';
    if (tagLower.includes('gentle') || tagLower.includes('soft')) return 'gentle';
    
    return 'calm'; // Default mood
  }

  // Format duration from seconds to MM:SS
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get all tracks with Pixabay integration
  async getTracks(category = null) {
    try {
      const categories = this.getSearchCategories();
      let allTracks = [];

      if (category && categories[category]) {
        // Fetch tracks for specific category
        for (const searchTerm of categories[category]) {
          const tracks = await this.fetchTracksFromPixabay(category, searchTerm, 5);
          allTracks = allTracks.concat(tracks);
        }
      } else {
        // Fetch tracks for all categories
        for (const [cat, searchTerms] of Object.entries(categories)) {
          for (const searchTerm of searchTerms.slice(0, 2)) { // Limit to 2 searches per category
            const tracks = await this.fetchTracksFromPixabay(cat, searchTerm, 3);
            allTracks = allTracks.concat(tracks);
          }
        }
      }

      // Remove duplicates and limit results
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.pixabayId === track.pixabayId)
      );

      return uniqueTracks.slice(0, 50); // Limit to 50 tracks total

    } catch (error) {
      console.error('❌ Error getting tracks:', error);
      return this.getFallbackTracks(category);
    }
  }

  // Get tracks by mood
  async getTracksByMood(mood) {
    const allTracks = await this.getTracks();
    return allTracks.filter(track => track.mood === mood);
  }

  // Fallback tracks if Pixabay fails
  getFallbackTracks(category = null) {
    const fallbackTracks = {
      meditation: [
        {
          id: 'fallback-meditation-1',
          title: 'Meditation Bell',
          description: 'Traditional meditation bell sound',
          duration: '5:00',
          url: 'generated',
          category: 'meditation',
          mood: 'zen',
          type: 'fallback'
        }
      ],
      nature: [
        {
          id: 'fallback-nature-1',
          title: 'Rain Sounds',
          description: 'Gentle rain for relaxation',
          duration: '10:00',
          url: 'generated',
          category: 'nature',
          mood: 'cozy',
          type: 'fallback'
        }
      ],
      ambient: [
        {
          id: 'fallback-ambient-1',
          title: 'Ambient Tones',
          description: 'Peaceful ambient soundscape',
          duration: '15:00',
          url: 'generated',
          category: 'ambient',
          mood: 'dreamy',
          type: 'fallback'
        }
      ],
      instrumental: [
        {
          id: 'fallback-instrumental-1',
          title: 'Peaceful Piano',
          description: 'Soft piano melodies',
          duration: '8:00',
          url: 'generated',
          category: 'instrumental',
          mood: 'gentle',
          type: 'fallback'
        }
      ]
    };

    if (category) {
      return fallbackTracks[category] || [];
    }

    return Object.values(fallbackTracks).flat();
  }

  // Play a track
  async play(trackId) {
    try {
      const allTracks = await this.getTracks();
      const track = allTracks.find(t => t.id === trackId);
      
      if (!track) {
        throw new Error('Track not found');
      }

      // Stop current audio if playing
      this.stop();

      console.log('🎵 Playing track:', track.title);

      if (track.url === 'generated' || track.type === 'fallback') {
        // Use generated audio for fallback tracks
        return this.playGeneratedAudio(track);
      }

      try {
        // Try to play real Pixabay audio
        this.currentAudio = new Audio(track.url);
        this.currentTrack = track;
        
        // Configure audio
        this.currentAudio.volume = this.volume;
        this.currentAudio.loop = this.isLooping;
        this.currentAudio.crossOrigin = 'anonymous'; // For CORS
        
        // Set up event listeners
        this.currentAudio.onloadstart = () => {
          console.log('🎵 Loading Pixabay audio:', track.title);
        };

        this.currentAudio.oncanplay = () => {
          console.log('✅ Pixabay audio ready:', track.title);
        };

        this.currentAudio.onplay = () => {
          this.isPlaying = true;
          console.log('▶️ Playing Pixabay audio:', track.title);
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
          console.error('❌ Pixabay audio error:', error);
          this.isPlaying = false;
          // Fallback to generated audio
          return this.playGeneratedAudio(track);
        };

        // Start playing
        await this.currentAudio.play();
        
        return {
          success: true,
          track: track,
          message: `Now playing: ${track.title}`,
          source: 'pixabay'
        };

      } catch (audioError) {
        console.log('Pixabay audio failed, using generated fallback');
        return this.playGeneratedAudio(track);
      }

    } catch (error) {
      console.error('❌ Failed to play track:', error);
      return {
        success: false,
        message: `Failed to play: ${error.message}`
      };
    }
  }

  // Generate audio using Web Audio API as fallback
  playGeneratedAudio(track) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create different sounds based on category
      let config = this.getGeneratedAudioConfig(track.category, track.mood);
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();

      // Configure oscillator
      oscillator.type = config.waveType;
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);

      // Configure filter for more natural sound
      filterNode.type = config.filterType;
      filterNode.frequency.setValueAtTime(config.filterFreq, audioContext.currentTime);
      filterNode.Q.setValueAtTime(config.filterQ, audioContext.currentTime);

      // Configure gain with envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * config.volume, audioContext.currentTime + config.attack);
      
      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      // Store for cleanup
      this.currentAudio = {
        pause: () => {
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
          setTimeout(() => {
            try { oscillator.stop(); } catch (e) {}
          }, 500);
          this.isPlaying = false;
        },
        stop: () => {
          try { oscillator.stop(); } catch (e) {}
          this.isPlaying = false;
        },
        volume: this.volume,
        loop: this.isLooping
      };

      this.currentTrack = track;
      this.isPlaying = true;

      console.log('🎵 Playing generated audio for:', track.title);
      
      return {
        success: true,
        track: track,
        message: `Playing generated audio for: ${track.title}`,
        source: 'generated',
        note: 'Using synthesized audio - Pixabay tracks loading'
      };

    } catch (error) {
      console.error('❌ Generated audio failed:', error);
      return {
        success: false,
        message: 'Audio playback not supported'
      };
    }
  }

  // Get configuration for generated audio
  getGeneratedAudioConfig(category, mood) {
    const configs = {
      meditation: {
        waveType: 'sine',
        frequency: 174, // Healing frequency
        filterType: 'lowpass',
        filterFreq: 800,
        filterQ: 1,
        volume: 0.3,
        attack: 2
      },
      nature: {
        waveType: 'triangle',
        frequency: 110,
        filterType: 'bandpass',
        filterFreq: 400,
        filterQ: 2,
        volume: 0.4,
        attack: 1
      },
      ambient: {
        waveType: 'sawtooth',
        frequency: 55,
        filterType: 'lowpass',
        filterFreq: 200,
        filterQ: 0.5,
        volume: 0.2,
        attack: 3
      },
      instrumental: {
        waveType: 'sine',
        frequency: 220,
        filterType: 'lowpass',
        filterFreq: 1000,
        filterQ: 1,
        volume: 0.35,
        attack: 1.5
      }
    };

    return configs[category] || configs.meditation;
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
  async getRecommendations(context = 'general') {
    const allTracks = await this.getTracks();
    
    const recommendations = {
      stress: allTracks.filter(t => ['calm', 'peaceful', 'zen'].includes(t.mood)).slice(0, 5),
      anxiety: allTracks.filter(t => ['meditation', 'zen', 'healing'].includes(t.category)).slice(0, 5),
      focus: allTracks.filter(t => t.mood === 'focus' || t.category === 'ambient').slice(0, 5),
      sleep: allTracks.filter(t => ['nature', 'ambient'].includes(t.category)).slice(0, 5),
      general: allTracks.slice(0, 8)
    };
    
    return recommendations[context] || recommendations.general;
  }

  // Clear cache (useful for refreshing content)
  clearCache() {
    this.cachedTracks.clear();
    console.log('🗑️ Audio cache cleared');
  }
}

export default new PixabayAudioService();
