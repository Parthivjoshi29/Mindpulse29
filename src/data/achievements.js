// Achievement and Badge System
export const ACHIEVEMENT_TYPES = {
  STREAK: 'streak',
  SESSIONS: 'sessions',
  MOOD: 'mood',
  CONSISTENCY: 'consistency',
  MILESTONE: 'milestone',
  SPECIAL: 'special'
};

export const ACHIEVEMENTS = [
  // Streak Achievements
  {
    id: 'first_streak',
    type: ACHIEVEMENT_TYPES.STREAK,
    title: 'Getting Started',
    description: 'Log your mood for 3 days in a row',
    icon: '🌱',
    requirement: { streak: 3 },
    points: 50,
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    type: ACHIEVEMENT_TYPES.STREAK,
    title: 'Week Warrior',
    description: 'Maintain a 7-day mood tracking streak',
    icon: '🔥',
    requirement: { streak: 7 },
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'month_master',
    type: ACHIEVEMENT_TYPES.STREAK,
    title: 'Month Master',
    description: 'Keep a 30-day streak alive',
    icon: '💎',
    requirement: { streak: 30 },
    points: 500,
    rarity: 'rare'
  },
  {
    id: 'streak_legend',
    type: ACHIEVEMENT_TYPES.STREAK,
    title: 'Streak Legend',
    description: 'Achieve a 100-day streak',
    icon: '👑',
    requirement: { streak: 100 },
    points: 1000,
    rarity: 'legendary'
  },

  // Session Achievements
  {
    id: 'first_session',
    type: ACHIEVEMENT_TYPES.SESSIONS,
    title: 'First Steps',
    description: 'Complete your first journal session',
    icon: '📝',
    requirement: { totalSessions: 1 },
    points: 25,
    rarity: 'common'
  },
  {
    id: 'session_explorer',
    type: ACHIEVEMENT_TYPES.SESSIONS,
    title: 'Session Explorer',
    description: 'Complete 10 journal sessions',
    icon: '🗺️',
    requirement: { totalSessions: 10 },
    points: 100,
    rarity: 'common'
  },
  {
    id: 'journal_master',
    type: ACHIEVEMENT_TYPES.SESSIONS,
    title: 'Journal Master',
    description: 'Complete 50 journal sessions',
    icon: '📚',
    requirement: { totalSessions: 50 },
    points: 300,
    rarity: 'uncommon'
  },
  {
    id: 'writing_guru',
    type: ACHIEVEMENT_TYPES.SESSIONS,
    title: 'Writing Guru',
    description: 'Complete 100 journal sessions',
    icon: '✍️',
    requirement: { totalSessions: 100 },
    points: 750,
    rarity: 'rare'
  },

  // Mood Achievements
  {
    id: 'mood_optimist',
    type: ACHIEVEMENT_TYPES.MOOD,
    title: 'Optimist',
    description: 'Maintain an average mood of 8+ for a week',
    icon: '😊',
    requirement: { avgMood: 8, duration: 7 },
    points: 200,
    rarity: 'uncommon'
  },
  {
    id: 'happiness_master',
    type: ACHIEVEMENT_TYPES.MOOD,
    title: 'Happiness Master',
    description: 'Log mood 10 for 5 days',
    icon: '🌟',
    requirement: { perfectMoodDays: 5 },
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'mood_improver',
    type: ACHIEVEMENT_TYPES.MOOD,
    title: 'Mood Improver',
    description: 'Improve your average mood by 2 points in a month',
    icon: '📈',
    requirement: { moodImprovement: 2 },
    points: 250,
    rarity: 'uncommon'
  },

  // Consistency Achievements
  {
    id: 'early_bird',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    title: 'Early Bird',
    description: 'Log mood before 9 AM for 7 days',
    icon: '🌅',
    requirement: { earlyMorning: 7 },
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'night_owl',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    title: 'Night Owl',
    description: 'Log mood after 9 PM for 7 days',
    icon: '🦉',
    requirement: { lateEvening: 7 },
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'weekend_warrior',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    title: 'Weekend Warrior',
    description: 'Never miss a weekend for a month',
    icon: '🎯',
    requirement: { weekendConsistency: 4 },
    points: 200,
    rarity: 'uncommon'
  },

  // Milestone Achievements
  {
    id: 'first_week',
    type: ACHIEVEMENT_TYPES.MILESTONE,
    title: 'First Week',
    description: 'Complete your first week of tracking',
    icon: '🎉',
    requirement: { daysActive: 7 },
    points: 75,
    rarity: 'common'
  },
  {
    id: 'first_month',
    type: ACHIEVEMENT_TYPES.MILESTONE,
    title: 'First Month',
    description: 'Track for 30 days (not necessarily consecutive)',
    icon: '🏆',
    requirement: { daysActive: 30 },
    points: 200,
    rarity: 'uncommon'
  },

  // Special Achievements
  {
    id: 'comeback_kid',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    title: 'Comeback Kid',
    description: 'Return after a 7+ day break and start a new streak',
    icon: '💪',
    requirement: { comeback: true },
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'emotion_explorer',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    title: 'Emotion Explorer',
    description: 'Log 10 different emotions',
    icon: '🎭',
    requirement: { uniqueEmotions: 10 },
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'wordsmith',
    type: ACHIEVEMENT_TYPES.SPECIAL,
    title: 'Wordsmith',
    description: 'Write a journal entry with 500+ words',
    icon: '📖',
    requirement: { longEntry: 500 },
    points: 100,
    rarity: 'uncommon'
  }
];

export const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300'
  },
  uncommon: {
    bg: 'bg-green-100 dark:bg-green-900',
    border: 'border-green-300 dark:border-green-600',
    text: 'text-green-700 dark:text-green-300'
  },
  rare: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-700 dark:text-blue-300'
  },
  legendary: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-700 dark:text-purple-300'
  }
};

export const LEVEL_THRESHOLDS = [
  { level: 1, points: 0, title: 'Beginner', icon: '🌱' },
  { level: 2, points: 100, title: 'Explorer', icon: '🗺️' },
  { level: 3, points: 300, title: 'Tracker', icon: '📊' },
  { level: 4, points: 600, title: 'Mindful', icon: '🧘' },
  { level: 5, points: 1000, title: 'Focused', icon: '🎯' },
  { level: 6, points: 1500, title: 'Balanced', icon: '⚖️' },
  { level: 7, points: 2200, title: 'Wise', icon: '🦉' },
  { level: 8, points: 3000, title: 'Master', icon: '🏆' },
  { level: 9, points: 4000, title: 'Guru', icon: '✨' },
  { level: 10, points: 5500, title: 'Enlightened', icon: '👑' }
];
