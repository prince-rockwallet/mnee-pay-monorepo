import { WalletProviderType } from "..";
import { ButtonConfig } from "../lib/api";
import { ContactInfo, MneeCheckoutProps, ShippingAddress, Theme } from "../types";

export interface UserInfo {
  shipping?: ShippingAddress;
  contact: ContactInfo;
}

export interface UserSlice {
  user: {
    userInfo: UserInfo;
    setEmail: (email?: string) => void;
    setPhone: (phone?: string) => void;
    setShipping: (shipping: ShippingAddress) => void;
    setContact: (contact: ContactInfo) => void;
    clearUserInfo: () => void;
  };
}

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

export interface WalletBalance {
  formatted: string;
  value: bigint | number;
  currency: string;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  address?: string;
  provider?: WalletProviderType;
  
  chainId?: number;

  yoursAddress?: {
    bsvAddress?: string;
    ordAddress?: string;
    identityAddress?: string;
  };

  yoursPubKeys?: {
    bsvPubKey?: string;
    ordPubKey?: string;
    identityPubKey?: string;
  };

  balance?: WalletBalance;
}

export interface WalletActions {
  connectYours: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchWallet: (provider: WalletProviderType) => Promise<void>;
  setModalOpen: (isOpen: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  syncWeb3State: (data: Partial<WalletState>) => void;
  syncYoursState: (data: Partial<WalletState>) => void;
  resetWallet: () => void;
  registerWagmiDisconnect: (fn: () => void) => void;
}

export interface WalletSlice {
  wallet: WalletState;
  walletActions: WalletActions;
}

export type StoreState = UserSlice & ConfigSlice & WalletSlice; 