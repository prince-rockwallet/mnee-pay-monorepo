import { CheckCircle2, Loader2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";
import { WalletProvider } from "../types";
import { useWallet } from "../contexts/WalletContext";
import { useEffect, useRef } from "react";
import yoursLogo from "../assets/yours-logo.png";

interface WalletConnectionProps {
  enabledWallets?: WalletProvider[];
  onConnect?: (address: string, provider: WalletProvider) => void;
  onDisconnect?: () => void;
  forceSelection?: boolean;
}

export function WalletConnection({
  enabledWallets = ["rainbowkit", "yours"],
  onConnect,
  onDisconnect,
  forceSelection = false,
}: WalletConnectionProps) {
  const { isConnected, isConnecting, address, provider, disconnect, connectYours } = useWallet();

  // Track if we've already called onConnect for this connection
  const hasCalledOnConnect = useRef(false);

  // Watch for wallet connections and call onConnect callback
  useEffect(() => {
    if (isConnected && address && provider && !hasCalledOnConnect.current) {
      onConnect?.(address, provider);
      hasCalledOnConnect.current = true;
    } else if (!isConnected) {
      // Reset flag when wallet disconnects
      hasCalledOnConnect.current = false;
    }
  }, [isConnected, address, provider, onConnect]);

  const handleYoursConnect = async () => {
    try {
      if (isConnected) {
        await disconnect();
      }
      await connectYours();
    } catch (error) {
      console.error("Yours wallet connection failed", error);
      alert(
        "Failed to connect Yours Wallet. Please make sure the extension is installed."
      );
    }
  };

  const handleWeb3Connect = async (openConnectModal: () => void) => {
    if (isConnected) {
      await disconnect();
    }
    openConnectModal();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onDisconnect?.();
    } catch (error) {
      console.error("Disconnect failed", error);
    }
  };

  if (isConnected && address && !forceSelection) {
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Wallet Connected</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Address</p>
            <p className="font-mono text-sm text-foreground truncate max-w-[200px]">
              {address}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              via {provider === 'rainbowkit' ? 'Web3' : 'Yours Wallet'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="h-8">
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  // Show wallet options
  return (
    <div className="space-y-3">
      {isConnecting && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {(enabledWallets.includes("rainbowkit") || enabledWallets.includes("walletconnect")) && (
        <div className="w-full">
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain && !forceSelection;

              if (!ready) {
                return (
                  <Button variant="outline" disabled className="w-full justify-start gap-2 h-12">
                    <div className="w-6 h-6 rounded bg-muted animate-pulse" />
                    <span className="text-muted-foreground">Loading wallets...</span>
                  </Button>
                );
              }

              if (!connected) {
                return (
                  <Button
                    onClick={() => handleWeb3Connect(openConnectModal)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 text-base font-medium transition-all hover:bg-accent hover:text-accent-foreground group"
                  >
                    <div className="w-6 h-6 flex items-center justify-center rounded bg-blue-500/10 group-hover:bg-blue-500/20">
                      <img
                          src="https://avatars.githubusercontent.com/u/48327834?s=200&v=4"
                          alt="Web3 Wallets"
                          className="w-6 h-6 mr-2 rounded"
                        />
                    </div>
                    <span>Connect Web3 Wallet</span>
                  </Button>
                );
              }

              return null;
            }}
          </ConnectButton.Custom>
        </div>
      )}

      {enabledWallets.includes("yours") && (
        <Button
          onClick={handleYoursConnect}
          variant="outline"
          className="w-full justify-start gap-3 h-12 text-base font-medium transition-all hover:bg-accent hover:text-accent-foreground group"
        >
          <div className="w-6 h-6 rounded flex items-center justify-center bg-[#000] group-hover:opacity-80 transition-opacity">
            <img
              src={yoursLogo}
              alt="Yours"
              className="w-4 h-4 object-contain"
            />
          </div>
          <span>Connect Yours Wallet</span>
        </Button>
      )}

      <p className="text-[11px] text-muted-foreground text-center pt-2 px-4 leading-tight">
        By connecting a wallet, you agree to the Terms of Service.
      </p>
    </div>
  );
}
