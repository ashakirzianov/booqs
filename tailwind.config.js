/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './reader/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        background: 'var(--theme-background)',
        action: 'var(--theme-action)',
        primary: 'var(--theme-primary)',
        dimmed: 'var(--theme-dimmed)',
        border: 'var(--theme-border)',
        highlight: 'var(--theme-highlight)',
        alert: 'var(--theme-alert)',
      },
      fontFamily: {
        main: ['var(--font-main)', 'sans-serif'],
        book: ['var(--font-book)', 'serif'],
      },
      fontWeight: {
        light: 100,
        normal: 300,
        bold: 400,
        extrabold: 700,
      },
      spacing: {
        xs: '0.125rem',
        sm: '0.25rem',
        base: '0.5rem',
        lg: '1rem',
        xl: '2rem',
        '2xl': '4rem',
        header: 'var(--header-height)',
        panel: 'var(--panel-width)',
      },
      boxShadow: {
        DEFAULT: '0px 0px 5px rgba(0, 0, 0, 0.1)',
        hover: '0px 5px 15px rgba(0,0,0,0.1)',
        button: '0px 3px 5px rgba(0,0,0,0.1)',
      }
    }
  },
  plugins: [],
}
