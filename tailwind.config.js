/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Indigo 500
          dark: '#4F46E5',   // Indigo 600
        },
        secondary: {
          DEFAULT: '#22D3EE', // Cyan 400
          light: '#67E8F9',   // Cyan 300
        },
        neutral: {
          900: '#1A202C', // Dark background
          700: '#4A5568', // Dark text on light background
          200: '#E2E8F0', // Light text on dark background
          50: '#F8FAFC',  // Light background/surface
        },
        success: '#10B981', // Green 500
        warning: '#F59E0B', // Yellow 500
        error: '#EF4444',   // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Use Inter as the default sans-serif font
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
