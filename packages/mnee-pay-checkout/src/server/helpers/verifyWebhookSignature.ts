import * as crypto from 'crypto';

/**
 * Verify the HMAC signature of a webhook payload from MNEE
 *
 * @param payload - The webhook payload object received in the request body
 * @param signature - The signature from the X-Webhook-Signature header
 * @param mneeApiKey - Your MNEE API key (used as the HMAC secret)
 * @returns true if signature is valid, false otherwise
 *
 * @example
 * ```typescript
 * import { verifyWebhookSignature } from '@mnee/checkout/server';
 *
 * app.post('/webhooks/mnee', (req, res) => {
 *   const signature = req.headers['x-webhook-signature'];
 *   const payload = req.body;
 *   const mneeApiKey = process.env.MNEE_API_KEY;
 *
 *   if (!verifyWebhookSignature(payload, signature, mneeApiKey)) {
 *     return res.status(401).json({ error: 'Invalid signature' });
 *   }
 *
 *   // Process webhook...
 *   res.json({ received: true });
 * });
 * ```
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string | undefined,
  mneeApiKey: string,
): boolean {
  if (!signature) {
    console.warn('[MNEE Webhook] No signature provided in X-Webhook-Signature header');
    return false;
  }

  if (!mneeApiKey) {
    console.warn('[MNEE Webhook] No MNEE API key configured');
    return false;
  }

  try {
    // Generate expected signature using the same method as the server
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', mneeApiKey)
      .update(payloadString)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch (error) {
    console.error('[MNEE Webhook] Error verifying signature:', error);
    return false;
  }
}

/**
 * Create a pre-configured webhook signature verifier
 * This is used internally by createCheckoutServer to bind the API key
 *
 * @param mneeApiKey - Your MNEE API key (used as the HMAC secret)
 * @returns A function that only needs payload and signature
 *
 * @example
 * ```typescript
 * const verify = createWebhookVerifier(process.env.MNEE_API_KEY);
 *
 * app.post('/webhooks/mnee', (req, res) => {
 *   if (!verify(req.body, req.headers['x-webhook-signature'])) {
 *     return res.status(401).json({ error: 'Invalid signature' });
 *   }
 *   res.json({ received: true });
 * });
 * ```
 */
export function createWebhookVerifier(mneeApiKey: string) {
  return (payload: any, signature: string | undefined): boolean => {
    return verifyWebhookSignature(payload, signature, mneeApiKey);
  };
}
