import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  notes: String,
  tags: [String],
  context: {
    weather: String,
    location: String,
    activity: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
moodSchema.index({ userId: 1, date: -1 });
moodSchema.index({ userId: 1, createdAt: -1 });
moodSchema.index({ userId: 1, score: -1 });

export default mongoose.model('Mood', moodSchema);
