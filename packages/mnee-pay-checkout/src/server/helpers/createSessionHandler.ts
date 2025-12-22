/**
 * Creates an Express/HTTP handler for the /create-session endpoint
 *
 * This handler:
 * 1. Receives session creation request from frontend
 * 2. Calls MNEE API to create session
 * 3. Returns session with deposit address
 *
 * @example
 * ```typescript
 * app.post('/api/checkout/create-session', createSessionHandler({
 *   mneeApiKey: process.env.MNEE_API_KEY!,
 * }));
 * ```
 */

export interface CreateSessionConfig {
  mneeApiKey: string;
  mneeCheckoutApiUrl?: string; // Optional - defaults to production or process.env.MNEE_CHECKOUT_API_URL
}

export interface SessionMetadata {
  items: Array<{
    externalId: string;
    quantity: number;
    priceUsdCents?: number;
    selectedOptions?: Record<string, any>;
  }>;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  checkoutType?: 'ecommerce' | 'paywall' | 'donation';
  // Allow additional merchant-specific fields
  [key: string]: any;
}

export interface CreateSessionRequest {
  amountUsdCents: number;
  chain: string;
  stablecoin: string;
  metadata: SessionMetadata;
}

export interface CreateSessionResponse {
  sessionId: string;
  sessionToken: string;
  depositAddress: string;
  mneeAmount: number;
  mneeDepositAddress: string;
  expiresAt: string;
}

export function createSessionHandler(config: CreateSessionConfig) {
  const { mneeApiKey, mneeCheckoutApiUrl } = config;

  return async (req: any, res: any) => {
    try {
      const body: CreateSessionRequest = req.body;

      // Validate required fields
      if (!body.amountUsdCents || !body.chain || !body.stablecoin) {
        return res.status(400).json({
          error: 'Missing required fields: amountUsdCents, chain, stablecoin'
        });
      }

      // Validate metadata has items array
      if (!body.metadata?.items || !Array.isArray(body.metadata.items)) {
        return res.status(400).json({
          error: 'metadata.items is required and must be an array'
        });
      }

      // Determine API URL (priority: config > env > default production)
      const apiUrl = mneeCheckoutApiUrl || process.env.MNEE_CHECKOUT_API_URL || 'https://checkout-api.mnee.net';

      // Call MNEE Checkout API to create session
      const response = await fetch(`${apiUrl}/api/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': mneeApiKey,
        },
        body: JSON.stringify({
          amountUsdCents: body.amountUsdCents,
          chain: body.chain,
          stablecoin: body.stablecoin,
          metadata: body.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to create session'
        })) as { message?: string };
        return res.status(response.status).json({
          error: errorData.message || 'Failed to create session'
        });
      }

      const session = await response.json() as CreateSessionResponse;

      return res.json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({
        error: errorMessage
      });
    }
  };
}
