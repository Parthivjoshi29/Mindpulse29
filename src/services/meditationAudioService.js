// Meditation Audio Service for Background Sounds
import FreesoundAudioService from './freesoundAudioService.js';

class MeditationAudioService {
  constructor() {
    this.activeSounds = new Map(); // Track multiple active sounds
    this.isPlaying = false;
    this.masterVolume = 0.5;
    this.audioContext = null;
    this.cachedSounds = new Map();
    this.soundVolumes = new Map(); // Individual volume for each sound
  }

  // Initialize audio context
  async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🎵 Meditation audio context initialized');
    } catch (error) {
      console.error('❌ Error initializing audio context:', error);
    }
  }

  // Get meditation background sounds with Freesound integration
  getMeditationSounds() {
    return [
      {
        id: "rain",
        name: "Rain",
        icon: "🌧️",
        description: "Gentle rainfall",
        frequency: 200,
        freesoundQuery: "rain",
        freesoundTags: ["rain", "storm", "weather"]
      },
      {
        id: "ocean",
        name: "Ocean",
        icon: "🌊",
        description: "Ocean waves",
        frequency: 100,
        freesoundQuery: "ocean waves",
        freesoundTags: ["ocean", "waves", "sea"]
      },
      {
        id: "forest",
        name: "Forest",
        icon: "🌲",
        description: "Forest sounds",
        frequency: 300,
        freesoundQuery: "forest",
        freesoundTags: ["forest", "birds", "nature"]
      },
      {
        id: "wind",
        name: "Wind",
        icon: "💨",
        description: "Gentle breeze",
        frequency: 150,
        freesoundQuery: "wind",
        freesoundTags: ["wind", "breeze", "air"]
      },
      {
        id: "fire",
        name: "Fire",
        icon: "🔥",
        description: "Crackling fire",
        frequency: 80,
        freesoundQuery: "fire crackling",
        freesoundTags: ["fire", "crackling", "fireplace"]
      },
      {
        id: "birds",
        name: "Birds",
        icon: "🐦",
        description: "Bird songs",
        frequency: 400,
        freesoundQuery: "birds singing",
        freesoundTags: ["birds", "singing", "nature"]
      }
    ];
  }

  // Fetch real audio for a specific sound type
  async fetchRealAudio(soundType) {
    try {
      const cacheKey = `meditation-${soundType}`;
      
      // Check cache first
      if (this.cachedSounds.has(cacheKey)) {
        console.log('🎵 Using cached meditation sound:', soundType);
        return this.cachedSounds.get(cacheKey);
      }

      const sounds = this.getMeditationSounds();
      const soundConfig = sounds.find(s => s.id === soundType);
      
      if (!soundConfig) {
        throw new Error(`Sound type ${soundType} not found`);
      }

      console.log('🔍 Fetching real audio for meditation:', soundType);

      // Use Freesound service to fetch audio
      const searchConfig = {
        query: soundConfig.freesoundQuery,
        tags: soundConfig.freesoundTags
      };

      const tracks = await FreesoundAudioService.fetchTracksFromFreesound(
        'meditation-background',
        searchConfig,
        5
      );

      if (tracks && tracks.length > 0) {
        // Get the best track (first one, sorted by downloads)
        const bestTrack = tracks[0];
        
        // Cache the result
        this.cachedSounds.set(cacheKey, bestTrack);
        
        console.log(`✅ Found real audio for ${soundType}:`, bestTrack.title);
        return bestTrack;
      } else {
        console.log(`⚠️ No real audio found for ${soundType}, will use generated`);
        return null;
      }

    } catch (error) {
      console.error(`❌ Error fetching real audio for ${soundType}:`, error);
      return null;
    }
  }

  // Play background sound for meditation (supports multiple sounds)
  async playBackgroundSound(soundType, volume = 0.5) {
    try {
      // Check if this sound is already playing
      if (this.activeSounds.has(soundType)) {
        console.log('🎵 Sound already playing:', soundType);
        return {
          success: true,
          type: 'already_playing',
          message: `${soundType} is already playing`
        };
      }

      this.masterVolume = volume;
      this.soundVolumes.set(soundType, volume);

      console.log('🎵 Starting background sound:', soundType);

      // Try to get real audio first
      const realAudio = await this.fetchRealAudio(soundType);

      if (realAudio && realAudio.url) {
        // Play real audio
        return this.playRealAudio(realAudio, soundType);
      } else {
        // Fallback to generated audio
        return this.playGeneratedAudio(soundType);
      }

    } catch (error) {
      console.error('❌ Error playing background sound:', error);
      // Fallback to generated audio
      return this.playGeneratedAudio(soundType);
    }
  }

  // Play real audio from Freesound (supports multiple sounds)
  async playRealAudio(track, soundType) {
    try {
      const audio = new Audio(track.url);

      // Configure for background looping
      const soundVolume = this.soundVolumes.get(soundType) || this.masterVolume;
      audio.volume = soundVolume;
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      // Set up event listeners
      audio.onplay = () => {
        this.isPlaying = true;
        console.log('▶️ Playing real meditation background:', track.title);
      };

      audio.onpause = () => {
        // Check if any sounds are still playing
        this.updatePlayingStatus();
      };

      audio.onerror = (error) => {
        console.error('❌ Real audio error, falling back to generated:', error);
        this.activeSounds.delete(soundType);
        this.playGeneratedAudio(soundType);
      };

      // Start playing
      await audio.play();

      // Store in active sounds
      this.activeSounds.set(soundType, {
        audio: audio,
        type: 'real',
        track: track,
        soundType: soundType,
        stop: () => {
          audio.pause();
          this.activeSounds.delete(soundType);
          this.updatePlayingStatus();
        },
        setVolume: (vol) => {
          audio.volume = vol;
          this.soundVolumes.set(soundType, vol);
        }
      });

      return {
        success: true,
        type: 'real',
        track: track,
        soundType: soundType,
        message: `Playing real ${soundType} sounds`
      };

    } catch (error) {
      console.error('❌ Real audio playback failed:', error);
      // Fallback to generated
      return this.playGeneratedAudio(soundType);
    }
  }

  // Play generated audio as fallback
  playGeneratedAudio(soundType) {
    try {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      const sounds = this.getMeditationSounds();
      const sound = sounds.find(s => s.id === soundType);
      
      if (!sound) {
        throw new Error(`Sound type ${soundType} not found`);
      }

      // Create enhanced generated audio based on sound type
      const config = this.getGeneratedAudioConfig(soundType);
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Configure oscillator
      oscillator.type = config.waveType;
      oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);

      // Configure filter
      filterNode.type = config.filterType;
      filterNode.frequency.setValueAtTime(config.filterFreq, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(config.filterQ, this.audioContext.currentTime);

      // Configure gain
      const soundVolume = this.soundVolumes.get(soundType) || this.masterVolume;
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(soundVolume * config.volume, this.audioContext.currentTime + 2);

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();

      // Store in active sounds
      this.activeSounds.set(soundType, {
        oscillator: oscillator,
        gainNode: gainNode,
        type: 'generated',
        soundType: soundType,
        stop: () => {
          try {
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
            setTimeout(() => {
              try { oscillator.stop(); } catch (e) {}
            }, 1000);
          } catch (e) {}
          this.activeSounds.delete(soundType);
          this.updatePlayingStatus();
        },
        setVolume: (vol) => {
          try {
            gainNode.gain.setValueAtTime(vol * config.volume, this.audioContext.currentTime);
            this.soundVolumes.set(soundType, vol);
          } catch (e) {}
        }
      });

      this.isPlaying = true;
      
      console.log('🎵 Playing generated meditation background:', soundType);
      
      return {
        success: true,
        type: 'generated',
        soundType: soundType,
        message: `Playing generated ${soundType} sounds`
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
  getGeneratedAudioConfig(soundType) {
    const configs = {
      rain: {
        waveType: 'triangle',
        frequency: 200,
        filterType: 'bandpass',
        filterFreq: 400,
        filterQ: 2,
        volume: 0.3
      },
      ocean: {
        waveType: 'sine',
        frequency: 100,
        filterType: 'lowpass',
        filterFreq: 300,
        filterQ: 1,
        volume: 0.4
      },
      forest: {
        waveType: 'triangle',
        frequency: 300,
        filterType: 'bandpass',
        filterFreq: 800,
        filterQ: 1.5,
        volume: 0.25
      },
      wind: {
        waveType: 'sawtooth',
        frequency: 150,
        filterType: 'lowpass',
        filterFreq: 200,
        filterQ: 0.7,
        volume: 0.3
      },
      fire: {
        waveType: 'triangle',
        frequency: 80,
        filterType: 'highpass',
        filterFreq: 100,
        filterQ: 0.5,
        volume: 0.35
      },
      birds: {
        waveType: 'sine',
        frequency: 400,
        filterType: 'bandpass',
        filterFreq: 1200,
        filterQ: 2,
        volume: 0.2
      }
    };

    return configs[soundType] || configs.rain;
  }

  // Update playing status based on active sounds
  updatePlayingStatus() {
    this.isPlaying = this.activeSounds.size > 0;
  }

  // Stop specific background sound
  stopBackgroundSound(soundType = null) {
    if (soundType) {
      // Stop specific sound
      const sound = this.activeSounds.get(soundType);
      if (sound) {
        sound.stop();
        console.log('🛑 Stopped background sound:', soundType);
      }
    } else {
      // Stop all sounds
      for (const [type, sound] of this.activeSounds) {
        sound.stop();
      }
      this.activeSounds.clear();
      this.isPlaying = false;
      console.log('🛑 Stopped all background sounds');
    }
  }

  // Toggle specific background sound
  async toggleBackgroundSound(soundType, volume = 0.5) {
    if (this.activeSounds.has(soundType)) {
      // Stop if playing
      this.stopBackgroundSound(soundType);
      return {
        success: true,
        action: 'stopped',
        soundType: soundType,
        message: `Stopped ${soundType} sound`
      };
    } else {
      // Start if not playing
      return await this.playBackgroundSound(soundType, volume);
    }
  }

  // Set master volume for all sounds
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    // Update all active sounds
    for (const [soundType, sound] of this.activeSounds) {
      const soundVolume = this.soundVolumes.get(soundType) || this.masterVolume;
      sound.setVolume(soundVolume);
    }

    console.log('🔊 Master volume set to:', Math.round(this.masterVolume * 100) + '%');
  }

  // Set volume for specific sound
  setSoundVolume(soundType, volume) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    this.soundVolumes.set(soundType, normalizedVolume);

    const sound = this.activeSounds.get(soundType);
    if (sound) {
      sound.setVolume(normalizedVolume);
    }

    console.log(`🔊 ${soundType} volume set to:`, Math.round(normalizedVolume * 100) + '%');
  }

  // Get current status with multiple sounds
  getStatus() {
    const activeSoundTypes = Array.from(this.activeSounds.keys());
    const soundVolumes = {};

    for (const soundType of activeSoundTypes) {
      soundVolumes[soundType] = this.soundVolumes.get(soundType) || this.masterVolume;
    }

    return {
      isPlaying: this.isPlaying,
      activeSounds: activeSoundTypes,
      masterVolume: this.masterVolume,
      soundVolumes: soundVolumes,
      totalActiveSounds: this.activeSounds.size
    };
  }

  // Get active sounds info
  getActiveSounds() {
    const sounds = [];
    for (const [soundType, sound] of this.activeSounds) {
      sounds.push({
        soundType: soundType,
        type: sound.type,
        volume: this.soundVolumes.get(soundType) || this.masterVolume,
        track: sound.track || null
      });
    }
    return sounds;
  }

  // Play notification sound
  playNotificationSound() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);

      console.log('🔔 Meditation notification played');
    } catch (error) {
      console.error('❌ Error playing notification:', error);
    }
  }
}

export default new MeditationAudioService();
