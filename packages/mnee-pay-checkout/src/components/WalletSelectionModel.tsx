import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { WalletConnection } from './WalletConnection';
import { WalletProvider } from '../types';
import { cn } from '../lib/utils';

interface WalletSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabledWallets?: WalletProvider[];
  onWalletConnect: (address: string, provider: WalletProvider) => void;
  theme?: 'light' | 'dark';
  styling?: any;
  onWalletDisconnect?: () => void;
}

export function WalletSelectionModal({
  open,
  onOpenChange,
  enabledWallets,
  onWalletConnect,
  theme = 'light',
  styling,
  onWalletDisconnect
}: WalletSelectionModalProps) {
  
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
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
              onWalletConnect(address, provider);
            }}
            onDisconnect={onWalletDisconnect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}