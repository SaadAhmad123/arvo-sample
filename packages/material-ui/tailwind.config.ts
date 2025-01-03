import type { Config } from 'tailwindcss';
import * as Utils from './src/utils/index';

const config: Config = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      colors: Utils.DEFAULT_TAILWIND_THEME.colors,
      boxShadow: Utils.DEFAULT_TAILWIND_THEME.boxShadow,
    },
  },
  plugins: [],
};

export default config;
