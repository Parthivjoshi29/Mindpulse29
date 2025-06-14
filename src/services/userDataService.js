// API service for user data management using MongoDB backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const UserDataService = {
  // Initialize service (no longer needed for API calls)
  async init() {
    // API service doesn't need initialization
    return true;
  },

  // Helper method for API calls with fallback to localStorage
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API call failed, using localStorage fallback:', error);
      // Fallback to localStorage for development
      return this.localStorageFallback(endpoint, options);
    }
  },

  // LocalStorage fallback for development
  localStorageFallback(endpoint, options = {}) {
    const method = options.method || 'GET';
    const userId = endpoint.split('/')[2]; // Extract userId from endpoint

    if (method === 'GET') {
      if (endpoint.includes('/moods')) {
        return this.getLocalMoods(userId);
      } else if (endpoint.includes('/emotions')) {
        return this.getLocalEmotions(userId);
      } else if (endpoint.includes('/sessions')) {
        return this.getLocalSessions(userId);
      } else if (endpoint.includes('/stats')) {
        return this.getLocalStats(userId);
      }
    } else if (method === 'POST') {
      const data = JSON.parse(options.body);
      if (endpoint.includes('/moods')) {
        return this.saveLocalMood(userId, data);
      } else if (endpoint.includes('/emotions')) {
        return this.saveLocalEmotion(userId, data);
      } else if (endpoint.includes('/sessions')) {
        return this.saveLocalSession(userId, data);
      }
    }

    return [];
  },

  // LocalStorage helper methods
  getLocalMoods(userId) {
    const moods = JSON.parse(localStorage.getItem(`moods_${userId}`) || '[]');
    return moods.slice(-7); // Last 7 entries
  },

  saveLocalMood(userId, data) {
    const moods = JSON.parse(localStorage.getItem(`moods_${userId}`) || '[]');
    moods.push({ ...data, createdAt: new Date().toISOString(), _id: Date.now().toString() });
    localStorage.setItem(`moods_${userId}`, JSON.stringify(moods));
    return data;
  },

  getLocalEmotions(userId) {
    return JSON.parse(localStorage.getItem(`emotions_${userId}`) || '[]');
  },

  saveLocalEmotion(userId, data) {
    const emotions = JSON.parse(localStorage.getItem(`emotions_${userId}`) || '[]');
    emotions.push({ ...data, createdAt: new Date().toISOString(), _id: Date.now().toString() });
    localStorage.setItem(`emotions_${userId}`, JSON.stringify(emotions));
    return data;
  },

  getLocalSessions(userId) {
    return JSON.parse(localStorage.getItem(`sessions_${userId}`) || '[]');
  },

  saveLocalSession(userId, data) {
    const sessions = JSON.parse(localStorage.getItem(`sessions_${userId}`) || '[]');
    sessions.push({ ...data, createdAt: new Date().toISOString(), _id: Date.now().toString() });
    localStorage.setItem(`sessions_${userId}`, JSON.stringify(sessions));
    return data;
  },

  getLocalStats(userId) {
    const defaultStats = {
      moodStreak: 0,
      avgMoodScore: 0,
      totalSessions: 0,
      weeklyGoal: 5,
      weeklyProgress: 0,
    };
    return JSON.parse(localStorage.getItem(`stats_${userId}`) || JSON.stringify(defaultStats));
  },

  // User management
  async createOrUpdateUser(clerkUser) {
    try {
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImageUrl: clerkUser.profileImageUrl,
      };

      return await this.apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return null;
    }
  },

  async getUserMoods(userId, days = 7) {
    try {
      const moods = await this.apiCall(`/users/${userId}/moods?days=${days}`);

      return moods.map(mood => ({
        date: new Date(mood.createdAt).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        score: mood.score,
      }));
    } catch (error) {
      console.error("Error fetching user moods:", error);
      return [];
    }
  },

  async addMoodEntry(userId, score, notes = '', tags = []) {
    try {
      await this.apiCall(`/users/${userId}/moods`, {
        method: 'POST',
        body: JSON.stringify({ score, notes, tags }),
      });
      return true;
    } catch (error) {
      console.error("Error adding mood entry:", error);
      return false;
    }
  },

  async getUserEmotions(userId, days = 30) {
    try {
      const emotions = await this.apiCall(`/users/${userId}/emotions?days=${days}`);

      // Aggregate emotions by label
      const emotionMap = {};
      emotions.forEach(emotion => {
        if (emotionMap[emotion.label]) {
          emotionMap[emotion.label] += emotion.value;
        } else {
          emotionMap[emotion.label] = emotion.value;
        }
      });

      return Object.entries(emotionMap)
        .map(([label, value]) => ({
          label,
          value: Math.min(1, value) // Normalize to max 1
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching user emotions:", error);
      return [];
    }
  },

  async addEmotionEntry(userId, label, value, intensity = 'medium') {
    try {
      await this.apiCall(`/users/${userId}/emotions`, {
        method: 'POST',
        body: JSON.stringify({ label, value, intensity }),
      });
      return true;
    } catch (error) {
      console.error("Error adding emotion entry:", error);
      return false;
    }
  },

  async getUserStats(userId) {
    try {
      return await this.apiCall(`/users/${userId}/stats`);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        moodStreak: 0,
        avgMoodScore: 0,
        totalSessions: 0,
        weeklyGoal: 5,
        weeklyProgress: 0,
      };
    }
  },

  async updateUserStats(userId, stats) {
    try {
      await this.apiCall(`/users/${userId}/stats`, {
        method: 'PUT',
        body: JSON.stringify(stats),
      });
      return true;
    } catch (error) {
      console.error("Error updating user stats:", error);
      return false;
    }
  },

  async saveSession(userId, sessionData) {
    try {
      await this.apiCall(`/users/${userId}/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          type: sessionData.type || 'journal',
          title: sessionData.title,
          content: sessionData.content,
          journal: sessionData.journal, // For backward compatibility
          mood: sessionData.mood,
          emotions: sessionData.emotions || [],
          tags: sessionData.tags || [],
          insights: sessionData.insights || [],
          duration: sessionData.duration,
        }),
      });
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  },

  async getUserSessions(userId, limit = 10) {
    try {
      const sessions = await this.apiCall(`/users/${userId}/sessions?limit=${limit}`);

      return sessions.map(session => ({
        id: session._id,
        ...session,
        createdAt: new Date(session.createdAt)
      }));
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      return [];
    }
  },

  // Additional utility methods
  async deleteSession(userId, sessionId) {
    try {
      await this.apiCall(`/users/${userId}/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  },

  async updateSession(userId, sessionId, updateData) {
    try {
      await this.apiCall(`/users/${userId}/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return true;
    } catch (error) {
      console.error("Error updating session:", error);
      return false;
    }
  },

  // Analytics methods
  async getMoodTrends(userId, days = 30) {
    try {
      return await this.apiCall(`/users/${userId}/moods?days=${days}`);
    } catch (error) {
      console.error("Error fetching mood trends:", error);
      return [];
    }
  },

  async getEmotionTrends(userId, days = 30) {
    try {
      return await this.apiCall(`/users/${userId}/emotions?days=${days}`);
    } catch (error) {
      console.error("Error fetching emotion trends:", error);
      return [];
    }
  }
};
