import { useTheme } from '../../context/ThemeContext';

export default function LevelProgress({ level, showDetails = true }) {
  const { isDark } = useTheme();

  // Don't render if no level data or no points
  if (!level || level.totalPoints === 0) {
    return null;
  }

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-sm ${
      isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/50 border-gray-200/50'
    } border`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{level.icon}</div>
          <div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Level {level.level}
            </h3>
            <p className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {level.title}
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {level.totalPoints.toLocaleString()}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Total Points
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Progress to Level {level.level + 1}
          </span>
          <span className={`font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {level.progressPercent}%
          </span>
        </div>
        
        <div className={`w-full h-3 rounded-full ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${level.progressPercent}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse" />
          </div>
        </div>
        
        {level.pointsToNext > 0 && (
          <div className={`text-xs text-center ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {level.pointsToNext.toLocaleString()} points to next level
          </div>
        )}
      </div>

      {/* Level Benefits (if at max level) */}
      {level.pointsToNext === 0 && (
        <div className={`mt-4 p-3 rounded-lg ${
          isDark ? 'bg-purple-900/30 border-purple-500/30' : 'bg-purple-100 border-purple-300'
        } border`}>
          <div className="flex items-center gap-2">
            <span className="text-purple-500">👑</span>
            <span className={`text-sm font-medium ${
              isDark ? 'text-purple-300' : 'text-purple-700'
            }`}>
              Maximum Level Reached!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
