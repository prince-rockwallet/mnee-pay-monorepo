import { PaymentMethod } from '../types';

/**
 * Available payment methods for users to select from
 * All payments are converted to MNEE for merchant settlement
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    label: 'USDC on Base',
    stablecoin: 'USDC',
    chain: 'BASE',
    description: 'Fast & low fees',
    enabled: true,
  },
  {
    label: 'USDT on Ethereum',
    stablecoin: 'USDT',
    chain: 'ETH',
    description: 'Most widely held stablecoin',
    enabled: true,
  },
  {
    label: 'USDC on Ethereum',
    stablecoin: 'USDC',
    chain: 'ETH',
    description: 'Ethereum mainnet',
    enabled: true,
  },
  {
    label: 'USDC on Polygon',
    stablecoin: 'USDC',
    chain: 'POLYGON',
    description: 'Low-cost transactions',
    enabled: true,
  },
  {
    label: 'USDC on Arbitrum',
    stablecoin: 'USDC',
    chain: 'ARBITRUM',
    description: 'Layer 2 scaling solution',
    enabled: true,
  },
  {
    label: 'USDC on Optimism',
    stablecoin: 'USDC',
    chain: 'OPTIMISM',
    description: 'Optimistic rollup',
    enabled: true,
  },
  {
    label: 'BSV/MNEE',
    stablecoin: 'MNEE',
    chain: 'BSV',
    description: 'Direct MNEE payment',
    enabled: true,
  },
];

/**
 * Default payment method (USDC on Base - low fees and fast)
 */
export const DEFAULT_PAYMENT_METHOD: PaymentMethod = PAYMENT_METHODS[0];
