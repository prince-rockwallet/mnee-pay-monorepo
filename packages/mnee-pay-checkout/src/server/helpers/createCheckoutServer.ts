/**
 * Creates a configured MNEE Checkout Server instance
 *
 * This helper initializes all SDK functions with shared configuration,
 * so merchants don't need to pass the same config to every handler.
 *
 * @example
 * ```typescript
 * import { createCheckoutServer } from '@mnee/checkout/server';
 *
 * const checkoutServer = createCheckoutServer({
 *   mneeApiKey: process.env.MNEE_API_KEY!,
 *   mneeCheckoutApiUrl: process.env.MNEE_CHECKOUT_API_URL,
 * });
 *
 * // Now use the configured handlers
 * app.post('/api/checkout/create-session', checkoutServer.createSessionHandler());
 *
 * app.post('/api/orders', async (req, res) => {
 *   const result = await checkoutServer.processOrder({
 *     sessionId: req.body.sessionId,
 *     txHash: req.body.txHash,
 *     merchantOrderId: generateOrderId(),
 *   });
 *   res.json(result);
 * });
 *
 * app.get('/api/checkout/status/:txHash', async (req, res) => {
 *   const status = await checkoutServer.getTransactionStatus(req.params.txHash);
 *   res.json(status);
 * });
 * ```
 */

import { createSessionHandler } from './createSessionHandler';
import { createCalculateTotalsHandler, CalculateTotalsConfig } from './createCalculateTotalsHandler';
import { processOrder, ProcessOrderConfig } from './processOrder';
import { getTransactionStatus } from './sessionHelpers';
import { createWebhookVerifier } from './verifyWebhookSignature';
import type { TransactionStatusResponse } from './sessionHelpers';

export interface CheckoutServerConfig {
  mneeApiKey: string;
  mneeCheckoutApiUrl?: string;
}

export interface CheckoutServer {
  /**
   * Create session handler for Express/HTTP routes
   * Returns a handler that can be used directly with app.post()
   */
  createSessionHandler: () => ReturnType<typeof createSessionHandler>;

  /**
   * Create calculate totals handler for Express/HTTP routes
   * Returns a handler that can be used directly with app.post()
   */
  createCalculateTotalsHandler: (config: Omit<CalculateTotalsConfig, 'mneeApiKey'>) => ReturnType<typeof createCalculateTotalsHandler>;

  /**
   * Process an order - get session, complete it, and return order data
   */
  processOrder: (config: Omit<ProcessOrderConfig, 'mneeApiKey' | 'mneeCheckoutApiUrl'>) => ReturnType<typeof processOrder>;

  /**
   * Get transaction status by transaction hash
   */
  getTransactionStatus: (txHash: string) => Promise<TransactionStatusResponse | null>;

  /**
   * Verify webhook signature from MNEE (pre-configured with API key)
   * Just pass payload and signature - no need to pass API key again
   */
  verifyWebhookSignature: (payload: any, signature: string | undefined) => boolean;
}

/**
 * Create a configured MNEE Checkout Server instance
 */
export function createCheckoutServer(config: CheckoutServerConfig): CheckoutServer {
  const { mneeApiKey, mneeCheckoutApiUrl } = config;

  return {
    createSessionHandler: () => createSessionHandler({
      mneeApiKey,
      mneeCheckoutApiUrl,
    }),

    createCalculateTotalsHandler: (totalsConfig) => createCalculateTotalsHandler(totalsConfig),

    processOrder: (orderConfig) => processOrder({
      ...orderConfig,
      mneeApiKey,
      mneeCheckoutApiUrl,
    }),

    getTransactionStatus: (txHash) => getTransactionStatus(txHash, mneeCheckoutApiUrl),

    verifyWebhookSignature: createWebhookVerifier(mneeApiKey),
  };
}
