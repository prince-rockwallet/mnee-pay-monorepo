import { useEffect } from 'react';
import { useStore } from '../store';

export const useStoreSync = () => {
  const syncCartState = useStore((state) => state.cartActions.syncCartState);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== 'mnee-checkout-storage' || !e.newValue) {
        return;
      }

      try {
        const storedData = JSON.parse(e.newValue);
        const incomingState = storedData.state;
        
        const currentCart = useStore.getState().cart;
        if (incomingState.cart && JSON.stringify(currentCart) !== JSON.stringify(incomingState.cart)) {
           console.log('[Sync] Updating cart from another tab');
           syncCartState(incomingState.cart);
        }
      } catch (err) {
        console.error('Failed to sync state across tabs', err);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [syncCartState]);
};