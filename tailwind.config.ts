import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981', // emerald
          hover: '#059669',
          light: '#34d399',
          dark: '#047857',
        },
        brand: {
          50: '#ecfdf5',
          500: '#10b981',
          900: '#064e3b',
        }
      },
    },
  },
  plugins: [],
}
export default config
