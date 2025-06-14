// AI service for processing user input and generating insights

export const AIService = {
  // Analyze mood from text input
  async analyzeMood(text) {
    try {
      // Simple mood analysis based on keywords
      const positiveWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'good', 'love', 'peaceful', 'calm', 'grateful', 'blessed', 'content'];
      const negativeWords = ['sad', 'angry', 'frustrated', 'terrible', 'awful', 'hate', 'stressed', 'anxious', 'worried', 'depressed', 'upset', 'mad'];

      const words = text.toLowerCase().split(/\s+/);
      let positiveScore = 0;
      let negativeScore = 0;

      words.forEach(word => {
        if (positiveWords.includes(word)) positiveScore++;
        if (negativeWords.includes(word)) negativeScore++;
      });

      // Calculate mood score (1-10)
      let moodScore = 5; // neutral
      if (positiveScore > negativeScore) {
        moodScore = Math.min(10, 5 + (positiveScore - negativeScore) * 1.5);
      } else if (negativeScore > positiveScore) {
        moodScore = Math.max(1, 5 - (negativeScore - positiveScore) * 1.5);
      }

      return Math.round(moodScore);
    } catch (error) {
      console.error('Error analyzing mood:', error);
      return 5; // default neutral mood
    }
  },

  // Extract emotions from text
  async extractEmotions(text) {
    try {
      const emotionKeywords = {
        happy: ['happy', 'joy', 'joyful', 'cheerful', 'delighted', 'pleased'],
        sad: ['sad', 'unhappy', 'melancholy', 'down', 'blue', 'depressed'],
        angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated'],
        anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy'],
        excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'pumped'],
        calm: ['calm', 'peaceful', 'serene', 'relaxed', 'tranquil', 'zen'],
        grateful: ['grateful', 'thankful', 'blessed', 'appreciative'],
        confident: ['confident', 'sure', 'certain', 'bold', 'strong'],
        tired: ['tired', 'exhausted', 'weary', 'drained', 'sleepy'],
        motivated: ['motivated', 'inspired', 'driven', 'determined', 'focused']
      };

      const words = text.toLowerCase().split(/\s+/);
      const detectedEmotions = [];

      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        const matches = keywords.filter(keyword =>
          words.some(word => word.includes(keyword))
        ).length;

        if (matches > 0) {
          detectedEmotions.push({
            label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
            value: Math.min(1, matches * 0.3)
          });
        }
      });

      // If no emotions detected, add a default
      if (detectedEmotions.length === 0) {
        detectedEmotions.push({ label: 'Neutral', value: 0.5 });
      }

      return detectedEmotions;
    } catch (error) {
      console.error('Error extracting emotions:', error);
      return [{ label: 'Neutral', value: 0.5 }];
    }
  },

  // Generate AI insights from journal entry
  async generateInsights(text, mood) {
    try {
      const insights = [];

      // Mood-based insights
      if (mood >= 8) {
        insights.push("You seem to be in a great mood! This is wonderful to see.");
        insights.push("Consider what contributed to this positive feeling to recreate it in the future.");
      } else if (mood <= 3) {
        insights.push("It sounds like you're going through a tough time. Remember that difficult feelings are temporary.");
        insights.push("Consider reaching out to someone you trust or practicing some self-care activities.");
      } else if (mood >= 6) {
        insights.push("You seem to be in a balanced emotional state today.");
      }

      // Content-based insights
      const words = text.toLowerCase();

      if (words.includes('work') || words.includes('job')) {
        insights.push("Work seems to be on your mind. Remember to maintain a healthy work-life balance.");
      }

      if (words.includes('family') || words.includes('friend')) {
        insights.push("Relationships appear important to you today. Social connections are vital for wellbeing.");
      }

      if (words.includes('exercise') || words.includes('workout') || words.includes('run')) {
        insights.push("Great to see you're staying active! Physical activity is excellent for mental health.");
      }

      if (words.includes('sleep') || words.includes('tired')) {
        insights.push("Sleep seems to be a factor today. Quality rest is crucial for emotional regulation.");
      }

      // Add a general insight if none were generated
      if (insights.length === 0) {
        insights.push("Thank you for taking time to reflect on your day. Regular journaling can improve self-awareness.");
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return ["Thank you for sharing your thoughts today."];
    }
  },

  // Generate suggested tags based on content
  async suggestTags(text) {
    try {
      const tagKeywords = {
        work: ['work', 'job', 'office', 'meeting', 'project', 'boss', 'colleague'],
        family: ['family', 'mom', 'dad', 'parent', 'child', 'sibling', 'relative'],
        friends: ['friend', 'buddy', 'pal', 'social', 'hangout', 'party'],
        health: ['health', 'doctor', 'exercise', 'workout', 'gym', 'diet', 'medical'],
        travel: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'explore'],
        food: ['food', 'eat', 'restaurant', 'cook', 'meal', 'dinner', 'lunch'],
        hobby: ['hobby', 'read', 'book', 'music', 'art', 'paint', 'draw', 'game'],
        nature: ['nature', 'park', 'tree', 'flower', 'beach', 'mountain', 'outdoor'],
        learning: ['learn', 'study', 'course', 'school', 'education', 'knowledge'],
        goals: ['goal', 'plan', 'future', 'dream', 'aspiration', 'achievement']
      };

      const words = text.toLowerCase().split(/\s+/);
      const suggestedTags = [];

      Object.entries(tagKeywords).forEach(([tag, keywords]) => {
        const hasMatch = keywords.some(keyword =>
          words.some(word => word.includes(keyword))
        );

        if (hasMatch) {
          suggestedTags.push(tag);
        }
      });

      return suggestedTags;
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return [];
    }
  }
};