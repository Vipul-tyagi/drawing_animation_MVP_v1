/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '375px',    // iPhone SE
      'sm': '390px',    // iPhone 12/13/14
      'md': '768px',    // iPad
      'lg': '1024px',   // iPad Pro
      'xl': '1280px',   // Desktop
      '2xl': '1920px',  // Large Desktop
    },
    extend: {
      colors: {
        // Magical, joyful color palette for families
        primary: {
          50: '#fef7ff',
          100: '#fdeeff',
          200: '#fcdcff',
          300: '#f9b9ff',
          400: '#f485ff',
          500: '#ed4eff',
          600: '#d926aa',
          700: '#b91c7c',
          800: '#9a1b5e',
          900: '#7e1a4f',
          DEFAULT: '#ed4eff',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#38bdf8',
        },
        // Rainbow colors for magical effects
        rainbow: {
          red: '#ff6b6b',
          orange: '#ffa726',
          yellow: '#ffeb3b',
          green: '#66bb6a',
          blue: '#42a5f5',
          indigo: '#7986cb',
          purple: '#ab47bc',
        },
        // Playful accent colors
        sunshine: '#ffeb3b',
        bubblegum: '#ff69b4',
        mint: '#98fb98',
        lavender: '#e6e6fa',
        peach: '#ffcccb',
        sky: '#87ceeb',
        grass: '#90ee90',
        // Neutral colors with warmth
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          DEFAULT: '#22c55e',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#f59e0b',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          DEFAULT: '#ef4444',
        },
      },
      fontFamily: {
        sans: [
          'Comic Neue',
          'Fredoka One',
          'Nunito',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        display: ['Fredoka One', 'Comic Neue', 'cursive'],
        body: ['Nunito', 'Comic Neue', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'bounce-gentle': 'bounceGentle 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'rainbow': 'rainbow 3s linear infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'pulse-rainbow': 'pulseRainbow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
        'heart-beat': 'heartBeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        rainbow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
        pulseRainbow: {
          '0%, 100%': { 
            backgroundImage: 'linear-gradient(45deg, #ff6b6b, #ffa726, #ffeb3b, #66bb6a, #42a5f5, #7986cb, #ab47bc)',
            backgroundSize: '400% 400%',
            backgroundPosition: '0% 50%'
          },
          '50%': { 
            backgroundPosition: '100% 50%'
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'magical': '0 0 20px rgba(237, 78, 255, 0.3), 0 0 40px rgba(56, 189, 248, 0.2)',
        'rainbow': '0 0 30px rgba(255, 107, 107, 0.3), 0 0 60px rgba(255, 167, 38, 0.2)',
        'glow': '0 0 15px rgba(255, 255, 255, 0.5)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'playful': '0 8px 25px rgba(237, 78, 255, 0.15)',
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(45deg, #ff6b6b, #ffa726, #ffeb3b, #66bb6a, #42a5f5, #7986cb, #ab47bc)',
        'magical-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        'ocean-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [],
};