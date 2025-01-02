import type { Config } from 'tailwindcss';

import { MaterialThemeBuilder } from '@repo/utilities';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: new MaterialThemeBuilder().createTailwindColorVariables('light'),
      fontFamily: {
        sans: ['var(--font-roboto-flex)', 'sans'],
        serif: ['var(--font-roboto-serif)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
