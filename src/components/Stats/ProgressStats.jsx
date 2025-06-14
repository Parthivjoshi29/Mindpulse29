import { TrendingUp, Calendar, Clock, Target } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ProgressStats({ stats = {} }) {
  const { isDark } = useTheme();

  const defaultStats = {
    moodStreak: stats.moodStreak || 0,
    avgMoodScore: stats.avgMoodScore || 0,
    totalSessions: stats.totalSessions || 0,
    weeklyGoal: stats.weeklyGoal || 0,
    weeklyProgress: stats.weeklyProgress || 0,
  };

  const getChangeText = (title, value) => {
    if (value === 0) {
      switch (title) {
        case "Mood Streak":
          return "Start tracking to build streak";
        case "Average Mood":
          return "No mood data yet";
        case "Total Sessions":
          return "Begin your journey";
        default:
          return "No data yet";
      }
    }

    // For non-zero values, show encouraging messages
    switch (title) {
      case "Mood Streak":
        return value === 1 ? "Great start!" : `Keep it going! 🔥`;
      case "Average Mood":
        return value >= 7 ? "Feeling great! 😊" : value >= 5 ? "Steady progress 👍" : "Room to improve 💪";
      case "Total Sessions":
        return value === 1 ? "First session complete! 🎉" : `${defaultStats.weeklyProgress} this week`;
      default:
        return "";
    }
  };

  const cards = [
    {
      title: "Mood Streak",
      value: `${defaultStats.moodStreak} days`,
      icon: (
        <TrendingUp
          className={`w-5 h-5 ${
            isDark ? "text-purple-400" : "text-indigo-600"
          }`}
        />
      ),
      change: getChangeText("Mood Streak", defaultStats.moodStreak),
    },
    {
      title: "Average Mood",
      value: defaultStats.avgMoodScore === 0 ? "—" : defaultStats.avgMoodScore.toFixed(1),
      icon: (
        <Target
          className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-600"}`}
        />
      ),
      change: getChangeText("Average Mood", defaultStats.avgMoodScore),
    },
    {
      title: "Total Sessions",
      value: defaultStats.totalSessions,
      icon: (
        <Calendar
          className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
        />
      ),
      change: getChangeText("Total Sessions", defaultStats.totalSessions),
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-6 rounded-2xl backdrop-blur-sm ${
            isDark ? "bg-slate-800/50" : "bg-white/90"
          } border ${isDark ? "border-white/10" : "border-gray-200"} shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {card.title}
            </div>
            {card.icon}
          </div>
          <div
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {card.value}
          </div>
          <div
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {card.change}
          </div>
        </div>
      ))}
    </>
  );
}
