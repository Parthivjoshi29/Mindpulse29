import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['journal', 'meditation', 'breathing', 'mood_check'],
    required: true
  },
  title: String,
  content: String,
  journal: String, // For backward compatibility
  mood: {
    type: Number,
    min: 1,
    max: 10
  },
  emotions: [{
    label: String,
    value: Number
  }],
  tags: [String],
  insights: [String], // AI-generated insights
  duration: Number, // in minutes
  completed: {
    type: Boolean,
    default: true
  },
  metadata: {
    aiAnalyzed: {
      type: Boolean,
      default: false
    },
    wordCount: Number,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, type: 1 });
sessionSchema.index({ userId: 1, mood: -1 });
sessionSchema.index({ tags: 1 });

export default mongoose.model('Session', sessionSchema);
