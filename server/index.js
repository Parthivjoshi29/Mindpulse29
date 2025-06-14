import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/mindful-ai';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Import models
import User from '../src/models/User.js';
import Mood from '../src/models/Mood.js';
import Emotion from '../src/models/Emotion.js';
import Session from '../src/models/Session.js';

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, profileImageUrl } = req.body;

    // Check if user exists
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.profileImageUrl = profileImageUrl;
      await user.save();
    } else {
      // Create new user with explicit stats
      user = new User({
        clerkId,
        email,
        firstName,
        lastName,
        profileImageUrl,
        stats: {
          moodStreak: 0,
          avgMoodScore: 0,
          totalSessions: 0,
          weeklyGoal: 5,
          weeklyProgress: 0,
        },
        preferences: {
          theme: 'auto',
          notifications: true
        }
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:clerkId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mood routes
app.get('/api/users/:clerkId/moods', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const moods = await Mood.find({
      userId: req.params.clerkId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 }).limit(parseInt(days));
    
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:clerkId/moods', async (req, res) => {
  try {
    const { score, notes, tags } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const mood = new Mood({
      userId: req.params.clerkId,
      score,
      date: today,
      notes,
      tags
    });
    
    await mood.save();
    res.status(201).json(mood);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Emotion routes
app.get('/api/users/:clerkId/emotions', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const emotions = await Emotion.find({
      userId: req.params.clerkId,
      createdAt: { $gte: startDate }
    });
    
    res.json(emotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:clerkId/emotions', async (req, res) => {
  try {
    const { label, value, intensity } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const emotion = new Emotion({
      userId: req.params.clerkId,
      label,
      value,
      intensity,
      date: today
    });
    
    await emotion.save();
    res.status(201).json(emotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Session routes
app.get('/api/users/:clerkId/sessions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const sessions = await Session.find({
      userId: req.params.clerkId
    }).sort({ createdAt: -1 }).limit(parseInt(limit));
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:clerkId/sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    
    const session = new Session({
      userId: req.params.clerkId,
      ...sessionData,
      metadata: {
        aiAnalyzed: sessionData.insights && sessionData.insights.length > 0,
        wordCount: sessionData.content ? sessionData.content.split(' ').length : 0,
        sentiment: sessionData.mood >= 7 ? 'positive' : sessionData.mood >= 4 ? 'neutral' : 'negative'
      }
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats routes
app.get('/api/users/:clerkId/stats', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });

    if (!user) {
      // Return empty stats for new users - no fake data
      return res.json({
        moodStreak: 0,
        avgMoodScore: 0,
        totalSessions: 0,
        weeklyGoal: 5,
        weeklyProgress: 0,
      });
    }

    // Ensure stats exist and reset avgMoodScore to 0 if no real data
    const stats = user.stats || {};
    res.json({
      moodStreak: stats.moodStreak || 0,
      avgMoodScore: stats.avgMoodScore || 0,
      totalSessions: stats.totalSessions || 0,
      weeklyGoal: stats.weeklyGoal || 5,
      weeklyProgress: stats.weeklyProgress || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:clerkId/stats', async (req, res) => {
  try {
    const stats = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkId: req.params.clerkId },
      { $set: { stats } },
      { upsert: true, new: true }
    );
    
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
