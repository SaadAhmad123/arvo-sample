import type { Config } from 'tailwindcss';
import { MaterialThemeBuilder } from '@repo/utilities';

const themeBuilder = new MaterialThemeBuilder({ source: 'color', color: '#F1C40F' });
const tailwindVars = themeBuilder.createTailwindVariables('light');

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: tailwindVars.colors,
      boxShadow: tailwindVars.boxShadow,
      fontFamily: {
        sans: ['var(--font-roboto-flex)', 'sans'],
        serif: ['var(--font-roboto-serif)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
