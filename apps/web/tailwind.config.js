/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        'background-alt': '#FAF9F6',
        primary: {
          DEFAULT: '#1C1C1C',
          light: '#2D2D2D',
        },
        secondary: '#737373',
        border: '#EAEAEA',
        accent: {
          DEFAULT: '#9E1B22',
          hover: '#801419',
          light: '#FBF0F1',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '14px',
        xl: '18px',
      },
    },
  },
  plugins: [],
};
