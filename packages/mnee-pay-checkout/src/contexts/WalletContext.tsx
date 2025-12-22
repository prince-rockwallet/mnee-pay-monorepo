import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useYoursWallet } from 'yours-wallet-provider';
import { WalletProvider as WalletProviderType } from '../types';

// ============================================================================
// Types
// ============================================================================

interface WalletBalance {
  formatted: string;
  value: bigint | number;
  currency: string;
}

interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
  provider?: WalletProviderType;

  // Wallet-specific data
  balance?: WalletBalance;

  // RainbowKit specific (Web3)
  chainId?: number;

  // Yours Wallet specific (BSV)
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
}

interface WalletContextValue extends WalletState {
  // Connection methods
  connectRainbowKit: () => Promise<void>;
  connectYours: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchWallet: (provider: WalletProviderType) => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
  });

  // RainbowKit/Wagmi hooks
  const { address: web3Address, isConnected: web3Connected, chainId } = useAccount();
  const { disconnect: disconnectWeb3 } = useDisconnect();

  // Yours Wallet hook
  const yoursWallet = useYoursWallet();

  // ============================================================================
  // Sync Web3 wallet state
  // ============================================================================

  useEffect(() => {
    if (web3Connected && web3Address) {
      setState(prev => ({
        ...prev,
        isConnected: true,
        address: web3Address,
        provider: 'rainbowkit',
        chainId,
      }));
    } else if (!web3Connected && state.provider === 'rainbowkit') {
      // Clear state when EVM wallet disconnects
      setState({
        isConnected: false,
        isConnecting: false,
      });
    }
  }, [web3Connected, web3Address, chainId, state.provider]);

  // ============================================================================
  // Sync Yours wallet state
  // ============================================================================

  useEffect(() => {
    const checkYoursConnection = async () => {
      if (yoursWallet?.isConnected) {
        const connected = await yoursWallet.isConnected();
        if (connected) {
          const addresses = await yoursWallet.getAddresses();
          const pubKeys = await yoursWallet.getPubKeys();
          const balance = await yoursWallet.getBalance();

          setState(prev => ({
            ...prev,
            isConnected: true,
            address: addresses?.bsvAddress,
            provider: 'yours',
            yoursAddress: addresses,
            yoursPubKeys: pubKeys,
            balance: balance ? {
              formatted: balance.bsv.toString(),
              value: balance.satoshis,
              currency: 'BSV',
            } : undefined,
          }));
        }
      }
    };

    checkYoursConnection();
  }, [yoursWallet]);

  // ============================================================================
  // Yours Wallet event listeners
  // ============================================================================

  useEffect(() => {
    if (!yoursWallet?.on) return;

    const handleSignedOut = async () => {
      if (state.provider === 'yours') {
        setState({
          isConnected: false,
          isConnecting: false,
        });
      }
    };

    const handleSwitchAccount = async () => {
      if (state.provider === 'yours') {
        // Reload wallet data
        const addresses = await yoursWallet.getAddresses();
        const pubKeys = await yoursWallet.getPubKeys();
        const balance = await yoursWallet.getBalance();

        setState(prev => ({
          ...prev,
          address: addresses?.bsvAddress,
          yoursAddress: addresses,
          yoursPubKeys: pubKeys,
          balance: balance ? {
            formatted: balance.bsv.toString(),
            value: balance.satoshis,
            currency: 'BSV',
          } : undefined,
        }));
      }
    };

    yoursWallet.on('signedOut', handleSignedOut);
    yoursWallet.on('switchAccount', handleSwitchAccount);

    return () => {
      yoursWallet.removeListener('signedOut', handleSignedOut);
      yoursWallet.removeListener('switchAccount', handleSwitchAccount);
    };
  }, [yoursWallet, state.provider]);

  // ============================================================================
  // Connection methods
  // ============================================================================

  const connectRainbowKit = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true }));
    try {
      // RainbowKit connection is handled by the ConnectButton component
      // This method is here for consistency but actual connection happens via UI
    } catch (error) {
      console.error('RainbowKit connection error:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  }, []);

  const connectYours = useCallback(async () => {
    if (!yoursWallet) {
      throw new Error('Yours Wallet not available. Please install the Yours Wallet extension.');
    }

    setState(prev => ({ ...prev, isConnecting: true }));
    try {
      const identityPubKey = await yoursWallet.connect();

      if (identityPubKey) {
        const addresses = await yoursWallet.getAddresses();
        const pubKeys = await yoursWallet.getPubKeys();
        const balance = await yoursWallet.getBalance();

        setState({
          isConnected: true,
          isConnecting: false,
          address: addresses?.bsvAddress,
          provider: 'yours',
          yoursAddress: addresses,
          yoursPubKeys: pubKeys,
          balance: balance ? {
            formatted: balance.bsv.toString(),
            value: balance.satoshis,
            currency: 'BSV',
          } : undefined,
        });
      } else {
        throw new Error('Failed to connect to Yours Wallet');
      }
    } catch (error) {
      console.error('Yours Wallet connection error:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  }, [yoursWallet]);

  const disconnect = useCallback(async () => {
    try {
      if (state.provider === 'rainbowkit' && disconnectWeb3) {
        disconnectWeb3();
      } else if (state.provider === 'yours' && yoursWallet) {
        await yoursWallet.disconnect();
      }

      setState({
        isConnected: false,
        isConnecting: false,
        address: undefined,
        provider: undefined,
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }, [state.provider, disconnectWeb3, yoursWallet]);

  const switchWallet = useCallback(async (provider: WalletProviderType) => {
    // First disconnect current wallet
    await disconnect();

    // Then connect to new wallet
    if (provider === 'rainbowkit' || provider === 'walletconnect') {
      await connectRainbowKit();
    } else if (provider === 'yours') {
      await connectYours();
    }
  }, [disconnect, connectRainbowKit, connectYours]);

  // ============================================================================
  // Context value
  // ============================================================================

  const value: WalletContextValue = {
    ...state,
    connectRainbowKit,
    connectYours,
    disconnect,
    switchWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
