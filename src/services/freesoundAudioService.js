// Freesound Audio Service for High-Quality Meditation and Ambient Sounds
class FreesoundAudioService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.currentTrack = null;
    this.isLooping = true;
    this.fadeInterval = null;
    this.clientId = import.meta.env.VITE_FREESOUND_CLIENT_ID;
    this.apiKey = import.meta.env.VITE_FREESOUND_API_KEY;
    this.baseUrl = 'https://freesound.org/apiv2';
    this.cachedTracks = new Map();
  }

  // Search categories optimized for Freesound
  getSearchCategories() {
    return {
      meditation: [
        { query: 'meditation', tags: ['meditation', 'zen', 'mindfulness'] },
        { query: 'singing bowl', tags: ['tibetan', 'bowl', 'bell'] },
        { query: 'zen', tags: ['zen', 'buddhist', 'spiritual'] },
        { query: 'chimes', tags: ['chimes', 'bells', 'meditation'] },
        { query: 'om', tags: ['om', 'mantra', 'chanting'] }
      ],
      nature: [
        { query: 'rain', tags: ['rain', 'storm', 'weather'] },
        { query: 'ocean waves', tags: ['ocean', 'waves', 'sea'] },
        { query: 'forest', tags: ['forest', 'birds', 'nature'] },
        { query: 'water stream', tags: ['water', 'stream', 'river'] },
        { query: 'wind', tags: ['wind', 'breeze', 'air'] },
        { query: 'thunder', tags: ['thunder', 'storm', 'rain'] }
      ],
      ambient: [
        { query: 'ambient drone', tags: ['ambient', 'drone', 'atmospheric'] },
        { query: 'space ambient', tags: ['space', 'cosmic', 'ethereal'] },
        { query: 'healing frequencies', tags: ['healing', 'frequency', 'therapy'] },
        { query: 'binaural beats', tags: ['binaural', 'beats', 'brainwave'] },
        { query: 'white noise', tags: ['white-noise', 'noise', 'background'] }
      ],
      instrumental: [
        { query: 'piano meditation', tags: ['piano', 'peaceful', 'calm'] },
        { query: 'flute meditation', tags: ['flute', 'meditation', 'wind'] },
        { query: 'guitar ambient', tags: ['guitar', 'ambient', 'acoustic'] },
        { query: 'harp', tags: ['harp', 'strings', 'ethereal'] },
        { query: 'synthesizer pad', tags: ['synthesizer', 'pad', 'ambient'] }
      ]
    };
  }

  // Fetch tracks from Freesound API
  async fetchTracksFromFreesound(category, searchConfig, perPage = 15) {
    try {
      const cacheKey = `${category}-${searchConfig.query}`;
      
      // Check cache first
      if (this.cachedTracks.has(cacheKey)) {
        console.log('🎵 Using cached tracks for:', searchConfig.query);
        return this.cachedTracks.get(cacheKey);
      }

      console.log('🔍 Fetching tracks from Freesound:', searchConfig.query);

      // Build search URL with combined search
      const params = new URLSearchParams({
        token: this.apiKey,
        query: searchConfig.query,
        filter: `tag:${searchConfig.tags.join(' OR tag:')}`,
        fields: 'id,name,description,tags,duration,username,download_count,previews',
        page_size: perPage,
        sort: 'downloads_desc'
      });

      const response = await fetch(`${this.baseUrl}/search/text/?${params}`);
      
      if (!response.ok) {
        throw new Error(`Freesound API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log('No tracks found for:', searchConfig.query);
        return [];
      }

      // Transform Freesound data to our format
      const tracks = data.results.map((sound, index) => ({
        id: `${category}-${sound.id}`,
        title: this.cleanTitle(sound.name) || `${category} Sound ${index + 1}`,
        description: this.cleanDescription(sound.description) || `${category} sound from Freesound`,
        duration: this.formatDuration(sound.duration),
        url: sound.previews['preview-hq-mp3'] || sound.previews['preview-lq-mp3'], // High quality preview
        streamUrl: sound.previews['preview-hq-mp3'], // For streaming
        category: category,
        mood: this.getMoodFromTags(sound.tags.join(' ')),
        type: 'freesound',
        freesoundId: sound.id,
        tags: sound.tags,
        user: sound.username,
        downloads: sound.download_count,
        originalName: sound.name
      }));

      // Cache the results
      this.cachedTracks.set(cacheKey, tracks);
      
      console.log(`✅ Fetched ${tracks.length} tracks for ${searchConfig.query}`);
      return tracks;

    } catch (error) {
      console.error('❌ Error fetching from Freesound:', error);
      return [];
    }
  }

  // Clean and format track titles
  cleanTitle(name) {
    if (!name) return null;
    
    // Remove file extensions and common prefixes
    let cleaned = name
      .replace(/\.(wav|mp3|aiff|flac)$/i, '')
      .replace(/^(freesound_|fs_)/i, '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Capitalize first letter of each word
    cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
    
    return cleaned;
  }

  // Clean and format descriptions
  cleanDescription(description) {
    if (!description) return null;
    
    // Limit description length and clean up
    let cleaned = description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 97) + '...';
    }
    
    return cleaned;
  }

  // Get mood from Freesound tags
  getMoodFromTags(tagsString) {
    const tags = tagsString.toLowerCase();
    
    if (tags.includes('calm') || tags.includes('peaceful') || tags.includes('relaxing')) return 'calm';
    if (tags.includes('zen') || tags.includes('meditation') || tags.includes('mindful')) return 'zen';
    if (tags.includes('healing') || tags.includes('therapy') || tags.includes('soothing')) return 'healing';
    if (tags.includes('focus') || tags.includes('concentration') || tags.includes('binaural')) return 'focus';
    if (tags.includes('nature') || tags.includes('forest') || tags.includes('organic')) return 'natural';
    if (tags.includes('rain') || tags.includes('storm') || tags.includes('cozy')) return 'cozy';
    if (tags.includes('ocean') || tags.includes('waves') || tags.includes('water')) return 'serene';
    if (tags.includes('ambient') || tags.includes('space') || tags.includes('ethereal')) return 'dreamy';
    if (tags.includes('gentle') || tags.includes('soft') || tags.includes('quiet')) return 'gentle';
    if (tags.includes('spiritual') || tags.includes('sacred') || tags.includes('divine')) return 'spiritual';
    
    return 'peaceful'; // Default mood
  }

  // Format duration from seconds to MM:SS
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get all tracks with Freesound integration
  async getTracks(category = null) {
    try {
      const categories = this.getSearchCategories();
      let allTracks = [];

      if (category && categories[category]) {
        // Fetch tracks for specific category
        for (const searchConfig of categories[category]) {
          const tracks = await this.fetchTracksFromFreesound(category, searchConfig, 5);
          allTracks = allTracks.concat(tracks);
        }
      } else {
        // Fetch tracks for all categories
        for (const [cat, searchConfigs] of Object.entries(categories)) {
          for (const searchConfig of searchConfigs.slice(0, 2)) { // Limit to 2 searches per category
            const tracks = await this.fetchTracksFromFreesound(cat, searchConfig, 3);
            allTracks = allTracks.concat(tracks);
          }
        }
      }

      // Remove duplicates and limit results
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.freesoundId === track.freesoundId)
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

  // Fallback tracks if Freesound fails
  getFallbackTracks(category = null) {
    const fallbackTracks = {
      meditation: [
        {
          id: 'fallback-meditation-1',
          title: 'Meditation Bell',
          description: 'Traditional meditation bell sound',
          duration: '0:05',
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

  // Play a track with streaming support
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
        // Create audio element for streaming
        this.currentAudio = new Audio();
        this.currentTrack = track;
        
        // Configure audio for streaming
        this.currentAudio.volume = this.volume;
        this.currentAudio.loop = this.isLooping;
        this.currentAudio.crossOrigin = 'anonymous';
        this.currentAudio.preload = 'auto';
        
        // Set up event listeners
        this.currentAudio.onloadstart = () => {
          console.log('🎵 Loading Freesound audio:', track.title);
        };

        this.currentAudio.oncanplay = () => {
          console.log('✅ Freesound audio ready:', track.title);
        };

        this.currentAudio.onplay = () => {
          this.isPlaying = true;
          console.log('▶️ Streaming Freesound audio:', track.title);
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
          console.error('❌ Freesound audio error:', error);
          this.isPlaying = false;
          // Fallback to generated audio
          return this.playGeneratedAudio(track);
        };

        // Set source and start streaming
        this.currentAudio.src = track.streamUrl || track.url;
        await this.currentAudio.play();
        
        return {
          success: true,
          track: track,
          message: `Now streaming: ${track.title}`,
          source: 'freesound'
        };

      } catch (audioError) {
        console.log('Freesound audio failed, using generated fallback');
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
        note: 'Using synthesized audio - Freesound tracks loading'
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

export default new FreesoundAudioService();
