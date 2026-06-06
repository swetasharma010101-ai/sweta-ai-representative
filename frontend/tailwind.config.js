/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink:   '#0d0d0d',
        paper: '#f5f2ee',
        accent:'#c8452d',
        muted: '#8a8078',
        border:'#e2ddd8',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'blink':     'blink 1s step-end infinite',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        blink:    { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        pulseDot: { '0%,100%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.4)', opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}
