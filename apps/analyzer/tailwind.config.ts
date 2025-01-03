import type { Config } from 'tailwindcss';
import { Utils } from '@repo/material-ui';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: Utils.DEFAULT_TAILWIND_THEME.colors,
      boxShadow: Utils.DEFAULT_TAILWIND_THEME.boxShadow,
      fontFamily: {
        sans: ['var(--font-roboto-flex)', 'sans'],
        serif: ['var(--font-roboto-serif)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
