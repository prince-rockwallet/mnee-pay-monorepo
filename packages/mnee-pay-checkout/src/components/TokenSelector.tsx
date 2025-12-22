import { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { Check, Zap, Clock, AlertCircle } from 'lucide-react';
import { Stablecoin } from '../types';
import {
  TOKEN_ADDRESSES,
  TOKEN_INFO,
  CHAIN_INFO,
  ERC20_ABI,
  getTokenDecimals,
} from '../lib/tokens';
import { cn } from '../lib/utils';

interface TokenOption {
  token: Stablecoin;
  chainId: number;
  address: string;
  balance: bigint;
  balanceFormatted: string;
  isCurrentChain: boolean;
  gasLevel: 'low' | 'medium' | 'high';
}

interface TokenSelectorProps {
  /** Required payment amount (for validation) */
  amount: number;
  /** Currently selected token */
  selectedToken?: Stablecoin;
  /** Currently selected chain */
  selectedChainId?: number;
  /** Callback when user selects a token */
  onSelect: (token: Stablecoin, chainId: number, tokenAddress: string) => void;
  /** Optional: Limit to specific tokens */
  allowedTokens?: Stablecoin[];
}

export function TokenSelector({
  amount,
  selectedToken,
  selectedChainId,
  onSelect,
  allowedTokens,
}: TokenSelectorProps) {
  const { address: userAddress, chainId: currentChainId } = useAccount();
  const [tokenOptions, setTokenOptions] = useState<TokenOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Build list of all token/chain combinations to check
  const tokenCombinations = Object.entries(TOKEN_ADDRESSES).flatMap(
    ([chainIdStr, tokens]) => {
      const chainId = parseInt(chainIdStr);
      return Object.entries(tokens)
        .filter(([token]) => {
          if (!allowedTokens) return true;
          return allowedTokens.includes(token as Stablecoin);
        })
        .map(([token, address]) => ({
          token: token as Stablecoin,
          chainId,
          address: address as string,
        }));
    }
  );

  // Prepare balance read calls for all tokens
  const balanceContracts = tokenCombinations.map(({ address, chainId }) => ({
    address: address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    chainId,
  }));

  // Read all balances at once
  const { data: balancesData, isLoading: isLoadingBalances } = useReadContracts({
    contracts: balanceContracts,
  });

  // Process balance data into token options
  useEffect(() => {
    if (!balancesData || isLoadingBalances) {
      setIsLoading(true);
      return;
    }

    const options: TokenOption[] = tokenCombinations
      .map((combo, index) => {
        const balanceResult = balancesData[index];
        const balance = balanceResult?.status === 'success' && balanceResult.result
          ? BigInt(balanceResult.result)
          : 0n;

        const decimals = getTokenDecimals(combo.token);
        const balanceFormatted = formatUnits(balance, decimals);
        const chainInfo = CHAIN_INFO[combo.chainId];

        return {
          ...combo,
          balance,
          balanceFormatted,
          isCurrentChain: combo.chainId === currentChainId,
          gasLevel: chainInfo?.gasLevel || 'medium',
        };
      })
      .filter((option) => option.balance > 0n) // Only show tokens with balance
      .sort((a, b) => {
        // Sort by: current chain first, then by balance (highest first), then by gas cost (lowest first)
        if (a.isCurrentChain && !b.isCurrentChain) return -1;
        if (!a.isCurrentChain && b.isCurrentChain) return 1;

        // Compare balances
        if (a.balance > b.balance) return -1;
        if (a.balance < b.balance) return 1;

        // Compare gas levels
        const gasOrder = { low: 0, medium: 1, high: 2 };
        return gasOrder[a.gasLevel] - gasOrder[b.gasLevel];
      });

    setTokenOptions(options);
    setIsLoading(false);
  }, [balancesData, isLoadingBalances, currentChainId]);

  // Auto-select best option if none selected
  useEffect(() => {
    if (!selectedToken && tokenOptions.length > 0 && !isLoading) {
      const best = tokenOptions[0];
      onSelect(best.token, best.chainId, best.address);
    }
  }, [tokenOptions, selectedToken, isLoading, onSelect]);

  const getGasIcon = (gasLevel: 'low' | 'medium' | 'high') => {
    switch (gasLevel) {
      case 'low':
        return <Zap className="h-3 w-3 text-green-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'high':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getGasLabel = (gasLevel: 'low' | 'medium' | 'high') => {
    switch (gasLevel) {
      case 'low':
        return 'Low gas';
      case 'medium':
        return 'Medium gas';
      case 'high':
        return 'High gas';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Select Payment Token</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Checking your balances...
        </p>
      </div>
    );
  }

  if (tokenOptions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">No Balance Available</h3>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                Insufficient stablecoin balance
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You don't have any USDC, USDT, or DAI on the supported networks. Please add funds to your wallet and try again.
              </p>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Supported networks:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Ethereum, Base, Arbitrum, Optimism, Polygon</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Select Payment Token</h3>
        <p className="text-sm text-muted-foreground">
          Choose which stablecoin and network to use for this payment
        </p>
      </div>

      <div className="space-y-2">
        {tokenOptions.map((option) => {
          const isSelected = selectedToken === option.token && selectedChainId === option.chainId;
          const tokenInfo = TOKEN_INFO[option.token];
          const chainInfo = CHAIN_INFO[option.chainId];
          const hasSufficientBalance = parseFloat(option.balanceFormatted) >= amount;

          return (
            <button
              key={`${option.token}-${option.chainId}`}
              onClick={() => onSelect(option.token, option.chainId, option.address)}
              disabled={!hasSufficientBalance}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                'hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'border-primary bg-muted/30'
                  : 'border-border bg-background'
              )}
            >
              {/* Token Logo */}
              <div className="flex-shrink-0">
                {tokenInfo.logo ? (
                  <img
                    src={tokenInfo.logo}
                    alt={tokenInfo.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {option.token}
                  </div>
                )}
              </div>

              {/* Token Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{option.token}</span>
                  <span className="text-xs text-muted-foreground">on</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-foreground">
                    {chainInfo?.name || `Chain ${option.chainId}`}
                  </span>
                  {!option.isCurrentChain && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      • Switch network
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    Balance: <span className="font-mono text-foreground">{parseFloat(option.balanceFormatted).toFixed(2)}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {getGasIcon(option.gasLevel)}
                    <span className="text-xs text-muted-foreground">
                      {getGasLabel(option.gasLevel)}
                    </span>
                  </div>
                </div>
                {!hasSufficientBalance && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Insufficient balance (need {amount.toFixed(2)} {option.token})
                  </p>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <p className="font-medium mb-1">💡 Recommendation:</p>
        <p>
          {tokenOptions[0]?.isCurrentChain
            ? 'Using your current network for fastest checkout'
            : 'You\'ll be prompted to switch networks before payment'}
        </p>
      </div>
    </div>
  );
}
