import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import { UserDataService } from '../services/userDataService';
import ChatBot from '../components/AI/ChatBot';
import VoiceTestComponent from '../components/AI/VoiceTestComponent';
import TTSTestComponent from '../components/AI/TTSTestComponent';
import { Brain, Sparkles, Heart, Target, TrendingUp, Settings, Volume2 } from 'lucide-react';

export default function AIChat() {
  const { user } = useUser();
  const { isDark } = useTheme();
  const [userContext, setUserContext] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [showVoiceTest, setShowVoiceTest] = useState(false);
  const [showTTSTest, setShowTTSTest] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserContext();
    }
  }, [user]);

  const fetchUserContext = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user data to provide context to AI
      const [moodData, sessionsData, statsData] = await Promise.all([
        UserDataService.getUserMoods(user.id, 7), // Last 7 days
        UserDataService.getUserSessions(user.id, 10), // Last 10 sessions
        UserDataService.getUserStats(user.id)
      ]);

      // Calculate current context
      const avgMood = moodData.length > 0 
        ? moodData.reduce((sum, mood) => sum + mood.score, 0) / moodData.length 
        : null;

      const recentActivities = sessionsData.slice(0, 3).map(session => session.type).join(', ');
      
      const stressLevel = avgMood ? (avgMood < 5 ? 'high' : avgMood < 7 ? 'medium' : 'low') : 'unknown';

      setUserContext({
        mood: avgMood ? Math.round(avgMood * 10) / 10 : null,
        recentActivities: recentActivities || 'none',
        stressLevel,
        totalSessions: sessionsData.length,
        moodStreak: statsData.moodStreak || 0,
        lastSessionDate: sessionsData[0]?.createdAt || null
      });

    } catch (error) {
      console.error('Error fetching user context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendation = (newRecommendations) => {
    setRecommendations(newRecommendations);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen pt-4 pb-10 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Brain className={`w-12 h-12 mx-auto mb-4 animate-pulse ${
                isDark ? 'text-indigo-400' : 'text-indigo-500'
              }`} />
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Preparing your AI companion...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-4 pb-10 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Wellness Companion
            </h1>
            <Sparkles className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
          </div>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Talk with your personal AI companion for personalized mental wellness support
          </p>

          {/* Test Toggles */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowVoiceTest(!showVoiceTest)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              {showVoiceTest ? 'Hide Voice Test' : 'Test Voice Input'}
            </button>

            <button
              onClick={() => setShowTTSTest(!showTTSTest)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {showTTSTest ? 'Hide TTS Test' : 'Test AI Voice'}
            </button>
          </div>
        </div>

        {/* User Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
          } border shadow-lg`}>
            <div className="flex items-center gap-3">
              <Heart className={`w-6 h-6 ${
                userContext.mood >= 7 ? 'text-green-500' : 
                userContext.mood >= 5 ? 'text-yellow-500' : 'text-red-500'
              }`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Current Mood
                </p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userContext.mood ? `${userContext.mood}/10` : 'Not tracked'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
          } border shadow-lg`}>
            <div className="flex items-center gap-3">
              <Target className={`w-6 h-6 ${
                userContext.stressLevel === 'low' ? 'text-green-500' : 
                userContext.stressLevel === 'medium' ? 'text-yellow-500' : 'text-red-500'
              }`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Stress Level
                </p>
                <p className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userContext.stressLevel}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
          } border shadow-lg`}>
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sessions
                </p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userContext.totalSessions}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
          } border shadow-lg`}>
            <div className="flex items-center gap-3">
              <Sparkles className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Streak
                </p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userContext.moodStreak} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Components */}
        {showVoiceTest && (
          <VoiceTestComponent />
        )}

        {showTTSTest && (
          <TTSTestComponent />
        )}

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <ChatBot 
              userContext={userContext}
              onRecommendation={handleRecommendation}
            />
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-4">
            <div className={`p-6 rounded-2xl ${
              isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
            } border shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                AI Recommendations
              </h3>
              
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{rec.icon}</span>
                        <div>
                          <h4 className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {rec.title}
                          </h4>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className={`w-12 h-12 mx-auto mb-3 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Start chatting to get personalized recommendations
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-2xl ${
              isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-gray-200'
            } border shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isDark 
                      ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-200' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  📊 Track Mood
                </button>
                
                <button 
                  onClick={() => window.location.href = '/journal'}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isDark 
                      ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-200' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  📝 Journal Session
                </button>
                
                <button 
                  onClick={() => window.location.href = '/calm-zone'}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isDark 
                      ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-200' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  🧘 Calm Zone
                </button>
                
                <button 
                  onClick={() => window.location.href = '/progress'}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isDark 
                      ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-200' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  🏆 View Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Info */}
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
        } border`}>
          <div className="text-center">
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              🤖 Powered by Advanced AI
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Your AI companion understands context, learns from your patterns, and provides personalized mental wellness support 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
