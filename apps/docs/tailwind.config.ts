import { Utils } from '@repo/material-ui';
import type { Config } from 'tailwindcss';

const defaultThemeBuilder = new Utils.MaterialThemeBuilder({ source: 'color', color: '#968f76' });
const defaultMode: Utils.ThemeMode = 'light';
const defaultTheme = defaultThemeBuilder.createTailwindVariables(defaultMode);

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: defaultTheme.colors,
      boxShadow: defaultTheme.boxShadow,
      fontFamily: {
        sans: ['var(--font-roboto-flex)', 'sans'],
        serif: ['var(--font-roboto-serif)', 'sans-serif'],
      },
      screens: {
        '2xl': '1760px',
      },
    },
  },
  plugins: [],
};

export default config;
