import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Config } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains';

// ============================================================================
// Wagmi Configuration
// ============================================================================

// Get WalletConnect project ID from environment variable
// To use this, create a .env file with: VITE_WALLETCONNECT_PROJECT_ID=your_project_id
// Get your project ID from https://cloud.walletconnect.com
const projectId = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const wagmiConfig: Config = getDefaultConfig({
  appName: 'MNEE Checkout',
  projectId,
  chains: [mainnet, base, arbitrum, optimism, polygon],
  ssr: false, // If using SSR, set to true
});
