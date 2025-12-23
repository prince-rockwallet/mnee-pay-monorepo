import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createUserSlice } from './slices/userInfoSlice';
import { createConfigSlice } from './slices/configSlice';
import { createWalletSlice } from './slices/walletSlice';
import { createCheckoutSlice } from './slices/checkoutSlice';
import { createCartSlice } from './slices/cartSlice';
import { StoreState } from './types';

export const useStore = create<StoreState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
        ...createConfigSlice(...a),
        ...createWalletSlice(...a),
        ...createCheckoutSlice(...a),
        ...createCartSlice(...a),
      })),
      {
        name: 'mnee-checkout-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          user: state.user,
          wallet: { 
            address: state.wallet.address, 
            provider: state.wallet.provider,
            isConnected: state.wallet.isConnected 
          },
          cart: state.cart
        }),
      }
    ),
    { 
      name: 'MneeCheckoutStore',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

export const useUser = () => {
  return useStore(useShallow((state) => ({
    ...state.user,
    ...state.userActions
  })));
};

export const useConfig = () => {
  return useStore(useShallow((state) => ({
    ...state.config,
    ...state.configActions
  })));
};

export const useWallet = () => {
  return useStore(useShallow((state) => ({
    ...state.wallet,
    ...state.walletActions
  })));
};

export const useCheckout = () => {
  return useStore(useShallow((state) => ({
    ...state.checkout,
    ...state.checkoutActions
  })));
};

export const useCart = () => {
  return useStore(useShallow((state) => ({
    ...state.cart,
    ...state.cartActions
  })));
};