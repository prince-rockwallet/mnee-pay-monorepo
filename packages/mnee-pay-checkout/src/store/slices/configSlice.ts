import { StateCreator } from 'zustand';
import { Theme, MneeCheckoutProps } from '../../types';
import { ButtonConfig, fetchButtonConfig } from '../../lib/api';

export interface ConfigState {
  buttonConfig: ButtonConfig | null;
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  apiBaseUrl: string;
}

export interface ConfigSlice {
  config: ConfigState & {
    setTheme: (theme: Theme) => void;
    updateResolvedTheme: () => void;
    initializeConfig: (props: MneeCheckoutProps) => Promise<void>;
    resetConfig: () => void;
  };
}

const initialConfigState: ConfigState = {
  buttonConfig: null,
  theme: 'light',
  resolvedTheme: 'light',
  isLoading: true,
  error: null,
  apiBaseUrl: '',
};

export const createConfigSlice: StateCreator<ConfigSlice> = (set, get) => ({
  config: {
    ...initialConfigState,

    setTheme: (theme) => {
      set((state) => ({
        config: { ...state.config, theme },
      }));
      get().config.updateResolvedTheme();
    },

    updateResolvedTheme: () => {
      const { theme } = get().config;
      if (theme === 'auto') {
        const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        set((state) => ({
          config: { ...state.config, resolvedTheme: isDark ? 'dark' : 'light' },
        }));
      } else {
        set((state) => ({
          config: { ...state.config, resolvedTheme: theme as 'light' | 'dark' },
        }));
      }
    },

    initializeConfig: async (props) => {
      const { buttonId, apiBaseUrl = '', config: configOverride, theme = 'light', showConfetti, styling } = props;

      set((state) => ({
        config: { 
          ...state.config, 
          isLoading: true, 
          error: null, 
          apiBaseUrl, 
          theme
        },
      }));

      get().config.updateResolvedTheme();

      if (configOverride) {
        const mockConfig: ButtonConfig = {
          id: buttonId || 'preview',
          ...configOverride,
          buttonText: configOverride.buttonText ?? 'Pay with MNEE',
          theme: theme,
          showConfetti,
          borderRadius: styling?.borderRadius,
          buttonSize: styling?.buttonSize,
          primaryColor: configOverride.primaryColor || styling?.primaryColor,
          accentColor: styling?.accentColor,
          buttonColor: styling?.buttonColor,
          buttonTextColor: styling?.buttonTextColor,
          fontFamily: styling?.fontFamily,
          customCSS: styling?.customCSS,
        } as ButtonConfig;

        set((state) => ({
          config: { ...state.config, buttonConfig: mockConfig, isLoading: false },
        }));
        return;
      }

      if (!buttonId) {
        set((state) => ({
          config: { ...state.config, error: 'Button ID or configuration is required', isLoading: false },
        }));
        return;
      }

      try {
        const config = await fetchButtonConfig(apiBaseUrl, buttonId);
        set((state) => ({
          config: { ...state.config, buttonConfig: config, isLoading: false },
        }));
      } catch (err: any) {
        set((state) => ({
          config: { ...state.config, error: err.message || 'Failed to load configuration', isLoading: false },
        }));
      }
    },

    resetConfig: () => set((state) => ({ config: { ...state.config, ...initialConfigState } })),
  },
});