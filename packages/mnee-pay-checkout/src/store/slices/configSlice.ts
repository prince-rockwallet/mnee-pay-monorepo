import { StateCreator } from 'zustand';
import { ButtonConfig, fetchButtonConfig } from '../../lib/api';
import { ConfigSlice, ConfigState, StoreState } from '../types';
import { Theme } from '../../types';

const initialConfigState: ConfigState = {
  buttonConfig: null,
  styling: null,
  theme: 'light',
  resolvedTheme: 'light',
  isLoading: true,
  error: null,
  apiBaseUrl: '',
};

export const createConfigSlice: StateCreator<
  StoreState, 
  [["zustand/immer", never], ["zustand/devtools", never]], 
  [], 
  ConfigSlice
> = (set, get) => ({
  config: initialConfigState,

  configActions: {

    setTheme: (theme) => {
      set((state) => {
        state.config.theme = theme;
      });
      get().configActions.updateResolvedTheme();
    },

    updateResolvedTheme: () => {
      const { theme } = get().config;
      let resolved: 'light' | 'dark' = 'light';

      if (theme === 'auto') {
        resolved = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light';
      } else {
        resolved = theme as 'light' | 'dark';
      }

      set((state) => {
        state.config.resolvedTheme = resolved;
      });
    },

    initializeConfig: async (props) => {
      const { buttonId, apiBaseUrl = '', config: configOverride, theme = 'light', showConfetti, styling } = props;

      set((state) => {
        state.config.isLoading = true;
        state.config.error = null;
        state.config.apiBaseUrl = apiBaseUrl;
        state.config.styling = styling || null;
      });

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

        set((state) => {
          state.config.buttonConfig = mockConfig;
          state.config.isLoading = false;
          state.config.theme = theme;
        });

        get().configActions.updateResolvedTheme();
        return;
      }

      if (!buttonId) {
        set((state) => {
          state.config.error = 'Button ID or configuration is required';
          state.config.isLoading = false;
          state.config.theme = theme;
        });

        get().configActions.updateResolvedTheme();
        return;
      }

      try {
        const config = await fetchButtonConfig(apiBaseUrl, buttonId);
        set((state) => {
          state.config.buttonConfig = config;
          state.config.isLoading = false;
          state.config.theme = config.theme as Theme || theme;
        });
      } catch (err: any) {
        set((state) => {
          state.config.error = err.message || 'Failed to load configuration';
          state.config.isLoading = false;
        });
      } finally {
        get().configActions.updateResolvedTheme();
      }
    },

    resetConfig: () => set((state) => {
      state.config = { ...state.config, ...initialConfigState };
    }),
  },
});