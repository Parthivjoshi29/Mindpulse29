import { ACHIEVEMENTS, LEVEL_THRESHOLDS } from '../data/achievements.js';

export class GamificationService {
  // Calculate user level based on total points
  static calculateLevel(totalPoints) {
    let currentLevel = 1;
    let nextLevelPoints = 100;
    
    for (const threshold of LEVEL_THRESHOLDS) {
      if (totalPoints >= threshold.points) {
        currentLevel = threshold.level;
        const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === threshold.level + 1);
        nextLevelPoints = nextThreshold ? nextThreshold.points : threshold.points;
      } else {
        break;
      }
    }
    
    const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === currentLevel);
    const progressToNext = nextLevelPoints - (currentThreshold?.points || 0);
    const currentProgress = totalPoints - (currentThreshold?.points || 0);
    
    return {
      level: currentLevel,
      title: currentThreshold?.title || 'Beginner',
      icon: currentThreshold?.icon || '🌱',
      totalPoints,
      pointsToNext: Math.max(0, nextLevelPoints - totalPoints),
      progressPercent: progressToNext > 0 ? Math.round((currentProgress / progressToNext) * 100) : 100
    };
  }

  // Check which achievements user has earned
  static checkAchievements(userStats, userHistory = {}) {
    const earnedAchievements = [];

    console.log('🏆 Checking achievements for stats:', userStats);

    if (!userStats) {
      console.log('❌ No user stats provided');
      return earnedAchievements;
    }

    const { moodStreak, avgMoodScore, totalSessions, weeklyProgress } = userStats;

    // Check if user has ANY activity
    const hasActivity = totalSessions > 0 || moodStreak > 0 || avgMoodScore > 0;

    if (!hasActivity) {
      console.log('❌ No user activity detected');
      return earnedAchievements;
    }

    console.log('✅ User has activity, checking achievements...');

    for (const achievement of ACHIEVEMENTS) {
      const { requirement } = achievement;
      let earned = false;

      switch (achievement.type) {
        case 'streak':
          earned = moodStreak >= requirement.streak;
          if (earned) console.log(`✅ Streak achievement: ${achievement.title} (${moodStreak} >= ${requirement.streak})`);
          break;

        case 'sessions':
          earned = totalSessions >= requirement.totalSessions;
          if (earned) console.log(`✅ Session achievement: ${achievement.title} (${totalSessions} >= ${requirement.totalSessions})`);
          break;

        case 'mood':
          if (requirement.avgMood) {
            earned = avgMoodScore >= requirement.avgMood && totalSessions > 0;
            if (earned) console.log(`✅ Mood achievement: ${achievement.title} (${avgMoodScore} >= ${requirement.avgMood})`);
          }
          if (requirement.perfectMoodDays) {
            earned = (userHistory.perfectMoodDays || 0) >= requirement.perfectMoodDays;
          }
          if (requirement.moodImprovement) {
            earned = (userHistory.moodImprovement || 0) >= requirement.moodImprovement;
          }
          break;

        case 'consistency':
          if (requirement.earlyMorning) {
            earned = (userHistory.earlyMorningDays || 0) >= requirement.earlyMorning;
          }
          if (requirement.lateEvening) {
            earned = (userHistory.lateEveningDays || 0) >= requirement.lateEvening;
          }
          if (requirement.weekendConsistency) {
            earned = (userHistory.weekendStreak || 0) >= requirement.weekendConsistency;
          }
          break;

        case 'milestone':
          if (requirement.daysActive) {
            earned = (userHistory.totalActiveDays || 0) >= requirement.daysActive;
          }
          break;

        case 'special':
          if (requirement.comeback) {
            earned = userHistory.hasComeback || false;
          }
          if (requirement.uniqueEmotions) {
            earned = (userHistory.uniqueEmotions || 0) >= requirement.uniqueEmotions;
          }
          if (requirement.longEntry) {
            earned = userHistory.hasLongEntry || false;
          }
          break;
      }

      if (earned) {
        earnedAchievements.push(achievement);
      }
    }

    console.log(`🏆 Total achievements earned: ${earnedAchievements.length}`);
    return earnedAchievements;
  }

  // Calculate total points from achievements
  static calculateTotalPoints(achievements) {
    return achievements.reduce((total, achievement) => total + achievement.points, 0);
  }

  // Get daily challenges
  static getDailyChallenges(userStats) {
    const challenges = [];

    console.log('🎯 Generating challenges for stats:', userStats);

    if (!userStats) {
      console.log('❌ No user stats for challenges');
      return challenges;
    }

    const { totalSessions, moodStreak, weeklyProgress, avgMoodScore } = userStats;
    const hasActivity = totalSessions > 0 || moodStreak > 0 || avgMoodScore > 0;

    if (!hasActivity) {
      console.log('❌ No user activity, no challenges');
      return challenges;
    }

    console.log('✅ User has activity, generating challenges...');

    const today = new Date().toISOString().split('T')[0];

    // Basic daily challenge - always show for active users
    challenges.push({
      id: 'daily_mood',
      title: 'Daily Check-in',
      description: 'Log your mood today',
      icon: '📊',
      points: 10,
      completed: false, // We don't track daily completion yet
      type: 'daily'
    });

    // Weekly challenge - if user has sessions and hasn't completed weekly goal
    if (totalSessions > 0 && weeklyProgress < 5) {
      challenges.push({
        id: 'weekly_goal',
        title: 'Weekly Goal',
        description: `Complete ${5 - weeklyProgress} more sessions this week`,
        icon: '🎯',
        points: 50,
        completed: weeklyProgress >= 5,
        progress: weeklyProgress,
        target: 5,
        type: 'weekly'
      });
    }

    // Streak challenges
    if (moodStreak === 0 && totalSessions > 0) {
      challenges.push({
        id: 'start_streak',
        title: 'Start Your Streak',
        description: 'Begin a new mood tracking streak',
        icon: '🔥',
        points: 25,
        completed: false,
        type: 'streak'
      });
    } else if (moodStreak > 0 && moodStreak < 7) {
      challenges.push({
        id: 'build_streak',
        title: 'Build Your Streak',
        description: `Reach a ${moodStreak + 1}-day streak`,
        icon: '🔥',
        points: 15,
        completed: false,
        type: 'streak'
      });
    }

    // Mood improvement challenge
    if (avgMoodScore > 0 && avgMoodScore < 8 && totalSessions > 0) {
      challenges.push({
        id: 'mood_boost',
        title: 'Mood Boost',
        description: 'Log a mood of 8 or higher today',
        icon: '😊',
        points: 20,
        completed: false,
        type: 'mood'
      });
    }

    // First session challenge for new users
    if (totalSessions === 0) {
      challenges.push({
        id: 'first_session',
        title: 'First Session',
        description: 'Complete your first journal session',
        icon: '📝',
        points: 25,
        completed: false,
        type: 'milestone'
      });
    }

    console.log(`🎯 Generated ${challenges.length} challenges`);
    return challenges;
  }

  // Get motivational messages based on progress
  static getMotivationalMessage(userStats, level) {
    if (!userStats) {
      return {
        title: "Welcome to your mindfulness journey! 🌟",
        message: "Start by logging your first mood to begin earning points and unlocking achievements.",
        type: "welcome"
      };
    }

    const { moodStreak, totalSessions, avgMoodScore } = userStats;

    if (totalSessions === 0 && moodStreak === 0) {
      return {
        title: "Welcome to your mindfulness journey! 🌟",
        message: "Start by logging your first mood to begin earning points and unlocking achievements.",
        type: "welcome"
      };
    }

    if (totalSessions > 0 && moodStreak === 0) {
      return {
        title: "Ready for a fresh start? 💪",
        message: "Every expert was once a beginner. Start a new streak today!",
        type: "encouragement"
      };
    }

    if (moodStreak >= 7) {
      return {
        title: "You're on fire! 🔥",
        message: `${moodStreak} days strong! Your consistency is paying off.`,
        type: "celebration"
      };
    }

    if (avgMoodScore >= 8 && totalSessions > 0) {
      return {
        title: "Happiness radiates from you! ✨",
        message: "Your positive energy is inspiring. Keep spreading those good vibes!",
        type: "positive"
      };
    }

    if (level && level.level >= 5) {
      return {
        title: `${level.title} level achieved! 🏆`,
        message: "You've shown incredible dedication to your mental wellness journey.",
        type: "achievement"
      };
    }

    if (totalSessions > 0) {
      return {
        title: "Keep going! 🌱",
        message: "Every small step counts towards your bigger wellness goals.",
        type: "motivation"
      };
    }

    return {
      title: "Welcome to your mindfulness journey! 🌟",
      message: "Start by logging your first mood to begin earning points and unlocking achievements.",
      type: "welcome"
    };
  }

  // Generate weekly report
  static generateWeeklyReport(userStats, achievements) {
    const level = this.calculateLevel(this.calculateTotalPoints(achievements));
    
    return {
      weeklyProgress: userStats.weeklyProgress,
      weeklyGoal: userStats.weeklyGoal,
      streakGrowth: Math.max(0, userStats.moodStreak - 7), // Growth in last week
      pointsEarned: achievements
        .filter(a => {
          // Rough estimate - in real app, track when achievements were earned
          return true;
        })
        .reduce((sum, a) => sum + a.points, 0),
      level: level,
      newAchievements: achievements.slice(-3), // Last 3 achievements
      motivationalMessage: this.getMotivationalMessage(userStats, level)
    };
  }
}
