"use client";

// ============================================================================
// Styles
// ============================================================================
import './styles.css';

// ============================================================================
// Main Component Export
// ============================================================================
// Usage: <MneeCheckout buttonId="btn_xxx" apiBaseUrl="https://api.pay.mnee.io" />
export { MneeCheckout, MneeCheckoutWithoutProviders, MneeSharedProviders } from './components/MneeCheckout';

// ============================================================================
// Type Exports
// ============================================================================
export type {
  MneeCheckoutProps,
  ButtonConfigOverride,
  CheckoutType,
  Theme,
  Stablecoin,
  WalletProvider as WalletProviderType,
  CustomField,
  FieldType,
  FieldOption,
  PaymentResult,
  StyleConfig,
  CheckoutCallbacks,
} from './types';
