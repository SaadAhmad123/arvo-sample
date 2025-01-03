import { MaterialThemeBuilder, type ThemeMode } from './MaterialThemeBuilder';

const DEFAULT_THEME_BUILDER = new MaterialThemeBuilder({ source: 'color', color: '#F1C40F' });
const DEFAULT_THEME_MODE: ThemeMode = 'light';
const DEFAULT_TAILWIND_THEME = DEFAULT_THEME_BUILDER.createTailwindVariables(DEFAULT_THEME_MODE);

export type { ThemeMode };

export { DEFAULT_THEME_BUILDER, DEFAULT_THEME_MODE, DEFAULT_TAILWIND_THEME, MaterialThemeBuilder };
