import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import { UserDataService } from '../services/userDataService';
import { GamificationService } from '../services/gamificationService';
import { ACHIEVEMENTS } from '../data/achievements';
import LevelProgress from '../components/Gamification/LevelProgress';
import AchievementCard from '../components/Gamification/AchievementCard';
import DailyChallenges from '../components/Gamification/DailyChallenges';

export default function Gamification() {
  const { user } = useUser();
  const { isDark } = useTheme();
  const [userStats, setUserStats] = useState(null);
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [level, setLevel] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchGamificationData = async () => {
    try {
      setIsLoading(true);
      console.log('🎮 Fetching gamification data for user:', user.id);

      // Fetch all user data to calculate real stats
      const [moodData, emotionsData, sessionsData, storedStats] = await Promise.all([
        UserDataService.getUserMoods(user.id, 30), // Get more mood data for better calculation
        UserDataService.getUserEmotions(user.id),
        UserDataService.getUserSessions(user.id, 100), // Get more sessions
        UserDataService.getUserStats(user.id),
      ]);

      console.log('📊 Raw data received:', {
        moods: moodData?.length || 0,
        emotions: emotionsData?.length || 0,
        sessions: sessionsData?.length || 0,
        storedStats
      });

      // Calculate dynamic stats from real data (same logic as Dashboard)
      const calculateRealStats = () => {
        // Calculate average mood from actual mood data
        const avgMoodScore = moodData.length > 0
          ? moodData.reduce((sum, mood) => sum + mood.score, 0) / moodData.length
          : 0;

        // Calculate mood streak
        const calculateMoodStreak = () => {
          if (!moodData || moodData.length === 0) return 0;

          const sortedMoods = [...moodData].sort((a, b) => new Date(b.date) - new Date(a.date));
          const uniqueDates = [...new Set(sortedMoods.map(mood => mood.date))];

          if (uniqueDates.length === 0) return 0;

          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const hasRecentEntry = uniqueDates.includes(today) || uniqueDates.includes(yesterdayStr);
          if (!hasRecentEntry) return 0;

          let streak = 0;
          let currentDate = new Date(uniqueDates[0]);

          for (let i = 0; i < 365; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];

            if (uniqueDates.includes(dateStr)) {
              streak++;
            } else {
              const nextDay = new Date(currentDate);
              nextDay.setDate(nextDay.getDate() - 1);
              const nextDayStr = nextDay.toISOString().split('T')[0];

              if (uniqueDates.includes(nextDayStr)) {
                currentDate.setDate(currentDate.getDate() - 1);
                continue;
              } else {
                break;
              }
            }

            currentDate.setDate(currentDate.getDate() - 1);
          }

          return streak;
        };

        // Calculate weekly progress
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weeklyProgress = sessionsData.filter(session => {
          const sessionDate = new Date(session.createdAt);
          return sessionDate >= weekStart;
        }).length;

        return {
          moodStreak: calculateMoodStreak(),
          avgMoodScore: Math.round(avgMoodScore * 10) / 10,
          totalSessions: sessionsData.length,
          weeklyGoal: 5,
          weeklyProgress: weeklyProgress,
        };
      };

      const realStats = calculateRealStats();
      console.log('📊 Calculated real stats:', realStats);
      setUserStats(realStats);

      // Check achievements based on real stats
      const achievements = GamificationService.checkAchievements(realStats);
      console.log('🏆 Earned achievements:', achievements.length);
      setEarnedAchievements(achievements);

      // Calculate level based on achievements
      const totalPoints = GamificationService.calculateTotalPoints(achievements);
      const userLevel = GamificationService.calculateLevel(totalPoints);
      console.log('⬆️ User level:', userLevel);
      setLevel(userLevel);

      // Get daily challenges based on real stats
      const dailyChallenges = GamificationService.getDailyChallenges(realStats);
      console.log('🎯 Daily challenges:', dailyChallenges.length);
      setChallenges(dailyChallenges);

    } catch (error) {
      console.error('❌ Error fetching gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function that can be called manually
  const refreshGamificationData = () => {
    console.log('🔄 Manually refreshing gamification data...');
    fetchGamificationData();
  };

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for session saves to auto-refresh
  useEffect(() => {
    const handleSessionSaved = () => {
      console.log('🔄 Session saved event received, refreshing gamification data...');
      fetchGamificationData();
    };

    window.addEventListener('sessionSaved', handleSessionSaved);

    return () => {
      window.removeEventListener('sessionSaved', handleSessionSaved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChallengeClick = (challenge) => {
    // Navigate to appropriate section based on challenge type
    if (challenge.type === 'daily' || challenge.type === 'mood') {
      // Could navigate to mood tracking or open session modal
      console.log('Navigate to mood tracking for challenge:', challenge.id);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen pt-4 pb-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const motivationalMessage = GamificationService.getMotivationalMessage(userStats, level);
  const hasAnyActivity = userStats && (userStats.totalSessions > 0 || userStats.moodStreak > 0 || userStats.avgMoodScore > 0);

  return (
    <div className={`min-h-screen pt-4 pb-10 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Progress 🎮
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Track your achievements and level up your mindfulness journey
          </p>

          {/* Debug refresh button - remove in production */}
          <button
            onClick={refreshGamificationData}
            className={`mt-4 px-4 py-2 rounded-lg text-sm ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Motivational Message */}
        <div className={`p-6 rounded-2xl backdrop-blur-sm ${
          isDark ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30'
                 : 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300'
        } border`}>
          <div className="text-center">
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {motivationalMessage.title}
            </h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {motivationalMessage.message}
            </p>
          </div>
        </div>

        {/* Empty State for New Users */}
        {!hasAnyActivity ? (
          <div className={`text-center py-16 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="mb-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                isDark ? 'bg-slate-800' : 'bg-gray-100'
              }`}>
                <span className="text-4xl">🎮</span>
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Journey Awaits
            </h3>
            <p className="text-lg mb-8 max-w-md mx-auto">
              Start tracking your mood and completing sessions to unlock achievements, earn points, and level up!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <div className="text-2xl mb-2">📊</div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Track Mood
                </h4>
                <p className="text-sm">Log your daily mood to start earning points</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <div className="text-2xl mb-2">🏆</div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Earn Achievements
                </h4>
                <p className="text-sm">Unlock badges for consistency and milestones</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <div className="text-2xl mb-2">⬆️</div>
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Level Up
                </h4>
                <p className="text-sm">Progress through 10 levels of mindfulness mastery</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Level Progress - Only show if user has activity */}
            {level && <LevelProgress level={level} />}

            {/* Navigation Tabs - Only show if user has activity */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'achievements', label: 'Achievements', icon: '🏆' },
                { id: 'challenges', label: 'Challenges', icon: '🎯' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Challenges */}
                {challenges.length > 0 ? (
                  <DailyChallenges challenges={challenges} onChallengeClick={handleChallengeClick} />
                ) : (
                  <div className={`p-6 rounded-2xl backdrop-blur-sm ${
                    isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/50 border-gray-200/50'
                  } border`}>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎯</div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        No Challenges Yet
                      </h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Complete your first session to unlock daily challenges
                      </p>
                    </div>
                  </div>
                )}

                {/* Recent Achievements */}
                <div className={`p-6 rounded-2xl backdrop-blur-sm ${
                  isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
                } border shadow-lg`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recent Achievements
                  </h3>
                  <div className="space-y-3">
                    {earnedAchievements.slice(-3).map((achievement) => (
                      <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                        isDark
                          ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20'
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                      }`}>
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className={`font-medium ${
                            isDark ? 'text-green-300' : 'text-green-700'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${
                            isDark ? 'text-green-400' : 'text-green-600'
                          }`}>
                            +{achievement.points} points
                          </p>
                        </div>
                      </div>
                    ))}
                    {earnedAchievements.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🏆</div>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No achievements yet. Start your journey to unlock them!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                {earnedAchievements.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Earned Achievements ({earnedAchievements.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {earnedAchievements.map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          earned={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {earnedAchievements.length > 0 ? 'Available Achievements' : 'All Achievements'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ACHIEVEMENTS.filter(achievement =>
                      !earnedAchievements.some(a => a.id === achievement.id)
                    ).map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        earned={false}
                      />
                    ))}
                  </div>

                  {earnedAchievements.length === 0 && (
                    <div className={`text-center py-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <div className="text-4xl mb-4">🏆</div>
                      <p>Start your mindfulness journey to unlock these achievements!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="space-y-6">
                {challenges.length > 0 ? (
                  <>
                    <DailyChallenges challenges={challenges} onChallengeClick={handleChallengeClick} />

                    {/* Challenge Stats */}
                    <div className={`p-6 rounded-2xl backdrop-blur-sm ${
                      isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
                    } border shadow-lg`}>
                      <h3 className={`text-lg font-semibold mb-4 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Challenge Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {challenges.filter(c => c.completed).length}
                          </div>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Completed Today
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {userStats?.weeklyProgress || 0}
                          </div>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            This Week
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {userStats?.moodStreak || 0}
                          </div>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Current Streak
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {level?.totalPoints || 0}
                          </div>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Total Points
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={`p-6 rounded-2xl backdrop-blur-sm ${
                    isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
                  } border shadow-lg`}>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-6">🎯</div>
                      <h3 className={`text-xl font-semibold mb-4 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        No Challenges Available
                      </h3>
                      <p className={`text-lg mb-6 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Start your mindfulness journey to unlock daily challenges and earn points!
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                          <div className="text-xl mb-1">📊</div>
                          <p className="text-sm">Track your mood daily</p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                          <div className="text-xl mb-1">📝</div>
                          <p className="text-sm">Complete journal sessions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
