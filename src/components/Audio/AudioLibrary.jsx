import { useState, useEffect } from 'react';
import { Music, Play, Pause, Clock, Tag, Heart, Waves, TreePine, Piano } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import AudioService from '../../services/freesoundAudioService';
import AudioPlayer from './AudioPlayer';

export default function AudioLibrary({ category = null, mood = null, showPlayer = true }) {
  const { isDark } = useTheme();
  const [tracks, setTracks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All Tracks', icon: Music, color: 'indigo' },
    { id: 'meditation', name: 'Meditation', icon: Heart, color: 'purple' },
    { id: 'nature', name: 'Nature Sounds', icon: TreePine, color: 'green' },
    { id: 'ambient', name: 'Ambient', icon: Waves, color: 'blue' },
    { id: 'instrumental', name: 'Instrumental', icon: Piano, color: 'pink' }
  ];

  useEffect(() => {
    loadTracks();
  }, [selectedCategory, mood]);

  useEffect(() => {
    // Monitor audio service status
    const interval = setInterval(() => {
      const status = AudioService.getStatus();
      setCurrentlyPlaying(status.currentTrack?.id || null);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let allTracks;

      if (selectedCategory === 'all') {
        allTracks = await AudioService.getTracks();
      } else {
        allTracks = await AudioService.getTracks(selectedCategory);
      }

      if (mood) {
        allTracks = await AudioService.getTracksByMood(mood);
      }

      setTracks(allTracks);
      console.log(`✅ Loaded ${allTracks.length} tracks for category: ${selectedCategory}`);

    } catch (error) {
      console.error('❌ Error loading tracks:', error);
      setError('Failed to load tracks from Freesound. Please try again.');
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.mood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayTrack = async (trackId) => {
    try {
      const result = await AudioService.play(trackId);
      if (result.success) {
        setSelectedTrack(trackId);
        setCurrentlyPlaying(trackId);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const handlePauseTrack = () => {
    AudioService.pause();
    setCurrentlyPlaying(null);
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Music;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'indigo';
  };

  const getMoodColor = (moodType) => {
    const moodColors = {
      calm: 'blue',
      peaceful: 'green',
      zen: 'purple',
      cozy: 'orange',
      focus: 'indigo',
      serene: 'teal',
      natural: 'emerald',
      airy: 'sky',
      dreamy: 'violet',
      healing: 'rose',
      gentle: 'pink',
      spiritual: 'amber',
      warm: 'yellow'
    };
    return moodColors[moodType] || 'gray';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Audio Library
        </h2>
        <div className="flex items-center gap-2">
          <Music className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredTracks.length} tracks
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tracks, moods, or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full p-3 rounded-lg border ${
            isDark 
              ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isSelected
                  ? 'bg-indigo-500 text-white'
                  : isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading tracks from Freesound...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={loadTracks}
              className={`ml-auto px-3 py-1 rounded text-sm ${
                isDark ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'
              } text-white transition-colors`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {showPlayer && selectedTrack && (
        <AudioPlayer trackId={selectedTrack} showControls={true} />
      )}

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTracks.map((track) => {
          const CategoryIcon = getCategoryIcon(track.category);
          const isPlaying = currentlyPlaying === track.id;
          const categoryColor = getCategoryColor(track.category);
          const moodColor = getMoodColor(track.mood);

          return (
            <div
              key={track.id}
              className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                isDark 
                  ? 'bg-slate-800/50 border-white/10 hover:border-white/20' 
                  : 'bg-white/90 border-gray-200 hover:border-gray-300'
              } ${isPlaying ? 'ring-2 ring-indigo-500' : ''}`}
            >
              
              {/* Track Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`w-5 h-5 text-indigo-500`} />
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {track.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {track.description}
                    </p>
                  </div>
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={() => isPlaying ? handlePauseTrack() : handlePlayTrack(track.id)}
                  className={`p-2 rounded-full transition-all ${
                    isPlaying
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : isDark
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Track Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full ${
                      isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {track.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${
                      isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {track.mood}
                    </span>
                    {track.type === 'freesound' && (
                      <span className={`px-2 py-1 rounded-full ${
                        isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>
                        Freesound
                      </span>
                    )}
                    {track.type === 'pixabay' && (
                      <span className={`px-2 py-1 rounded-full ${
                        isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        Pixabay
                      </span>
                    )}
                    {track.type === 'generated' && (
                      <span className={`px-2 py-1 rounded-full ${
                        isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        Enhanced
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {track.duration}
                    </span>
                  </div>
                </div>

                {/* Audio Source Attribution */}
                {track.type === 'freesound' && track.user && (
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    By {track.user} • {track.downloads || 0} downloads • Freesound.org
                  </div>
                )}
                {track.type === 'pixabay' && track.user && (
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    By {track.user} • {track.downloads || 0} downloads • Pixabay
                  </div>
                )}
                {track.type === 'generated' && (
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Enhanced synthesized audio
                  </div>
                )}
              </div>

              {/* Playing Indicator */}
              {isPlaying && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    Now Playing
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <Music className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            No tracks found
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  );
}
