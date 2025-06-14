import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  stats: {
    moodStreak: {
      type: Number,
      default: 0
    },
    avgMoodScore: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    weeklyGoal: {
      type: Number,
      default: 5
    },
    weeklyProgress: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
