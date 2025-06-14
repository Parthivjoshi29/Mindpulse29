import { useTheme } from '../../context/ThemeContext';
import { RARITY_COLORS } from '../../data/achievements';

export default function AchievementCard({ achievement, earned = false, progress = null }) {
  const { isDark } = useTheme();
  const rarity = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        earned 
          ? `${rarity.bg} ${rarity.border} shadow-lg transform hover:scale-105` 
          : `${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/70 border-gray-300'} opacity-75`
      }`}
    >
      {/* Rarity indicator */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
        earned ? rarity.text : isDark ? 'text-gray-500' : 'text-gray-400'
      }`}>
        {achievement.rarity}
      </div>

      {/* Achievement icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-3xl ${earned ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${
            earned 
              ? rarity.text 
              : isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {achievement.title}
          </h3>
          <p className={`text-sm ${
            earned 
              ? isDark ? 'text-gray-300' : 'text-gray-600'
              : isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 text-sm font-medium ${
          earned 
            ? rarity.text 
            : isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <span>⭐</span>
          <span>{achievement.points} points</span>
        </div>

        {/* Progress indicator for partially completed achievements */}
        {progress && !earned && (
          <div className="flex items-center gap-2">
            <div className={`w-16 h-2 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <span className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {Math.round(progress)}%
            </span>
          </div>
        )}

        {/* Earned indicator */}
        {earned && (
          <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
            <span>✅</span>
            <span>Earned</span>
          </div>
        )}
      </div>

      {/* Shine effect for earned achievements */}
      {earned && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse" />
      )}
    </div>
  );
}
