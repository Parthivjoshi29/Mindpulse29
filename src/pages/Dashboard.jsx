import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Play, Settings, Sun, Moon, Brain } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import MoodChart from "../components/Charts/MoodChart";
import EmotionCloud from "../components/Charts/EmotionCloud";
import ProgressStats from "../components/Stats/ProgressStats";
import SessionModal from "../components/Session/SessionModal";
import { UserDataService } from "../services/userDataService";

export default function Dashboard() {
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [moodData, setMoodData] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const calculateDynamicStats = (moodData, sessionsData) => {
    // Calculate average mood from actual mood data
    const avgMoodScore =
      moodData.length > 0
        ? moodData.reduce((sum, mood) => sum + mood.score, 0) / moodData.length
        : 0;

    // Calculate mood streak with improved logic
    const calculateMoodStreak = () => {
      if (!moodData || moodData.length === 0) return 0;

      // Sort mood data by date (newest first)
      const sortedMoods = [...moodData].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Get unique dates (in case multiple moods per day)
      const uniqueDates = [...new Set(sortedMoods.map((mood) => mood.date))];

      if (uniqueDates.length === 0) return 0;

      // Get today's date in YYYY-MM-DD format (UTC to avoid timezone issues)
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Get yesterday's date
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let streak = 0;
      let currentDate = new Date();

      // Check if user logged today or yesterday (grace period)
      const hasRecentEntry =
        uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr);

      if (!hasRecentEntry) {
        // No recent entries, streak is 0
        return 0;
      }

      // Start from the most recent entry date
      const startDate = new Date(uniqueDates[0]);
      currentDate = new Date(startDate);

      // Count consecutive days backwards
      for (let i = 0; i < 365; i++) {
        // Check up to 1 year
        const dateStr = currentDate.toISOString().split("T")[0];

        if (uniqueDates.includes(dateStr)) {
          streak++;
        } else {
          // Allow 1 day gap (weekend grace period)
          const nextDay = new Date(currentDate);
          nextDay.setDate(nextDay.getDate() - 1);
          const nextDayStr = nextDay.toISOString().split("T")[0];

          if (uniqueDates.includes(nextDayStr)) {
            // Skip this day but continue streak
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
          } else {
            // More than 1 day gap, break streak
            break;
          }
        }

        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    };

    // Calculate weekly progress (sessions this week)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weeklyProgress = sessionsData.filter((session) => {
      const sessionDate = new Date(session.createdAt);
      return sessionDate >= weekStart;
    }).length;

    const moodStreak = calculateMoodStreak();

    console.log("🔥 Streak calculation:", {
      totalMoodEntries: moodData.length,
      uniqueDates: [...new Set(moodData.map((mood) => mood.date))].length,
      calculatedStreak: moodStreak,
    });

    return {
      moodStreak: moodStreak,
      avgMoodScore: Math.round(avgMoodScore * 10) / 10, // Round to 1 decimal
      totalSessions: sessionsData.length,
      weeklyGoal: 5, // User can set this later
      weeklyProgress: weeklyProgress,
    };
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log("📊 Fetching dashboard data for user:", user.id);

      const [moodData, emotionsData, sessionsData] = await Promise.all([
        UserDataService.getUserMoods(user.id),
        UserDataService.getUserEmotions(user.id),
        UserDataService.getUserSessions(user.id, 50), // Get more sessions for calculation
      ]);

      console.log("📊 Dashboard data received:", {
        moods: moodData?.length || 0,
        emotions: emotionsData?.length || 0,
        sessions: sessionsData?.length || 0,
      });

      setMoodData(moodData || []);
      setEmotions(emotionsData || []);

      // Calculate dynamic stats from real data
      const dynamicStats = calculateDynamicStats(
        moodData || [],
        sessionsData || []
      );
      setStats(dynamicStats);

      console.log("📊 Calculated stats:", dynamicStats);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      // Set empty data on error - no dummy data
      setMoodData([]);
      setEmotions([]);
      setStats({
        moodStreak: 0,
        avgMoodScore: 0,
        totalSessions: 0,
        weeklyGoal: 5,
        weeklyProgress: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSessionSave = async (sessionData) => {
    try {
      console.log("💾 Saving session data:", sessionData);

      // Save the complete session to MongoDB
      const sessionToSave = {
        type: sessionData.type || "journal",
        title: sessionData.title || "Daily Check-in",
        content: sessionData.content || sessionData.journal || "",
        mood: sessionData.mood,
        emotions: sessionData.emotions || [],
        tags: sessionData.tags || [],
        insights: sessionData.insights || [],
        duration: sessionData.duration || 0,
      };

      await Promise.all([
        // Save the session
        UserDataService.saveSession(user.id, sessionToSave),
        // Save mood entry
        UserDataService.addMoodEntry(
          user.id,
          sessionData.mood,
          sessionData.notes || "",
          sessionData.tags || []
        ),
        // Save emotion entry if provided
        sessionData.emotion &&
          UserDataService.addEmotionEntry(user.id, sessionData.emotion, 0.8),
      ]);

      console.log("✅ Session saved successfully");

      // Refresh dashboard data to recalculate stats
      fetchUserData();

      // Trigger a custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("sessionSaved", {
          detail: { userId: user.id, sessionData },
        })
      );
    } catch (error) {
      console.error("❌ Error saving session:", error);
    }
  };

  if (!user) return null;

  return (
    <div
      className={`min-h-screen pt-4 pb-10 px-4 sm:px-6 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome back, {user.firstName || "User"}
            </h1>
            <p className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Track your emotional journey and well-being
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSessionModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" />
              <span>Start Session</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => {
                  /* Implement settings */
                }}
                className={`p-2 rounded-lg transition-all ${
                  isDark
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                aria-label="Settings"
              >
                <Settings
                  className={`w-5 h-5 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className={`text-center py-12 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            Loading your dashboard...
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgressStats stats={stats} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoodChart data={moodData} />
              <EmotionCloud emotions={emotions} />
            </div>

            {/* Empty State */}
            {(!moodData || moodData.length === 0) &&
              (!emotions || emotions.length === 0) && (
                <div
                  className={`text-center py-12 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <div className="mb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                        isDark ? "bg-slate-800" : "bg-gray-100"
                      }`}
                    >
                      <Play className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Start Your Journey
                  </h3>
                  <p className="mb-4">
                    Begin tracking your mood and emotions by starting your first
                    session.
                  </p>
                  <button
                    onClick={() => setIsSessionModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Start Your First Session
                  </button>
                </div>
              )}
          </>
        )}

        {/* Session Modal */}
        <SessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          onSave={handleSessionSave}
        />
      </div>
    </div>
  );
}
