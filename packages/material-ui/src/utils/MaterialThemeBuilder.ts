import { type Theme, argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';

/** Represents the theme mode - either 'light' or 'dark' */
export type ThemeMode = 'light' | 'dark';

/** Configuration for creating a theme from a source color */
type ColorSource = {
  /** Indicates that the theme should be generated from a color */
  source: 'color';
  /** The hex color code to generate the theme from */
  color: string;
};

/** Configuration for creating a theme from an existing theme */
type ThemeSource = {
  /** Indicates that the theme should be created from an existing theme */
  source: 'theme';
  /** The existing Material Design theme to use */
  theme: Theme;
};

/**
 * A builder class for creating Material Design 3 themes with color tokens.
 * Supports generation of CSS variables and Tailwind color configurations.
 *
 * @example
 * ```typescript
 * // Create a theme from a color
 * const builder = new MaterialThemeBuilder({ source: 'color', color: '#FF0000' });
 *
 * // Get CSS variables for dark mode
 * const darkTheme = builder.createThemeCssVariables('dark');
 * ```
 */
export class MaterialThemeBuilder {
  /** The generated Material Design theme */
  readonly theme: Theme;

  /**
   * Creates a new MaterialThemeBuilder instance
   *
   * @param source - Optional configuration to create the theme from a color or existing theme
   * If not provided, defaults to creating a theme from the color '#2764CA'
   */
  constructor(source?: ColorSource | ThemeSource) {
    if (source?.source === 'color') {
      this.theme = themeFromSourceColor(argbFromHex(source.color), []);
      return;
    }
    if (source?.source === 'theme') {
      this.theme = source.theme;
      return;
    }
    this.theme = themeFromSourceColor(argbFromHex('#2764CA'), []);
  }

  /**
   * Generates a complete set of Material Design color tokens for the specified theme mode
   *
   * @param mode - The theme mode ('light' or 'dark') to generate colors for
   * @returns An object mapping color token names to their hex values
   * @private
   */
  private createThemeColorTokens(mode: ThemeMode) {
    const neutral = this.theme.palettes.neutral;
    const themeColors = {
      primary: this.theme.schemes[mode].primary,
      'on-primary': this.theme.schemes[mode].onPrimary,
      'primary-container': this.theme.schemes[mode].primaryContainer,
      'on-primary-container': this.theme.schemes[mode].onPrimaryContainer,
      secondary: this.theme.schemes[mode].secondary,
      'on-secondary': this.theme.schemes[mode].onSecondary,
      'secondary-container': this.theme.schemes[mode].secondaryContainer,
      'on-secondary-container': this.theme.schemes[mode].onSecondaryContainer,
      tertiary: this.theme.schemes[mode].tertiary,
      'on-tertiary': this.theme.schemes[mode].onTertiary,
      'tertiary-container': this.theme.schemes[mode].tertiaryContainer,
      'on-tertiary-container': this.theme.schemes[mode].onTertiaryContainer,
      error: this.theme.schemes[mode].error,
      'on-error': this.theme.schemes[mode].onError,
      'error-container': this.theme.schemes[mode].errorContainer,
      'on-error-container': this.theme.schemes[mode].onErrorContainer,
      background: this.theme.schemes[mode].background,
      'on-background': this.theme.schemes[mode].onBackground,
      surface: this.theme.schemes[mode].surface,
      'on-surface': this.theme.schemes[mode].onSurface,
      'surface-variant': this.theme.schemes[mode].surfaceVariant,
      'on-surface-variant': this.theme.schemes[mode].onSurfaceVariant,
      outline: this.theme.schemes[mode].outline,
      'outline-variant': this.theme.schemes[mode].outlineVariant,
      shadow: this.theme.schemes[mode].shadow,
      scrim: this.theme.schemes[mode].scrim,
      'inverse-surface': this.theme.schemes[mode].inverseSurface,
      'inverse-on-surface': this.theme.schemes[mode].inverseOnSurface,
      'inverse-primary': this.theme.schemes[mode].inversePrimary,
      'surface-dim': mode === 'dark' ? neutral.tone(6) : neutral.tone(87),
      'surface-bright': mode === 'dark' ? neutral.tone(24) : neutral.tone(98),
      'surface-container-lowest': mode === 'dark' ? neutral.tone(4) : neutral.tone(100),
      'surface-container-low': mode === 'dark' ? neutral.tone(10) : neutral.tone(96),
      'surface-container': mode === 'dark' ? neutral.tone(12) : neutral.tone(94),
      'surface-container-high': mode === 'dark' ? neutral.tone(17) : neutral.tone(92),
      'surface-container-highest': mode === 'dark' ? neutral.tone(24) : neutral.tone(90),
    };
    return Object.fromEntries(Object.entries(themeColors).map(([key, value]) => [key, hexFromArgb(value)]));
  }

  /**
   * Generates shadow tokens based on the theme's primary color and mode
   *
   * @param mode - The theme mode ('light' or 'dark') to generate shadows for
   * @returns An object mapping shadow token names to their CSS values
   * @private
   */
  private createThemeShadowTokens(mode: ThemeMode) {
    const primaryColor = this.theme.schemes[mode].primary;
    // Forcingf to dark - Will visit later for more theming
    const r = (primaryColor >> 16) & (255 * 0);
    const g = (primaryColor >> 8) & (255 * 0);
    const b = primaryColor & (255 * 0);

    // Get shadow opacity from theme's shadow token
    const shadowToken = this.theme.schemes[mode].shadow;
    const shadowOpacity = ((shadowToken >> 24) & 255) / 255;

    // MD3 shadow opacity values
    const keyUmbra = mode === 'light' ? 0.2 : 0.3; // Main shadow
    const keyPenumbra = mode === 'light' ? 0.14 : 0.24; // Soft edge shadow
    const ambient = mode === 'light' ? 0.12 : 0.22; // Ambient shadow

    // Adjust opacities based on theme's shadow token
    const adjustedUmbra = keyUmbra * shadowOpacity;
    const adjustedPenumbra = keyPenumbra * shadowOpacity;
    const adjustedAmbient = ambient * shadowOpacity;

    return {
      'shadow-color': `${r}, ${g}, ${b}`,
      'shadow-opacity': shadowOpacity.toString(),
      'elevation-5': `0px 8px 10px -5px rgba(${r}, ${g}, ${b}, ${adjustedUmbra}),
                     0px 16px 24px 2px rgba(${r}, ${g}, ${b}, ${adjustedPenumbra}),
                     0px 6px 30px 5px rgba(${r}, ${g}, ${b}, ${adjustedAmbient})`,
      'elevation-4': `0px 5px 5px -3px rgba(${r}, ${g}, ${b}, ${adjustedUmbra}),
                     0px 8px 10px 1px rgba(${r}, ${g}, ${b}, ${adjustedPenumbra}),
                     0px 3px 14px 2px rgba(${r}, ${g}, ${b}, ${adjustedAmbient})`,
      'elevation-3': `0px 5px 5px -3px rgba(${r}, ${g}, ${b}, ${adjustedUmbra}),
                     0px 8px 10px 1px rgba(${r}, ${g}, ${b}, ${adjustedPenumbra}),
                     0px 3px 14px 2px rgba(${r}, ${g}, ${b}, ${adjustedAmbient})`,
      'elevation-2': `0px 2px 4px -1px rgba(${r}, ${g}, ${b}, ${adjustedUmbra}),
                     0px 4px 5px 0px rgba(${r}, ${g}, ${b}, ${adjustedPenumbra}),
                     0px 1px 10px 0px rgba(${r}, ${g}, ${b}, ${adjustedAmbient})`,
      'elevation-1': `0px 3px 1px -2px rgba(${r}, ${g}, ${b}, ${adjustedUmbra}),
                     0px 2px 2px 0px rgba(${r}, ${g}, ${b}, ${adjustedPenumbra}),
                     0px 1px 5px 0px rgba(${r}, ${g}, ${b}, ${adjustedAmbient})`,
    };
  }

  /**
   * Creates a Tailwind-compatible color configuration using CSS variables with fallback values
   *
   * @param defaultMode - The theme mode to use for fallback values (defaults to 'light')
   * @returns An object mapping color names to CSS variable references with fallbacks
   *
   * @example
   * ```typescript
   * const tailwindConfig = builder.createTailwindColorVariables('dark');
   * // Returns: { primary: 'var(--primary, #hexcolor)', ... }
   * ```
   */
  createTailwindVariables(defaultMode: ThemeMode = 'light') {
    const themeColors = this.createThemeColorTokens(defaultMode);
    const shadowTokens = this.createThemeShadowTokens(defaultMode);

    return {
      colors: Object.fromEntries(Object.entries(themeColors).map(([key, value]) => [key, `var(--${key}, ${value})`])),
      boxShadow: Object.fromEntries(
        Object.entries(shadowTokens).map(([key, value]) => [key, `var(--${key}, ${value})`]),
      ),
    };
  }

  /**
   * Creates CSS custom properties (variables) for all theme colors and shadows
   *
   * @param mode - The theme mode to generate variables for
   * @returns An object mapping CSS variable names to their values
   *
   * @example
   * ```typescript
   * const cssVars = builder.createThemeCssVariables('light');
   * // Returns: { '--primary': '#hexcolor', '--elevation-1': 'shadow-value', ... }
   * ```
   */
  createThemeCssVariables(mode: ThemeMode) {
    const themeColors = this.createThemeColorTokens(mode);
    const shadowTokens = this.createThemeShadowTokens(mode);

    return {
      ...Object.fromEntries(Object.entries(themeColors).map(([key, value]) => [`--${key}`, value])),
      ...Object.fromEntries(Object.entries(shadowTokens).map(([key, value]) => [`--${key}`, value])),
    };
  }
}
