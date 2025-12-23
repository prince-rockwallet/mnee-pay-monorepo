import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useYoursWallet } from 'yours-wallet-provider';
import { useStore } from '../store'; 

export function useWalletSync() {
  const { address: web3Address, isConnected: web3Connected, chainId } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const yoursWallet = useYoursWallet();
  
  const syncWeb3State = useStore((state) => state.walletActions.syncWeb3State);
  const syncYoursState = useStore((state) => state.walletActions.syncYoursState);
  const registerWagmiDisconnect = useStore((state) => state.walletActions.registerWagmiDisconnect);
  const resetWallet = useStore((state) => state.walletActions.resetWallet);
  const setModalOpen = useStore((state) => state.walletActions.setModalOpen);

  const provider = useStore((state) => state.wallet.provider);

  useEffect(() => {
    if (wagmiDisconnect && registerWagmiDisconnect) {
      registerWagmiDisconnect(() => wagmiDisconnect());
    }
  }, [wagmiDisconnect, registerWagmiDisconnect]);

  useEffect(() => {
    if (web3Connected && web3Address) {
        syncWeb3State({
            isConnected: true,
            isConnecting: false,
            address: web3Address,
            chainId: chainId,
            provider: 'rainbowkit' 
        });
       setModalOpen(false);
    } else if (!web3Connected && provider === 'rainbowkit') {
       resetWallet();
    }
  }, [web3Connected, web3Address, chainId, provider, syncWeb3State, resetWallet, setModalOpen]);

  useEffect(() => {
    if (!yoursWallet?.on) {
        return;
    }

    const handleSignedOut = () => {
      if (provider === 'yours') {
        resetWallet();
      }
    };

    const handleSwitchAccount = async () => {
      if (provider === 'yours') {
        const addresses = await yoursWallet.getAddresses();
        const pubKeys = await yoursWallet.getPubKeys();
        const balance = await yoursWallet.getBalance();

        syncYoursState({
          address: addresses?.bsvAddress,
          yoursAddress: addresses,
          yoursPubKeys: pubKeys,
          balance: balance ? {
            formatted: balance.bsv.toString(),
            value: balance.satoshis,
            currency: 'BSV',
          } : undefined
        });
      }
    };

    yoursWallet.on('signedOut', handleSignedOut);
    yoursWallet.on('switchAccount', handleSwitchAccount);

    return () => {
      yoursWallet.removeListener('signedOut', handleSignedOut);
      yoursWallet.removeListener('switchAccount', handleSwitchAccount);
    };
  }, [yoursWallet, provider, syncYoursState, resetWallet]);
  
  useEffect(() => {
    const checkYours = async () => {
      if (yoursWallet?.isConnected && !web3Connected && !provider) {
        try {
          const isConnected = await yoursWallet.isConnected();
          if (isConnected) {
            const addresses = await yoursWallet.getAddresses();
            const pubKeys = await yoursWallet.getPubKeys();
            const balance = await yoursWallet.getBalance();
            
            syncYoursState({
              isConnected: true,
              isConnecting: false,
              provider: 'yours',
              address: addresses?.bsvAddress,
              yoursAddress: addresses,
              yoursPubKeys: pubKeys,
              balance: balance ? {
                formatted: balance.bsv.toString(),
                value: balance.satoshis,
                currency: 'BSV',
              } : undefined
            });
            setModalOpen(false);
          }
        } catch (e) {
          console.log(e);
        }
      }
    };
    checkYours();
  }, [yoursWallet, web3Connected, provider, syncYoursState, setModalOpen]);
}