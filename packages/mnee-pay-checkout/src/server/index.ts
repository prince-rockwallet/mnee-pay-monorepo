/**
 * MNEE Checkout Server-Side Utilities
 *
 * These utilities are designed to run on the server-side only (Node.js environment).
 * Do not import these in your client-side code.
 *
 * Usage:
 * ```typescript
 * import { createCheckoutServer } from '@mnee/checkout/server';
 *
 * const checkoutServer = createCheckoutServer({
 *   mneeApiKey: process.env.MNEE_API_KEY!,
 *   mneeCheckoutApiUrl: process.env.MNEE_CHECKOUT_API_URL,
 * });
 *
 * const {
 *   createCalculateTotalsHandler,
 *   createSessionHandler,
 *   processOrder,
 *   getTransactionStatus,
 *   verifyWebhookSignature,
 * } = checkoutServer;
 * ```
 *
 * @packageDocumentation
 */

// Main entry point - create a configured checkout server instance
export { createCheckoutServer } from './helpers/createCheckoutServer';
export type {
  CheckoutServerConfig,
  CheckoutServer
} from './helpers/createCheckoutServer';

// Merchant registration (one-time setup, before you have an API key)
export { registerMerchant } from './helpers/registerMerchant';
export type {
  RegisterMerchantConfig,
  RegisterMerchantResponse
} from './helpers/registerMerchant';

// Types needed by merchants
export type {
  TransactionStatusResponse,
} from './helpers/sessionHelpers';

export type {
  ProcessOrderResult,
  ProcessedOrder,
  OrderItem,
  ShippingAddress
} from './helpers/processOrder';

export type {
  CalculateTotalsConfig,
  CalculateTotalsRequest,
  CalculateTotalsResponse
} from './helpers/createCalculateTotalsHandler';

export type {
  SessionMetadata,
  CreateSessionRequest,
  CreateSessionResponse
} from './helpers/createSessionHandler';
