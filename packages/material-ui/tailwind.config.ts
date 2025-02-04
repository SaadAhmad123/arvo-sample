import type { Config } from 'tailwindcss';
import * as Utils from './src/utils/index';

const config: Config = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      colors: Utils.DEFAULT_TAILWIND_THEME.colors,
      boxShadow: Utils.DEFAULT_TAILWIND_THEME.boxShadow,
      screens: {
        '2xl': '1760px',
      },
    },
  },
  plugins: [],
};

export default config;
