/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: ["daisyui"],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#a855f7",
          neutral: "#2a323c",
          "base-100": "#f3f4f6",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
      "light",
      "dark",
    ],
  },
};
