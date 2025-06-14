
# 🧠 MindPulse – *Feel It. Speak It. Heal It.*

**MindPulse** is a voice-based emotional support application powered by AI. It helps users express, track, and manage their emotional well-being through natural conversation.

---

## 🌟 Features

### 1. Dynamic Dashboard
- Real-time mood and emotion visualization
- Progress tracking with interactive charts
- Personalized insights and recommendations
- Activity summary and streak tracking

### 2. Clerk AuthenticationSecure user authentication and management
- Social login options (Google, Apple)
- Profile customization
- Privacy-focused data handling

### 3. Voice Interaction
- Speech-to-text for natural conversation
- Multiple transcription methods (Web Speech API, Whisper)
- Voice recording with visual feedback
- Fallback mechanisms for reliability

### 4. AI Chatbot Companion

- Text and voice responses
- Emotional support and guidance
- Personalized recommendations
- Context-aware conversations

### 5. Gamification System
- Achievement badges and rewards
- Daily streaks and challenges
- Progress milestones
- Motivational notifications

### 6. Journal System
- AI-powered emotion analysis
- Guided journaling prompts
- Mood correlation insights
- Searchable entry history

### 7. Session Tracking
- Meditation session logging
- Breathing exercise completion
- Journal entry statistics
- Mood check-in history

### 8. Calm Zone
- Meditation timer with customizable durations
- Multiple ambient sound options
- Real-time breathing visualization
- Session history and favorites

### 9. Audio Experience
- High-quality ambient sounds (rain, ocean, forest, wind)
- Meditation music integration
- Freesound API integration for authentic audio
- Volume and mix controls

### 10. Breathing Techniques
- Guided breathing exercises (4-7-8, Box Breathing)
- Visual breathing animation
- Customizable session duration
- Background sound accompaniment

---

## 🛠️ Tech Stack

| Layer         | Technology                 |
|---------------|-----------------------------|
| **Frontend**  | React.js, Tailwind CSS      |
| **AI**        | GROQ API                    |
| **Voice**     | GROQ API                    |
| **Charts**    | Recharts                    |
| **Auth**      | Clerk                       |
| **Storage**   | Mongo DB                    |

---

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mindpulse.git
   cd mindpulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🔧 Configuration

Create a `.env` file in the root directory and add the following:

```env
VITE_CLERK_PUBLISHABLE_KEY= USE YOUR CLERK KEY

# MongoDB Configuration
VITE_MONGODB_URI= USE YOUR MONGO DB URI 

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Groq API Configuration
VITE_GROQ_API_KEY= USE GROQ API 

# Freesound API Configuration
VITE_FREESOUND_CLIENT_ID= USE FREE SOUND CLIENT ID
VITE_FREESOUND_API_KEY= USE FREE SOUND API KEY
```

---

## 📱 Usage

### 🚀 Start the App
```bash
npm run dev:full
```

### 🎙️ Voice Check-In
- Click the **microphone icon**
- Speak how you're feeling
- Receive AI-powered emotional support

### 📊 Track Progress
- View mood charts
- Review journal entries
- Monitor your mental wellness achievements

---

-

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

---

## 👥 Team

- **Developer:** PARTHIV JOSHI

---

**Made with ❤️ for mental wellness.**  
Need help? Reach out via 
LinkedIN : https://www.linkedin.com/in/parthiv-joshi-8a7766281/
