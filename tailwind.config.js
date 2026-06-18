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
        thai: ['Prompt', 'Sarabun', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        qs: {
          // Backgrounds — dark navy inspired by logo shadow
          bg:            '#080b14',
          'bg-secondary': '#101424',
          'depth-0':     '#080b14',
          'depth-1':     '#0c0f1c',
          'depth-2':     '#101424',
          'depth-3':     '#14182e',
          'depth-4':     '#1a1f38',
          surface:       '#101424',
          card:          '#151a2e',
          border:        '#1e2540',

          // Primary = logo cyan (#4fc3f7 ? mark color)
          primary:    '#4fc3f7',
          // Purple = logo outline/glow (#7b5ea7 / #5c3d8f)
          purple:     '#7b5ea7',
          secondary:  '#c084fc',

          // Accents
          accent:     '#ffd93d',
          gold:       '#f4c842',
          success:    '#43d98f',
          danger:     '#ff4757',
          warning:    '#ffa502',
          info:       '#4fc3f7',

          // Legacy mana kept for battle
          mana:       '#4fc3f7',
          mana2:      '#9c27b0',
          cyan:       '#4fc3f7',
          indigo:     '#818cf8',
          xp:         '#a78bfa',

          // Text — steel tone matches logo QUIZSLAYER text
          text:       '#dde4f0',
          muted:      '#7a8099',

          // Ranks
          'rank-s':   '#f4c842',
          'rank-a':   '#c084fc',
          'rank-b':   '#60a5fa',
          'rank-c':   '#34d399',
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
        // Logo-inspired gradients
        'gradient-qs':       'linear-gradient(135deg, #080b14 0%, #14182e 100%)',
        'gradient-primary':  'linear-gradient(135deg, #4fc3f7 0%, #7b5ea7 100%)',
        'gradient-battle':   'linear-gradient(180deg, #080b14 0%, #14082a 100%)',
        'gradient-gold':     'linear-gradient(135deg, #f4c842 0%, #ff9800 100%)',
        'gradient-logo':     'linear-gradient(135deg, #4fc3f7 0%, #5c3d8f 100%)',
      },
      boxShadow: {
        // Cyan glow matching logo primary color
        'qs':          '0 4px 24px rgba(79, 195, 247, 0.15)',
        'qs-glow':     '0 0 20px rgba(79, 195, 247, 0.45)',
        'purple-glow': '0 0 20px rgba(123, 94, 167, 0.5)',
        'gold-glow':   '0 0 16px rgba(244, 200, 66, 0.5)',
        'danger-glow': '0 0 16px rgba(255, 71, 87, 0.5)',
        'card':        '0 2px 16px rgba(0,0,0,0.5)',
      },
      animation: {
        'float':            'float 3s ease-in-out infinite',
        'float-logo':       'floatLogo 4s ease-in-out infinite',
        'pulse-slow':       'pulse 3s ease-in-out infinite',
        'shake':            'shake 0.4s ease-in-out',
        'slide-up':         'slideUp 0.3s ease-out',
        'slide-up-mobile':  'slideUpMobile 0.25s ease-out',
        'fade-in':          'fadeIn 0.4s ease-out',
        'bar-fill':         'barFill 0.5s ease-out',
        'glow-pulse':       'glowPulse 2s ease-in-out infinite',
        'bounce-in':        'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'badge-unlock':     'badgeUnlock 0.6s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'underline-expand': 'underlineExpand 0.3s ease-out',
        'number-pop':       'numberPop 0.3s ease',
        'card-shake':       'cardShake 0.4s ease-in-out',
        'shimmer':          'shimmer 0.5s ease',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        floatLogo: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        cardShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-8px)' },
          '40%':      { transform: 'translateX(8px)' },
          '60%':      { transform: 'translateX(-5px)' },
          '80%':      { transform: 'translateX(5px)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpMobile: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
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
          '0%, 100%': { boxShadow: '0 0 10px rgba(79, 195, 247, 0.25)' },
          '50%':      { boxShadow: '0 0 32px rgba(79, 195, 247, 0.7)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        badgeUnlock: {
          '0%':   { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.15) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        underlineExpand: {
          '0%':   { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        numberPop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      borderRadius: {
        'qs':    '12px',
        'qs-lg': '20px',
      },
    },
  },
  plugins: [],
}
