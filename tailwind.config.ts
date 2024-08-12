import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        grey: '#D4D5DD',
        grey10: '#28282C',
        grey5: '#1E1E21',
        yellow: '#E7C057',
        dark: '#141417',
        black: '#0D0D0E',
        white5: '#202023',
        white10: '#2C2C2F',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        paralucent: ['var(--font-paralucent)'],
        poppins: [`var(--font-poppins)`],
        spaceMono: [`var(--font-spaceMono)`],
      },
      transitionTimingFunction: {
        butter: 'cubic-bezier(0.65, 0, 0.15, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
