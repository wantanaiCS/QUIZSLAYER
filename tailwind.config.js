/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        // QuizSlayer Design System
        qs: {
          bg:         '#0d0f1a',
          surface:    '#141626',
          card:       '#1a1e30',
          border:     '#252840',
          primary:    '#6c63ff',
          secondary:  '#ff6b6b',
          accent:     '#ffd93d',
          gold:       '#f4c842',
          success:    '#43d98f',
          danger:     '#ff4757',
          warning:    '#ffa502',
          mana:       '#4fc3f7',
          mana2:      '#9c27b0',
          text:       '#e8eaf6',
          muted:      '#8b8fa8',
        },
        monster: {
          slime:      '#6fcf5a',
          goblin:     '#8fbc56',
          orc:        '#78909c',
          mage:       '#9c27b0',
          boss:       '#c62828',
        },
        hp: {
          high:       '#43d98f',
          mid:        '#ffd93d',
          low:        '#ff4757',
        },
      },
      backgroundImage: {
        'gradient-qs':       'linear-gradient(135deg, #0d0f1a 0%, #1a1e30 100%)',
        'gradient-primary':  'linear-gradient(135deg, #6c63ff 0%, #9c27b0 100%)',
        'gradient-battle':   'linear-gradient(180deg, #0a0c1a 0%, #1a0a2e 100%)',
        'gradient-gold':     'linear-gradient(135deg, #f4c842 0%, #ff9800 100%)',
      },
      boxShadow: {
        'qs':         '0 4px 24px rgba(108, 99, 255, 0.2)',
        'qs-glow':    '0 0 20px rgba(108, 99, 255, 0.5)',
        'gold-glow':  '0 0 16px rgba(244, 200, 66, 0.5)',
        'danger-glow':'0 0 16px rgba(255, 71, 87, 0.5)',
        'card':       '0 2px 16px rgba(0,0,0,0.4)',
      },
      animation: {
        'float':       'float 3s ease-in-out infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'shake':       'shake 0.4s ease-in-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
        'bar-fill':    'barFill 0.5s ease-out',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'bounce-in':   'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        barFill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--bar-width, 100%)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(108, 99, 255, 0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(108, 99, 255, 0.8)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        'qs': '12px',
        'qs-lg': '20px',
      },
    },
  },
  plugins: [],
}
