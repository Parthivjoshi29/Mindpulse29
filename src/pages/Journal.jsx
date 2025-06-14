import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Plus, Search, Calendar, Trash2, Edit3, Save, X, Sparkles, Brain } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { UserDataService } from "../services/userDataService";
import { AIService } from "../services/ai";

export default function Journal() {
  const { user } = useUser();
  const { isDark } = useTheme();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: 7,
    tags: "",
  });
  const [aiInsights, setAiInsights] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const sessions = await UserDataService.getUserSessions(user.id);
      setEntries(sessions);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeContent = async (content) => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      const [mood, emotions, insights, tags] = await Promise.all([
        AIService.analyzeMood(content),
        AIService.extractEmotions(content),
        AIService.generateInsights(content, newEntry.mood),
        AIService.suggestTags(content)
      ]);

      setNewEntry(prev => ({ ...prev, mood }));
      setAiInsights(insights);
      setSuggestedTags(tags);

      // Add emotions to dashboard data
      if (emotions.length > 0) {
        for (const emotion of emotions) {
          await UserDataService.addEmotionEntry(user.id, emotion.label, emotion.value);
        }
      }
    } catch (error) {
      console.error("Error analyzing content:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    try {
      // Combine manual tags with suggested tags
      const allTags = [
        ...newEntry.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        ...suggestedTags
      ];
      const uniqueTags = [...new Set(allTags)];

      const entryData = {
        ...newEntry,
        tags: uniqueTags,
        insights: aiInsights,
        createdAt: new Date(),
      };

      // Save to sessions and also add mood entry
      await Promise.all([
        UserDataService.saveSession(user.id, entryData),
        UserDataService.addMoodEntry(user.id, newEntry.mood)
      ]);

      await fetchEntries();
      setNewEntry({ title: "", content: "", mood: 7, tags: "" });
      setAiInsights([]);
      setSuggestedTags([]);
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating journal entry:", error);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.journal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className={`min-h-screen pt-4 pb-10 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Journal
            </h1>
            <p className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Reflect on your thoughts and experiences
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`} />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              isDark
                ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          />
        </div>

        {/* Create New Entry Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className={`relative w-full max-w-2xl rounded-2xl shadow-lg ${
              isDark ? "bg-slate-900" : "bg-white"
            } p-6`}>
              <button
                onClick={() => setIsCreating(false)}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"
                }`}
              >
                <X className={isDark ? "text-gray-400" : "text-gray-600"} />
              </button>

              <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                New Journal Entry
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Entry title..."
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />

                <div className="space-y-3">
                  <textarea
                    placeholder="Write your thoughts..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    rows={8}
                    className={`w-full p-3 rounded-lg border resize-none ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />

                  {newEntry.content.trim() && (
                    <button
                      onClick={() => analyzeContent(newEntry.content)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          <span>Analyze with AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Mood (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry({ ...newEntry, mood: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center mt-1">
                      <span className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {newEntry.mood}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="happy, work, family..."
                      value={newEntry.tags}
                      onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />

                    {suggestedTags.length > 0 && (
                      <div className="mt-2">
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          AI Suggested Tags:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {suggestedTags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                const currentTags = newEntry.tags ? newEntry.tags.split(',').map(t => t.trim()) : [];
                                if (!currentTags.includes(tag)) {
                                  setNewEntry(prev => ({
                                    ...prev,
                                    tags: prev.tags ? `${prev.tags}, ${tag}` : tag
                                  }));
                                }
                              }}
                              className={`px-2 py-1 text-xs rounded-full border ${
                                isDark
                                  ? "border-purple-500 text-purple-300 hover:bg-purple-500/20"
                                  : "border-purple-500 text-purple-700 hover:bg-purple-50"
                              }`}
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Insights */}
                {aiInsights.length > 0 && (
                  <div className={`p-4 rounded-lg border ${
                    isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                      <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        AI Insights
                      </span>
                    </div>
                    <div className="space-y-2">
                      {aiInsights.map((insight, index) => (
                        <p key={index} className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          • {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className={`px-4 py-2 rounded-lg ${
                      isDark
                        ? "bg-slate-800 text-white hover:bg-slate-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEntry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        {isLoading ? (
          <div className={`text-center py-12 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            Loading your journal entries...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            <div className="mb-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                isDark ? "bg-slate-800" : "bg-gray-100"
              }`}>
                <Edit3 className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              {searchTerm ? "No entries found" : "Start Your Journal"}
            </h3>
            <p className="mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Begin documenting your thoughts and experiences"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Write Your First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-6 rounded-2xl backdrop-blur-sm border ${
                  isDark
                    ? "bg-slate-800/50 border-white/10"
                    : "bg-white/50 border-gray-200/50"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {entry.title || "Untitled Entry"}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {entry.createdAt?.toDate ?
                          entry.createdAt.toDate().toLocaleDateString() :
                          new Date(entry.createdAt).toLocaleDateString()
                        }
                      </span>
                      {entry.mood && (
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          Mood: {entry.mood}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {entry.content || entry.journal || "No content"}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          isDark
                            ? "bg-indigo-900/50 text-indigo-300"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
