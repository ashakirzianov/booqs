/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      background: 'white',
      action: '#F57F17',
      primary: 'black',
      dimmed: '#867b6c',
      border: '#ddd',
      highlight: 'orange',
      dark: {
        background: 'black',
        action: '#867b6c',
        primary: '#999',
        dimmed: '#888',
        border: '#333',
        highlight: 'white',
      },
    },
    fontFamily: {
      main: ['var(--font-main)', 'sans-serif'],
      book: ['var(--font-book)', 'serif'],
    },
    fontWeight: {
      normal: 300,
      bold: 400,
      extrabold: 700,
    },
  },
  plugins: [],
}
