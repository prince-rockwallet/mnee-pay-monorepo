import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createUserSlice, UserSlice } from './slices/userInfoSlice';
import { ConfigSlice, createConfigSlice } from './slices/configSlice';

type StoreState = UserSlice & ConfigSlice; 

export const useStore = create<StoreState>()(
  devtools(
    immer(
      persist(
        (...a) => ({
          ...createUserSlice(...a),
          ...createConfigSlice(...a),
        }),
        {
          name: 'mnee-checkout-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({ user: state.user }),
        }
      )
    ),
    { 
      name: 'MneeCheckoutStore',
      enabled: import.meta.env.DEV
    }
  )
);

export const useUser = () => {
  return useStore(useShallow((state) => state.user));
};

export const useConfig = () => {
  return useStore(useShallow((state) => state.config));
};

export const useResolvedTheme = () => {
  return useStore(useShallow((state) => state.config.resolvedTheme));
};