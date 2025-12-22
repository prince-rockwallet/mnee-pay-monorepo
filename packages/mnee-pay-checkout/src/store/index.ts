import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { createUserSlice, UserSlice } from './slices/userInfoSlice';

type StoreState = UserSlice; 

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createUserSlice(...a),
        // ...createCartSlice(...a), // Future slices go here
      }),
      {
        name: 'mnee-checkout-storage',
        storage: createJSONStorage(() => localStorage),
        // partialize: (state) => ({ user: { userInfo: state.user.userInfo } }), 
      }
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