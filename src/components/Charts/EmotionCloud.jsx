import { useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import { useTheme } from "../../context/ThemeContext";

export default function EmotionCloud({ emotions = [] }) {
  const containerRef = useRef(null);
  const { isDark } = useTheme();

  // Show empty state if no emotions data
  if (!emotions || emotions.length === 0) {
    return (
      <div
        className={`p-6 rounded-2xl backdrop-blur-sm h-[400px] flex flex-col ${
          isDark ? "bg-slate-800/50" : "bg-white/90"
        } border ${isDark ? "border-white/10" : "border-gray-200"} shadow-lg`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Emotion Cloud
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isDark ? "bg-slate-700" : "bg-gray-100"
            }`}>
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
              </svg>
            </div>
            <h4 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              No Emotions Tracked
            </h4>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Your emotions will appear here as you journal and track your mood
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!emotions.length || !containerRef.current) return;

    // Clear previous SVG
    d3.select(containerRef.current).select("svg").remove();

    const width = containerRef.current.offsetWidth;
    const height = 300;

    const layout = cloud()
      .size([width, height])
      .words(
        emotions.map((emotion) => ({
          text: emotion.label,
          size: 10 + emotion.value * 90,
          color:
            emotion.value > 0.7
              ? isDark
                ? "#8b5cf6"
                : "#6366f1" // High intensity
              : emotion.value > 0.4
              ? isDark
                ? "#a855f7"
                : "#8b5cf6" // Medium intensity
              : isDark
              ? "#c084fc"
              : "#a855f7", // Low intensity
        }))
      )
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) - 1) * 45)
      .font("Inter")
      .fontSize((d) => d.size)
      .on("end", (words) => {
        const svg = d3
          .select(containerRef.current)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`);

        svg
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", (d) => `${d.size}px`)
          .style("font-family", "Inter")
          .style("fill", (d) => d.color)
          .attr("text-anchor", "middle")
          .attr(
            "transform",
            (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`
          )
          .text((d) => d.text)
          .style("opacity", 0)
          .transition()
          .duration(1000)
          .style("opacity", 1);
      });

    layout.start();
  }, [emotions, isDark]);

  return (
    <div
      ref={containerRef}
      className={`p-6 rounded-2xl backdrop-blur-sm h-[400px] ${
        isDark ? "bg-slate-800/50" : "bg-white/90"
      } border ${isDark ? "border-white/10" : "border-gray-200"} shadow-lg`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Emotion Cloud
      </h3>
    </div>
  );
}
