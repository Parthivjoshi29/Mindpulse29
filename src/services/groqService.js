import Groq from 'groq-sdk';

class GroqService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';

    if (!this.apiKey) {
      console.error('❌ VITE_GROQ_API_KEY not found in environment variables');
      throw new Error('Groq API key is required. Please add VITE_GROQ_API_KEY to your .env file.');
    }
  }

  async getChatResponse(message, userContext = {}) {
    try {
      console.log('🤖 Sending message to Groq:', message);

      const systemPrompt = this.buildSystemPrompt(userContext);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ],
          model: "llama3-8b-8192",
          temperature: 0.7,
          max_tokens: 300,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm here to help. Can you tell me more?";

      console.log('✅ Groq response received:', aiResponse);

      // Extract recommendations from the response
      const recommendations = this.extractRecommendations(aiResponse, message);

      return {
        message: aiResponse,
        recommendations: recommendations,
        confidence: 0.9,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Groq API error:', error);
      return this.getFallbackResponse(message);
    }
  }

  buildSystemPrompt(userContext) {
    const { mood, recentActivities, stressLevel, userName } = userContext;
    
    return `You are MindPulse AI, a compassionate and supportive mental health companion. Your role is to provide empathetic responses and helpful recommendations for users' emotional wellbeing.

PERSONALITY:
- Warm, understanding, and non-judgmental
- Professional but friendly tone
- Use emojis sparingly but effectively
- Keep responses concise (under 150 words)

USER CONTEXT:
- Current mood: ${mood || 'unknown'}
- Recent activities: ${recentActivities || 'none'}
- Stress level: ${stressLevel || 'unknown'}
- Name: ${userName || 'friend'}

GUIDELINES:
1. Always acknowledge the user's feelings with empathy
2. Provide 1-2 specific, actionable recommendations
3. Suggest activities from: breathing exercises, meditation, journaling, gentle movement, grounding techniques
4. If user mentions crisis/self-harm, immediately suggest professional help
5. Ask follow-up questions to better understand their situation
6. Be encouraging and hopeful

RESPONSE FORMAT:
- Start with empathetic acknowledgment
- Provide helpful suggestions
- End with supportive encouragement or question

Remember: You're not a replacement for professional therapy, but a supportive companion for daily wellness.`;
  }

  extractRecommendations(response, userMessage) {
    const recommendations = [];
    
    // Analyze user message for emotional state
    const message = userMessage.toLowerCase();
    const responseText = response.toLowerCase();
    
    // Stress-related recommendations
    if (message.includes('stress') || message.includes('overwhelm') || message.includes('pressure')) {
      recommendations.push({
        type: 'breathing',
        title: '5-Minute Stress Relief',
        description: 'Quick breathing exercise to calm your mind',
        action: 'start-breathing',
        icon: '🧘'
      });
      recommendations.push({
        type: 'journal',
        title: 'Stress Journal',
        description: 'Write about what\'s causing stress',
        action: 'open-journal',
        icon: '📝'
      });
    }
    
    // Anxiety-related recommendations
    if (message.includes('anxious') || message.includes('worry') || message.includes('nervous')) {
      recommendations.push({
        type: 'grounding',
        title: '5-4-3-2-1 Grounding',
        description: 'Ground yourself in the present moment',
        action: 'start-grounding',
        icon: '🌱'
      });
      recommendations.push({
        type: 'calm',
        title: 'Calm Zone',
        description: 'Visit our calm zone for relaxation',
        action: 'open-calm-zone',
        icon: '🕯️'
      });
    }
    
    // Sadness-related recommendations
    if (message.includes('sad') || message.includes('down') || message.includes('depressed')) {
      recommendations.push({
        type: 'mood',
        title: 'Mood Boost Activities',
        description: 'Gentle activities to lift your spirits',
        action: 'mood-boost',
        icon: '🌈'
      });
      recommendations.push({
        type: 'gratitude',
        title: 'Gratitude Practice',
        description: 'Focus on positive aspects of your day',
        action: 'start-gratitude',
        icon: '🙏'
      });
    }
    
    // General wellness recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'check-in',
        title: 'Daily Check-in',
        description: 'Track your mood and emotions',
        action: 'mood-check',
        icon: '📊'
      });
      recommendations.push({
        type: 'journal',
        title: 'Journal Session',
        description: 'Reflect on your thoughts and feelings',
        action: 'open-journal',
        icon: '📖'
      });
    }
    
    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

  getFallbackResponse(message) {
    const fallbackResponses = [
      {
        message: "I'm here to listen and support you. Sometimes technology has hiccups, but my care for your wellbeing never does. Can you tell me more about how you're feeling? 💙",
        recommendations: [
          {
            type: 'chat',
            title: 'Continue Talking',
            description: 'Tell me more about your day',
            action: 'continue-chat',
            icon: '💬'
          }
        ]
      },
      {
        message: "I want to help you feel better. While I sort out a technical issue, know that your feelings are valid and you're not alone. What's on your mind today? 🤗",
        recommendations: [
          {
            type: 'mood',
            title: 'Quick Mood Check',
            description: 'How are you feeling right now?',
            action: 'mood-check',
            icon: '😊'
          }
        ]
      }
    ];
    
    return {
      ...fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      confidence: 0.5,
      timestamp: new Date().toISOString()
    };
  }

  async analyzeEmotionalState(message) {
    try {
      const analysisPrompt = `Analyze the emotional state in this message and return a JSON response:

      Message: "${message}"

      Return JSON with:
      {
        "primaryEmotion": "emotion name",
        "intensity": 1-10,
        "urgency": "low/medium/high",
        "keywords": ["key", "words"],
        "supportNeeded": "type of support needed"
      }`;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: analysisPrompt }],
          model: "llama3-8b-8192",
          temperature: 0.3,
          max_tokens: 200
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Emotion analysis failed:', error);
      return {
        primaryEmotion: 'neutral',
        intensity: 5,
        urgency: 'low',
        keywords: [],
        supportNeeded: 'general'
      };
    }
  }
}

export default new GroqService();
