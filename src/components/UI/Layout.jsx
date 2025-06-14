// filepath: d:\hack-app\src\components\UI\Layout.jsx
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { useTheme } from "../../context/ThemeContext";

export default function Layout() {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-950 text-white"
          : "bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-gray-900"
      }`}
    >
      {/* Animated Background Elements for Dark Mode */}
      {isDark && (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </div>
      )}

      <div className="relative z-10">
        <Navigation />
        <main
          className={`container mx-auto px-4 py-8 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
