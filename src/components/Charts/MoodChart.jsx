import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "../../context/ThemeContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MoodChart({ data = [] }) {
  const { isDark } = useTheme();

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div
        className={`p-6 rounded-2xl backdrop-blur-sm h-[400px] flex items-center justify-center ${
          isDark ? "bg-slate-800/50" : "bg-white/90"
        } border ${isDark ? "border-white/10" : "border-gray-200"} shadow-lg`}
      >
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isDark ? "bg-slate-700" : "bg-gray-100"
          }`}>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            No Mood Data Yet
          </h3>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Start tracking your mood to see your journey here
          </p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Mood Score",
        data: data.map((d) => d.score),
        borderColor: isDark ? "#8b5cf6" : "#6366f1",
        backgroundColor: isDark
          ? "rgba(139, 92, 246, 0.1)"
          : "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: isDark ? "#8b5cf6" : "#6366f1",
        pointBorderColor: isDark ? "#8b5cf6" : "#6366f1",
        pointHoverBackgroundColor: isDark ? "#a855f7" : "#4f46e5",
        pointHoverBorderColor: isDark ? "#a855f7" : "#4f46e5",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Your Mood Journey",
        color: isDark ? "#fff" : "#1f2937",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "#9ca3af" : "#4b5563",
        },
      },
      x: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "#9ca3af" : "#4b5563",
        },
      },
    },
  };

  return (
    <div
      className={`p-6 rounded-2xl backdrop-blur-sm h-[400px] ${
        isDark ? "bg-slate-800/50" : "bg-white/90"
      } border ${isDark ? "border-white/10" : "border-gray-200"} shadow-lg`}
    >
      <Line data={chartData} options={options} />
    </div>
  );
}
