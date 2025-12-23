import { Wallet } from 'lucide-react';
import { StyleConfig } from '../types';
import { useWallet } from '../store';

interface WalletStatusBadgeProps {
  onSwitchWallet?: () => void;
  showSwitchButton?: boolean;
  styling?: StyleConfig;
}

export function WalletStatusBadge({
  onSwitchWallet,
  showSwitchButton = true,
  styling
}: WalletStatusBadgeProps) {
  const wallet = useWallet();

  if (!wallet.isConnected || !wallet.address) {
    return null;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getProviderLabel = () => {
    switch (wallet.provider) {
      case 'rainbowkit':
      case 'walletconnect':
        return 'Web3';
      case 'yours':
        return 'Yours';
      default:
        return wallet.provider;
    }
  };

  return (
    <button
      onClick={showSwitchButton && onSwitchWallet ? onSwitchWallet : undefined}
      disabled={!showSwitchButton}
      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex items-center gap-3">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-foreground">
            {formatAddress(wallet.address)}
          </span>
          <span className="text-xs text-muted-foreground">
            via {getProviderLabel()}
          </span>
        </div>
      </div>

      {showSwitchButton && (
        <span
          className="text-sm transition-colors font-medium"
          style={{
            color: styling?.buttonColor || 'hsl(var(--primary))',
          }}
        >
          Switch Wallet
        </span>
      )}
    </button>
  );
}
