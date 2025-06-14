import mongoose from 'mongoose';

const emotionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  intensity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  context: {
    trigger: String,
    situation: String,
    thoughts: String
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
emotionSchema.index({ userId: 1, createdAt: -1 });
emotionSchema.index({ userId: 1, label: 1 });
emotionSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Emotion', emotionSchema);
