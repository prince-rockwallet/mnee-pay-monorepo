import { parseUnits, formatUnits } from "viem";
import { Stablecoin } from "../types";
import { getTokenDecimals } from "./tokens";

/**
 * Payment processing utilities for ERC-20 stablecoin transfers
 */

// ============================================================================
// Types
// ============================================================================

export interface PaymentConfig {
  /** Token to pay with */
  token: Stablecoin;
  /** Chain ID to execute payment on */
  chainId: number;
  /** Token contract address */
  tokenAddress: string;
  /** Payment amount (in token units, e.g., "10.50") */
  amount: string;
  /** Recipient address */
  recipient: string;
  /** Sender address */
  senderAddress: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate payment configuration
 */
export function validatePaymentConfig(config: PaymentConfig): {
  valid: boolean;
  error?: string;
} {
  // Validate amount
  const amount = parseFloat(config.amount);
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: "Invalid payment amount" };
  }

  // Validate addresses (basic check for 0x prefix and length)
  if (!config.tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return { valid: false, error: "Invalid token address" };
  }

  if (!config.recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
    return { valid: false, error: "Invalid recipient address" };
  }

  if (!config.senderAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return { valid: false, error: "Invalid sender address" };
  }

  return { valid: true };
}

/**
 * Check if user has sufficient balance for payment
 * @param balance - User's token balance (as bigint)
 * @param amount - Payment amount (as string)
 * @param token - Token symbol
 * @returns true if balance is sufficient
 */
export function hasSufficientBalance(
  balance: bigint,
  amount: string,
  token: Stablecoin
): boolean {
  const decimals = getTokenDecimals(token);
  const requiredAmount = parseUnits(amount, decimals);
  return balance >= requiredAmount;
}

// ============================================================================
// Amount Formatting
// ============================================================================

/**
 * Format token amount for display
 * @param amount - Amount as bigint
 * @param token - Token symbol
 * @param maxDecimals - Maximum decimal places to show (default: 2)
 */
export function formatPaymentAmount(
  amount: bigint,
  token: Stablecoin,
  maxDecimals: number = 2
): string {
  const decimals = getTokenDecimals(token);
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);

  return num.toFixed(maxDecimals);
}

/**
 * Parse payment amount string to token units (bigint)
 */
export function parsePaymentAmount(amount: string, token: Stablecoin): bigint {
  const decimals = getTokenDecimals(token);
  return parseUnits(amount, decimals);
}

// ============================================================================
// Gas Estimation
// ============================================================================

/**
 * Estimate gas cost for ERC-20 transfer
 * Returns estimated cost in native currency (ETH, MATIC, etc.)
 *
 * Note: These are rough estimates based on typical ERC-20 transfer gas usage
 * In production, you should use actual gas estimation from the network
 */
export function estimateGasCost(chainId: number): {
  gasLimit: bigint;
  estimatedCostUSD: string;
  estimatedCostNative: string;
} {
  // Typical ERC-20 transfer uses ~50,000-65,000 gas
  const gasLimit = 65000n;

  // Estimated gas prices and costs by chain (rough estimates, update based on real-time data)
  const estimates: Record<
    number,
    { gwei: number; ethPriceUSD: number; nativeSymbol: string }
  > = {
    1: { gwei: 30, ethPriceUSD: 2500, nativeSymbol: "ETH" }, // Ethereum
    8453: { gwei: 0.001, ethPriceUSD: 2500, nativeSymbol: "ETH" }, // Base (very cheap)
    42161: { gwei: 0.1, ethPriceUSD: 2500, nativeSymbol: "ETH" }, // Arbitrum
    10: { gwei: 0.001, ethPriceUSD: 2500, nativeSymbol: "ETH" }, // Optimism
    137: { gwei: 100, ethPriceUSD: 0.8, nativeSymbol: "MATIC" }, // Polygon
  };

  const estimate = estimates[chainId] || estimates[1];

  // Calculate cost: gas * gasPrice
  const gasPrice = BigInt(Math.floor(estimate.gwei * 1e9)); // Convert gwei to wei
  const gasCostWei = gasLimit * gasPrice;

  // Convert to native currency
  const gasCostNative = Number(gasCostWei) / 1e18;
  const estimatedCostNative = gasCostNative.toFixed(6);

  // Convert to USD
  const gasCostUSD = gasCostNative * estimate.ethPriceUSD;
  const estimatedCostUSD = gasCostUSD.toFixed(2);

  return {
    gasLimit,
    estimatedCostUSD,
    estimatedCostNative: `${estimatedCostNative} ${estimate.nativeSymbol}`,
  };
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Parse common error messages from wallet/blockchain
 */
export function parsePaymentError(error: any): string {
  const errorMessage = error?.message || error?.toString() || "Unknown error";

  // User rejected transaction
  if (
    errorMessage.includes("User rejected") ||
    errorMessage.includes("User denied") ||
    errorMessage.includes("user rejected")
  ) {
    return "Transaction was cancelled";
  }

  // Insufficient balance
  if (
    errorMessage.includes("insufficient funds") ||
    errorMessage.includes("insufficient balance")
  ) {
    return "Insufficient balance to complete transaction";
  }

  // Gas estimation failed
  if (errorMessage.includes("gas required exceeds")) {
    return "Transaction would likely fail - please check your balance and try again";
  }

  // Network errors
  if (errorMessage.includes("network") || errorMessage.includes("connection")) {
    return "Network error - please check your connection and try again";
  }

  // Contract errors
  if (errorMessage.includes("execution reverted")) {
    return "Transaction failed - the contract rejected the transfer";
  }

  // Return cleaned error message
  return errorMessage.slice(0, 100); // Limit length
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Format transaction hash for display (shortened)
 */
export function formatTransactionHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getExplorerUrl(
  chainId: number,
  transactionHash: string
): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    8453: "https://basescan.org",
    42161: "https://arbiscan.io",
    10: "https://optimistic.etherscan.io",
    137: "https://polygonscan.com",
  };

  const baseUrl = explorers[chainId] || explorers[1];
  return `${baseUrl}/tx/${transactionHash}`;
}

/**
 * Get token-specific message for user
 */
export function getPaymentMessage(token: Stablecoin, amount: string): string {
  return `You will be prompted to approve the transfer of ${amount} ${token} from your wallet.`;
}
