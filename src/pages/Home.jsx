import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SignInButton,
  SignUpButton,
  useUser,
  useClerk,
} from "@clerk/clerk-react";
import {
  Mic,
  TrendingUp,
  Heart,
  ChevronDown,
  Play,
  Zap,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const { isDark } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartJourney = async () => {
    try {
      setIsProcessing(true);
      if (!isSignedIn) {
        openSignIn();
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: `radial-gradient(circle, ${
              isDark ? "#8b5cf6" : "#3b82f6"
            }, transparent)`,
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: "all 0.3s ease-out",
          }}
        />
        <div
          className={`absolute top-20 right-20 w-32 h-32 rounded-full opacity-30 animate-bounce ${
            isDark
              ? "bg-gradient-to-r from-purple-400 to-pink-400"
              : "bg-gradient-to-r from-blue-400 to-cyan-400"
          }`}
        />
        <div
          className={`absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-20 animate-pulse ${
            isDark
              ? "bg-gradient-to-r from-indigo-400 to-purple-400"
              : "bg-gradient-to-r from-purple-400 to-pink-400"
          }`}
        />
      </div>

      {/* Animated Background Elements for Dark Mode */}



      {/* Hero Section */}
      <div className="min-h-screen pt-8 pb-20 px-6 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-20 ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 via-purple-900/30 to-slate-800/50 border border-purple-500/20"
                : "bg-white/90 border border-gray-200/50"
            } backdrop-blur-xl shadow-2xl`}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
                  isDark ? "bg-purple-600/10" : "bg-indigo-200/30"
                }`}
              />
              <div
                className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
                  isDark ? "bg-indigo-600/10" : "bg-purple-200/30"
                }`}
              />
            </div>

            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-sm">
                <Zap
                  className={`w-4 h-4 ${
                    isDark ? "text-purple-400" : "text-indigo-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-purple-200" : "text-indigo-700"
                  }`}
                >
                  AI-Powered Wellness Platform
                </span>
              </div>

              {/* Main heading */}
              <div className="max-w-4xl mx-auto text-center">
                <h1
                  className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Transform Your
                  <span
                    className={`block bg-gradient-to-r bg-clip-text text-transparent ${
                      isDark
                        ? "from-purple-400 to-indigo-400"
                        : "from-indigo-600 to-purple-600"
                    }`}
                  >
                    Mental Wellness
                  </span>
                  Journey Today
                </h1>

                <p
                  className={`text-xl md:text-2xl mb-12 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } max-w-3xl mx-auto leading-relaxed`}
                >
                  Experience personalized emotional support through
                  <span
                    className={`font-semibold ${
                      isDark ? "text-purple-400" : "text-indigo-600"
                    }`}
                  >
                    {" "}
                    AI-powered conversations{" "}
                  </span>
                  that understand and respond to your unique needs.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12">
                  <button
                    onClick={handleStartJourney}
                    disabled={isProcessing}
                    className={`group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600
                      rounded-xl text-white font-semibold shadow-xl
                      transition-all duration-300 hover:scale-105 overflow-hidden
                      ${
                        isProcessing
                          ? "opacity-75 cursor-not-allowed"
                          : "hover:shadow-purple-500/25"
                      }`}
                  >
                    <span
                      className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r
                      from-transparent via-white/30 to-transparent transition-all duration-700
                      ease-in-out group-hover:left-[100%] z-0"
                    />
                    <div className="relative flex items-center justify-center space-x-3 z-10">
                      {isProcessing ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          <span>{isSignedIn ? "Go to Dashboard" : "Start Your Journey"}</span>
                        </>
                      )}
                    </div>
                  </button>

                  {!isSignedIn && (
                    <SignUpButton mode="modal">
                      <button className="px-8 py-4 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                        Get Started Free
                      </button>
                    </SignUpButton>
                  )}
                </div>

                {/* Scroll indicator */}
                <div className="animate-bounce">
                  <ChevronDown
                    className={`w-6 h-6 mx-auto ${
                      isDark ? "text-purple-400" : "text-indigo-600"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3
              className={`text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r ${
                isDark
                  ? "from-white to-purple-200"
                  : "from-gray-900 to-indigo-600"
              } bg-clip-text text-transparent`}
            >
              Powerful Features for Your Wellness
            </h3>
            <p
              className={`text-lg max-w-3xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-900"
              }`}
            >
              Discover tools designed to support your mental health journey with
              cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Voice Check-In",
                description: (
                  <span className={`text-${isDark ? "gray-300" : "gray-900"}`}>
                    Express yourself naturally through intelligent voice
                    conversations with our empathetic AI companion
                  </span>
                ),
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: isDark
                  ? "from-blue-500/10 to-cyan-500/10"
                  : "from-blue-50 to-cyan-50",
              },
              {
                title: "Mood Analytics",
                description: (
                  <span className={`text-${isDark ? "gray-300" : "gray-900"}`}>
                    Visualize your emotional journey with beautiful, interactive
                    charts and personalized insights
                  </span>
                ),
                gradient: "from-purple-500 to-pink-500",
                bgGradient: isDark
                  ? "from-purple-500/10 to-pink-500/10"
                  : "from-purple-50 to-pink-50",
              },
              {
                title: "Mindfulness Suite",
                description: (
                  <span className={`text-${isDark ? "gray-300" : "gray-900"}`}>
                    Engage in therapeutic activities and games designed to boost
                    your mood and reduce stress
                  </span>
                ),
                gradient: "from-green-500 to-emerald-500",
                bgGradient: isDark
                  ? "from-green-500/10 to-emerald-500/10"
                  : "from-green-50 to-emerald-50",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                  isDark
                    ? "bg-slate-800/50 border border-white/10 hover:border-white/20"
                    : "bg-white/80 border border-gray-200/50 hover:border-gray-300/50"
                } backdrop-blur-xl shadow-xl hover:shadow-2xl`}
              >
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-t-3xl group-hover:w-full transition-[width] duration-300 ease-out`}
                />

                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.bgGradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div
                    className={`text-transparent bg-gradient-to-r ${feature.gradient} bg-clip-text`}
                  >
                    {feature.icon}
                  </div>
                </div>

                <h4 className="text-2xl font-bold mb-4">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/5 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div
            className={`relative overflow-hidden rounded-3xl p-12 ${
              isDark
                ? "bg-gradient-to-r from-slate-800/50 via-purple-900/30 to-slate-800/50 border border-purple-500/20"
                : "bg-gradient-to-r from-white/80 via-indigo-50/50 to-white/80 border border-indigo-200/50"
            } backdrop-blur-xl shadow-2xl`}
          >
            <div className="absolute inset-0">
              <div
                className={`absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b ${
                  isDark
                    ? "from-purple-500/20 to-transparent"
                    : "from-indigo-300/30 to-transparent"
                }`}
              />
              <div
                className={`absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b ${
                  isDark
                    ? "from-pink-500/20 to-transparent"
                    : "from-purple-300/30 to-transparent"
                }`}
              />
            </div>

            <div className="relative grid md:grid-cols-3 gap-12 text-center">
              {[
                {
                  icon: <Users className="w-8 h-8 mx-auto mb-4" />,
                  value: "50K+",
                  label: "Happy Users",
                  growth: "↗︎ 90% satisfaction rate",
                  color: isDark ? "text-blue-400" : "text-blue-600",
                },
                {
                  icon: <TrendingUp className="w-8 h-8 mx-auto mb-4" />,
                  value: "1.2M",
                  label: "Daily Check-ins",
                  growth: "↗︎ 40% growth this month",
                  color: isDark ? "text-purple-400" : "text-purple-600",
                },
                {
                  icon: <Award className="w-8 h-8 mx-auto mb-4" />,
                  value: "89%",
                  label: "Emotional Growth",
                  growth: "Based on user tracking",
                  color: isDark ? "text-green-400" : "text-green-600",
                },
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div
                    className={`${stat.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className={`text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r ${
                      isDark
                        ? "from-white to-gray-300"
                        : "from-gray-900 to-gray-600"
                    } bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xl font-semibold mb-2">{stat.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.growth}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h3
            className={`text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r ${
              isDark
                ? "from-white via-purple-200 to-pink-200"
                : "from-gray-900 via-indigo-600 to-purple-600"
            } bg-clip-text text-transparent`}
          >
            Ready to Transform Your Mental Wellness?
          </h3>
          <p
            className={`text-lg ${
              isDark ? "text-gray-300" : "text-gray-600"
            } mb-8`}
          >
            Join thousands of users who have discovered the power of AI-assisted
            emotional support
          </p>

          {!isSignedIn ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <SignUpButton mode="modal">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 ease-in-out group-hover:left-[100%] z-0" />
                  <div className="relative flex items-center justify-center space-x-3 z-10">
                    <Sparkles className="w-5 h-5" />
                    <span>Get Started Free</span>
                  </div>
                </button>
              </SignUpButton>

              <SignInButton mode="modal">
                <button className="px-8 py-4 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                  Sign In
                </button>
              </SignInButton>
            </div>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 ease-in-out group-hover:left-[100%] z-0" />
              <div className="relative flex items-center justify-center space-x-3 z-10">
                <Sparkles className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </div>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
