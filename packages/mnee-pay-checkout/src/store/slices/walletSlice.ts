import { StateCreator } from 'zustand';
import { WalletState, StoreState, WalletSlice } from '../types';

let wagmiDisconnectFn: (() => void) | null = null;

const initialWalletState: WalletState = {
  isConnected: false,
  isConnecting: false,
  isModalOpen: false,
  address: undefined,
  provider: undefined,
  chainId: undefined,
  yoursAddress: undefined,
  yoursPubKeys: undefined,
  balance: undefined,
};

export const createWalletSlice: StateCreator<
  StoreState,
  [["zustand/immer", never], ["zustand/devtools", never]],
  [],
  WalletSlice
> = (set, get) => ({
  wallet: initialWalletState,

  walletActions: {
    registerWagmiDisconnect: (fn) => {
      wagmiDisconnectFn = fn;
    },

    setModalOpen: (isOpen) => {
      set((state) => {
        state.wallet.isModalOpen = isOpen;
      });
    },

    setConnecting: (isConnecting) => {
      set((state) => {
        state.wallet.isConnecting = isConnecting;
      });
    },

    syncWeb3State: (data) => {
      set((state) => {
        Object.assign(state.wallet, data);
        
        if (data.isConnected && !state.wallet.provider) {
          state.wallet.provider = 'rainbowkit';
        }
      });
    },

    syncYoursState: (data) => {
      set((state) => {
        Object.assign(state.wallet, data);
      });
    },

    resetWallet: () => {
      set((state) => {
        const currentModalState = state.wallet.isModalOpen;
        state.wallet = { ...initialWalletState, isModalOpen: currentModalState };
      });
    },

    connectYours: async () => {
      const yours = (window as any).yours;
      if (!yours) throw new Error('Yours Wallet not found');

      get().walletActions.setConnecting(true);

      try {
        const identityPubKey = await yours.connect();
        if (identityPubKey) {
          const addresses = await yours.getAddresses();
          const pubKeys = await yours.getPubKeys();
          const balance = await yours.getBalance();

          set((state) => {
            state.wallet.isConnected = true;
            state.wallet.isConnecting = false;
            state.wallet.provider = 'yours';
            state.wallet.address = addresses?.bsvAddress;
            state.wallet.yoursAddress = addresses;
            state.wallet.yoursPubKeys = pubKeys;
            state.wallet.balance = balance ? {
              formatted: balance.bsv.toString(),
              value: balance.satoshis,
              currency: 'BSV',
            } : undefined;
            state.wallet.isModalOpen = false;
          });
        }
      } catch (error) {
        console.error('Yours Wallet connection error:', error);
        set((state) => { state.wallet.isConnecting = false; });
        throw error;
      }
    },

    disconnect: async () => {
      const { provider } = get().wallet;

      try {
        if (provider === 'rainbowkit' || provider === 'walletconnect') {
          if (wagmiDisconnectFn) {
            wagmiDisconnectFn();
          } else {
            console.warn("Wagmi disconnect function not registered yet");
          }
        } else if (provider === 'yours') {
          const yours = (window as any).yours;
          if (yours) await yours.disconnect();
        }

        get().walletActions.resetWallet();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    },

    switchWallet: async (newProvider) => {
      const { disconnect, connectYours, setModalOpen } = get().walletActions;

      await disconnect();

      setTimeout(async () => {
        if (newProvider === 'yours') {
          await connectYours();
        } else {
          setModalOpen(true);
        }
      }, 100);
    },
  },
});