/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:           '#DCCBBE',
        panel:         '#E8DACF',
        surface:       '#F3EBE4',
        'surface-raised': '#FFFFFF',
        amber: {
          DEFAULT: '#75563F',
          light:   '#8f6e54',
          dark:    '#573d2a',
        },
        sienna:    '#9c6441',
        cognac:    '#b58462',
        cream:     '#2a1e16',
        parchment: '#4c3727',
        linen:     '#3a281c',
        fog:       '#75563F',
        mist:      '#75563F',
        danger:    '#c0442a',
        success:   '#5c9e6e',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        'micro':  ['11px', { lineHeight: '1.4',  letterSpacing: '0.02em' }],
        'label':  ['13px', { lineHeight: '1.5' }],
        'body':   ['14px', { lineHeight: '1.6' }],
        'body-lg':['15px', { lineHeight: '1.65' }],
        'sub':    ['18px', { lineHeight: '1.4' }],
        'h3':     ['24px', { lineHeight: '1.3' }],
        'h2':     ['36px', { lineHeight: '1.2' }],
        'hero':   ['52px', { lineHeight: '1.1' }],
      },
      borderRadius: {
        'sm':   '6px',
        'md':   '10px',
        'lg':   '16px',
        'xl':   '22px',
        'pill': '9999px',
      },
      boxShadow: {
        'amber':      '0 0 20px rgba(200, 146, 58, 0.25)',
        'amber-lg':   '0 0 40px rgba(200, 146, 58, 0.2)',
        'panel':      '0 8px 32px rgba(0, 0, 0, 0.4)',
        'panel-lg':   '0 16px 64px rgba(0, 0, 0, 0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(210, 175, 120, 0.08)',
      },
      animation: {
        'fade-up':       'fadeSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'tab-enter':     'tabEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-amber':   'amberPulse 2s ease-out infinite',
        'pulse-danger':  'dangerPulse 2s ease-out infinite',
        'glow':          'glowPulse 2.5s ease-in-out infinite',
        'shimmer':       'shimmer 2.5s linear infinite',
        'spin-slow':     'spin 8s linear infinite',
        'cursor-blink':  'cursorBlink 0.8s step-end infinite',
      },
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      width: {
        'sidebar': '280px',
        'sidebar-sm': '240px',
      },
      height: {
        'navbar': '56px',
      },
      zIndex: {
        'navbar':  '100',
        'sidebar': '90',
        'drawer':  '95',
        'tooltip': '200',
        'overlay': '50',
      },
    },
  },
  plugins: [],
};