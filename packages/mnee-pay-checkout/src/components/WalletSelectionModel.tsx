import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { WalletConnection } from './WalletConnection';
import { WalletProvider } from '../types';
import { cn } from '../lib/utils';
import { useWallet } from '../store';

interface WalletSelectionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  enabledWallets?: WalletProvider[];
  onWalletConnect?: (address: string, provider: WalletProvider) => void;
  theme?: 'light' | 'dark';
  styling?: any;
  onWalletDisconnect?: () => void;
}

export function WalletSelectionModal({
  open: propOpen,
  onOpenChange: propOnOpenChange,
  enabledWallets,
  onWalletConnect,
  theme = 'light',
  styling,
  onWalletDisconnect
}: WalletSelectionModalProps) {
  
  const { isModalOpen, setModalOpen } = useWallet();

  const isOpen = propOpen !== undefined ? propOpen : isModalOpen;
  const handleOpenChange = (val: boolean) => {
    if (propOnOpenChange) {
      propOnOpenChange(val);
    } else {
      setModalOpen(val);
    }
  };
  
  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      modal={false}
    >
      <DialogContent 
        onInteractOutside={(e) => e.preventDefault()}
        className={cn(
          theme === 'dark' ? 'dark bg-background text-foreground' : 'bg-white',
          "sm:max-w-md z-[60]" 
        )}
        style={{
          ...(styling?.fontFamily && { fontFamily: styling.fontFamily }),
          ...(styling?.primaryColor && { '--primary': styling.primaryColor } as any),
        }}
      >
        <DialogTitle>Select Wallet</DialogTitle>
        <DialogDescription>
          Connect a wallet to continue with your payment.
        </DialogDescription>
        
        <div className="pt-4">
          <WalletConnection 
            enabledWallets={enabledWallets}
            forceSelection={true}
            onConnect={(address, provider) => {
              onWalletConnect?.(address, provider);
            }}
            onDisconnect={onWalletDisconnect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}