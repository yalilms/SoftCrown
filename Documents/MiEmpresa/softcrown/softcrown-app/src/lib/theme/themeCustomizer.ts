// Theme Customizer Service
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  typography: TypographyConfig;
  layout: LayoutConfig;
  components: ComponentStyles;
  isDark: boolean;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface TypographyConfig {
  fontFamilies: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface LayoutConfig {
  maxWidth: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  container: {
    center: boolean;
    padding: string;
  };
}

export interface ComponentStyles {
  button: ButtonStyles;
  card: CardStyles;
  input: InputStyles;
  navigation: NavigationStyles;
}

export interface ButtonStyles {
  borderRadius: string;
  padding: {
    sm: string;
    md: string;
    lg: string;
  };
  variants: {
    primary: VariantStyle;
    secondary: VariantStyle;
    outline: VariantStyle;
  };
}

export interface VariantStyle {
  background: string;
  color: string;
  border: string;
  hover: {
    background: string;
    color: string;
  };
}

export interface CardStyles {
  background: string;
  border: string;
  borderRadius: string;
  padding: string;
  shadow: string;
}

export interface InputStyles {
  background: string;
  border: string;
  borderRadius: string;
  padding: string;
  focus: {
    border: string;
    outline: string;
  };
}

export interface NavigationStyles {
  background: string;
  border: string;
  height: string;
  link: {
    color: string;
    hover: {
      color: string;
      background: string;
    };
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
  category: 'modern' | 'classic' | 'minimal' | 'bold';
}

export class ThemeCustomizer {
  private currentTheme: ThemeConfig;
  private presets: Map<string, ThemePreset> = new Map();
  private customThemes: Map<string, ThemeConfig> = new Map();
  private previewMode: boolean = false;

  constructor() {
    this.currentTheme = this.getDefaultTheme();
    this.initializePresets();
    this.loadSavedThemes();
    this.applyTheme(this.currentTheme);
  }

  // Theme Management
  getCurrentTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  setTheme(themeId: string): void {
    const preset = this.presets.get(themeId);
    const customTheme = this.customThemes.get(themeId);
    
    if (preset) {
      this.currentTheme = { ...preset.config };
    } else if (customTheme) {
      this.currentTheme = { ...customTheme };
    } else {
      // console.warn(`Theme ${themeId} not found`);
      return;
    }

    this.applyTheme(this.currentTheme);
    this.saveCurrentTheme();
  }

  createCustomTheme(name: string, baseThemeId?: string): ThemeConfig {
    const baseTheme = baseThemeId 
      ? this.presets.get(baseThemeId)?.config || this.getDefaultTheme()
      : this.getDefaultTheme();

    const customTheme: ThemeConfig = {
      ...baseTheme,
      id: `custom-${Date.now()}`,
      name,
      description: `Tema personalizado basado en ${baseTheme.name}`,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customThemes.set(customTheme.id, customTheme);
    this.saveCustomThemes();
    
    return customTheme;
  }

  updateTheme(themeId: string, updates: Partial<ThemeConfig>): void {
    const theme = this.customThemes.get(themeId);
    if (!theme) return;

    const updatedTheme = {
      ...theme,
      ...updates,
      updatedAt: new Date(),
    };

    this.customThemes.set(themeId, updatedTheme);
    
    if (this.currentTheme.id === themeId) {
      this.currentTheme = updatedTheme;
      this.applyTheme(this.currentTheme);
    }

    this.saveCustomThemes();
  }

  // Preview Mode
  enablePreview(themeId: string): void {
    const preset = this.presets.get(themeId);
    const customTheme = this.customThemes.get(themeId);
    
    const previewTheme = preset?.config || customTheme;
    if (!previewTheme) return;

    this.previewMode = true;
    this.applyTheme(previewTheme);
  }

  disablePreview(): void {
    if (this.previewMode) {
      this.previewMode = false;
      this.applyTheme(this.currentTheme);
    }
  }

  // Color Customization
  updateColors(colors: Partial<ColorPalette>): void {
    if (this.currentTheme.isCustom) {
      this.updateTheme(this.currentTheme.id, {
        colors: { ...this.currentTheme.colors, ...colors }
      });
    }
  }

  generateColorScale(baseColor: string): ColorScale {
    return {
      50: this.lightenColor(baseColor, 0.95),
      100: this.lightenColor(baseColor, 0.9),
      200: this.lightenColor(baseColor, 0.8),
      300: this.lightenColor(baseColor, 0.6),
      400: this.lightenColor(baseColor, 0.4),
      500: baseColor,
      600: this.darkenColor(baseColor, 0.1),
      700: this.darkenColor(baseColor, 0.2),
      800: this.darkenColor(baseColor, 0.3),
      900: this.darkenColor(baseColor, 0.4),
    };
  }

  // Export/Import
  exportTheme(themeId: string): string {
    const theme = this.customThemes.get(themeId);
    if (!theme) throw new Error(`Theme ${themeId} not found`);
    return JSON.stringify(theme, null, 2);
  }

  importTheme(themeData: string, name?: string): ThemeConfig {
    try {
      const theme = JSON.parse(themeData) as ThemeConfig;
      const importedTheme: ThemeConfig = {
        ...theme,
        id: `imported-${Date.now()}`,
        name: name || `${theme.name} (Imported)`,
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.customThemes.set(importedTheme.id, importedTheme);
      this.saveCustomThemes();
      return importedTheme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error}`);
    }
  }

  // CSS Generation
  generateCSS(theme: ThemeConfig): string {
    const { colors, typography, components } = theme;

    return `
      :root {
        /* Colors */
        --color-primary-500: ${colors.primary[500]};
        --color-primary-600: ${colors.primary[600]};
        --color-primary-700: ${colors.primary[700]};
        --color-secondary-500: ${colors.secondary[500]};
        
        --color-background-primary: ${colors.background.primary};
        --color-background-secondary: ${colors.background.secondary};
        --color-text-primary: ${colors.text.primary};
        --color-text-secondary: ${colors.text.secondary};
        --color-border-primary: ${colors.border.primary};
        --color-border-focus: ${colors.border.focus};

        /* Typography */
        --font-sans: ${typography.fontFamilies.sans.join(', ')};
        --text-base: ${typography.fontSizes.base};
        --text-lg: ${typography.fontSizes.lg};
        --text-xl: ${typography.fontSizes.xl};
        --text-2xl: ${typography.fontSizes['2xl']};
      }

      /* Component Styles */
      .btn-primary {
        background-color: ${components.button.variants.primary.background};
        color: ${components.button.variants.primary.color};
        border-radius: ${components.button.borderRadius};
        padding: ${components.button.padding.md};
      }

      .btn-primary:hover {
        background-color: ${components.button.variants.primary.hover.background};
      }

      .card {
        background-color: ${components.card.background};
        border: ${components.card.border};
        border-radius: ${components.card.borderRadius};
        padding: ${components.card.padding};
        box-shadow: ${components.card.shadow};
      }

      .input {
        background-color: ${components.input.background};
        border: ${components.input.border};
        border-radius: ${components.input.borderRadius};
        padding: ${components.input.padding};
      }

      .input:focus {
        border: ${components.input.focus.border};
        outline: ${components.input.focus.outline};
      }
    `;
  }

  // Private Methods
  private applyTheme(theme: ThemeConfig): void {
    // Check if we're in the browser environment
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const css = this.generateCSS(theme);
    
    const existingStyle = document.getElementById('theme-styles');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'theme-styles';
    style.textContent = css;
    document.head.appendChild(style);

    document.body.classList.toggle('dark', theme.isDark);
    document.body.classList.toggle('light', !theme.isDark);

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  private initializePresets(): void {
    this.presets.set('default-light', {
      id: 'default-light',
      name: 'SoftCrown Light',
      description: 'Tema claro por defecto',
      category: 'modern',
      config: this.getDefaultTheme(),
    });

    this.presets.set('default-dark', {
      id: 'default-dark',
      name: 'SoftCrown Dark',
      description: 'Tema oscuro elegante',
      category: 'modern',
      config: this.getDarkTheme(),
    });
  }

  private getDefaultTheme(): ThemeConfig {
    return {
      id: 'default-light',
      name: 'SoftCrown Light',
      description: 'Tema por defecto',
      isDark: false,
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          tertiary: '#64748b',
        },
        border: {
          primary: '#e2e8f0',
          secondary: '#cbd5e1',
          focus: '#3b82f6',
        },
      },
      typography: {
        fontFamilies: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          serif: ['Georgia', 'serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        fontSizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        fontWeights: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      layout: {
        maxWidth: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
        container: {
          center: true,
          padding: '1rem',
        },
      },
      components: {
        button: {
          borderRadius: '0.5rem',
          padding: {
            sm: '0.5rem 1rem',
            md: '0.75rem 1.5rem',
            lg: '1rem 2rem',
          },
          variants: {
            primary: {
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              hover: {
                background: '#2563eb',
                color: '#ffffff',
              },
            },
            secondary: {
              background: '#64748b',
              color: '#ffffff',
              border: 'none',
              hover: {
                background: '#475569',
                color: '#ffffff',
              },
            },
            outline: {
              background: 'transparent',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              hover: {
                background: '#3b82f6',
                color: '#ffffff',
              },
            },
          },
        },
        card: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
        input: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          focus: {
            border: '1px solid #3b82f6',
            outline: '2px solid rgba(59, 130, 246, 0.1)',
          },
        },
        navigation: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          height: '4rem',
          link: {
            color: '#64748b',
            hover: {
              color: '#3b82f6',
              background: '#f1f5f9',
            },
          },
        },
      },
    };
  }

  private getDarkTheme(): ThemeConfig {
    const lightTheme = this.getDefaultTheme();
    return {
      ...lightTheme,
      id: 'default-dark',
      name: 'SoftCrown Dark',
      isDark: true,
      colors: {
        ...lightTheme.colors,
        background: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          tertiary: '#94a3b8',
        },
      },
      components: {
        ...lightTheme.components,
        card: {
          ...lightTheme.components.card,
          background: '#1e293b',
          border: '1px solid #334155',
        },
        input: {
          ...lightTheme.components.input,
          background: '#1e293b',
          border: '1px solid #334155',
        },
        navigation: {
          ...lightTheme.components.navigation,
          background: '#1e293b',
          border: '1px solid #334155',
        },
      },
    };
  }

  private lightenColor(color: string, amount: number): string {
    // Simplified color manipulation
    return color; // In real implementation, use proper color library
  }

  private darkenColor(color: string, amount: number): string {
    // Simplified color manipulation
    return color; // In real implementation, use proper color library
  }

  private saveCurrentTheme(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentTheme', JSON.stringify(this.currentTheme));
    }
  }

  private saveCustomThemes(): void {
    if (typeof window !== 'undefined') {
      const themes = Array.from(this.customThemes.values());
      localStorage.setItem('customThemes', JSON.stringify(themes));
    }
  }

  private loadSavedThemes(): void {
    if (typeof window !== 'undefined') {
      // Load current theme
      const savedTheme = localStorage.getItem('currentTheme');
      if (savedTheme) {
        try {
          this.currentTheme = JSON.parse(savedTheme);
        } catch (error) {
          // console.warn('Failed to load saved theme');
        }
      }

      // Load custom themes
      const savedCustomThemes = localStorage.getItem('customThemes');
      if (savedCustomThemes) {
        try {
          const themes = JSON.parse(savedCustomThemes) as ThemeConfig[];
          themes.forEach(theme => {
            this.customThemes.set(theme.id, theme);
          });
        } catch (error) {
          // console.warn('Failed to load custom themes');
        }
      }
    }
  }

  // Public getters
  getPresets(): ThemePreset[] {
    return Array.from(this.presets.values());
  }

  getCustomThemes(): ThemeConfig[] {
    return Array.from(this.customThemes.values());
  }
}

// Export singleton instance
export const themeCustomizer = new ThemeCustomizer();
