import { useTheme } from '../../context/ThemeContext';

export default function DailyChallenges({ challenges, onChallengeClick }) {
  const { isDark } = useTheme();

  if (!challenges || challenges.length === 0) {
    return (
      <div className={`p-6 rounded-2xl backdrop-blur-sm ${
        isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
      } border shadow-lg`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Daily Challenges
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🌱</div>
          <h4 className={`font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            No Challenges Available
          </h4>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Start your mindfulness journey to unlock daily challenges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-sm ${
      isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
    } border shadow-lg`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Daily Challenges
        </h3>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              challenge.completed
                ? `${isDark ? 'bg-green-900/30 border-green-500/30' : 'bg-green-100 border-green-300'}`
                : `${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'} cursor-pointer hover:shadow-md`
            }`}
            onClick={() => !challenge.completed && onChallengeClick?.(challenge)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${challenge.completed ? '' : 'opacity-70'}`}>
                  {challenge.icon}
                </div>
                <div>
                  <h4 className={`font-medium ${
                    challenge.completed
                      ? isDark ? 'text-green-300' : 'text-green-700'
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {challenge.title}
                  </h4>
                  <p className={`text-sm ${
                    challenge.completed
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {challenge.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Progress bar for challenges with progress */}
                {challenge.progress !== undefined && challenge.target && !challenge.completed && (
                  <div className="flex items-center gap-2">
                    <div className={`w-16 h-2 rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                )}

                {/* Points */}
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className={`text-sm font-medium ${
                    challenge.completed
                      ? isDark ? 'text-green-300' : 'text-green-700'
                      : isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {challenge.points}
                  </span>
                </div>

                {/* Completion status */}
                {challenge.completed ? (
                  <div className="text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className={`text-gray-400 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Challenge type indicator */}
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                challenge.type === 'daily' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : challenge.type === 'weekly'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
              }`}>
                {challenge.type}
              </span>
              
              {challenge.type === 'daily' && (
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Resets at midnight
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={`mt-4 pt-4 border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between text-sm">
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Completed: {challenges.filter(c => c.completed).length}/{challenges.length}
          </span>
          <span className={`font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0)} points earned
          </span>
        </div>
      </div>
    </div>
  );
}
