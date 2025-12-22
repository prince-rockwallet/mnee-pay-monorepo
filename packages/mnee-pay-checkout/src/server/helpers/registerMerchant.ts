/**
 * Register a new merchant with MNEE Checkout
 *
 * This is a one-time setup function for merchant onboarding.
 * First get your MNEE API key from https://developer.mnee.net,
 * then call this to register your BSV deposit address.
 */

import { PrivateKey, BSM, ECDSA, BigNumber, Utils } from '@bsv/sdk';

const DEFAULT_MNEE_CHECKOUT_API_URL = 'https://checkout-api.mnee.net';

export interface RegisterMerchantConfig {
  /** BSV private key in WIF format */
  privateKeyWif: string;
  /** MNEE API key from developer.mnee.net */
  mneeApiKey: string;
  /** Webhook URL to receive payment notifications */
  webhookUrl: string;
  /** Merchant business name (optional) */
  name?: string;
  /** Merchant contact email (optional) */
  email?: string;
  /** Optional: Override the MNEE Checkout API URL (for testing) */
  mneeCheckoutApiUrl?: string;
}

export interface RegisterMerchantResponse {
  success: boolean;
  merchantId: string;
  depositAddress: string;
}

interface SignedMessage {
  address: string;
  pubKey: string;
  message: string;
  sig: string;
}

/**
 * Sign a message with a BSV private key
 * @internal
 */
function signMessage(
  privateKeyWif: string,
  message: string,
  encoding: 'utf8' | 'hex' | 'base64' = 'utf8',
): SignedMessage {
  const privateKey = PrivateKey.fromWif(privateKeyWif);
  const publicKey = privateKey.toPublicKey();
  const address = publicKey.toAddress();

  // Create magic hash for BSV message signing
  const msgHash = new BigNumber(BSM.magicHash(Utils.toArray(message, encoding)));

  // Sign the message hash
  const signature = ECDSA.sign(msgHash, privateKey, true);

  // Calculate recovery factor
  const recovery = signature.CalculateRecoveryFactor(publicKey, msgHash);

  // Convert signature to compact format with recovery factor
  const sig = signature.toCompact(recovery, true, 'base64') as string;

  return {
    address,
    pubKey: publicKey.toString(),
    message,
    sig,
  };
}

/**
 * Register a new merchant with MNEE Checkout
 *
 * This function signs a registration message with your BSV private key
 * and registers your merchant account with MNEE.
 *
 * @param config - Registration configuration
 * @returns Registration response with merchantId and apiKey
 *
 * @example
 * ```typescript
 * import { registerMerchant } from '@mnee/checkout/server';
 *
 * // First, get your MNEE API key from https://developer.mnee.net
 * const result = await registerMerchant({
 *   privateKeyWif: process.env.BSV_PRIVATE_KEY!,
 *   mneeApiKey: process.env.MNEE_API_KEY!, // From developer.mnee.net
 *   webhookUrl: 'https://mystore.com/webhooks/mnee',
 *   name: 'My Store', // optional
 *   email: 'admin@mystore.com', // optional
 * });
 *
 * console.log('Merchant ID:', result.merchantId);
 * console.log('Deposit Address:', result.depositAddress);
 *
 * // Save the merchantId - you'll need it for MneeProvider
 * ```
 */
export async function registerMerchant(
  config: RegisterMerchantConfig
): Promise<RegisterMerchantResponse> {
  const {
    privateKeyWif,
    mneeApiKey,
    webhookUrl,
    name,
    email,
    mneeCheckoutApiUrl = DEFAULT_MNEE_CHECKOUT_API_URL,
  } = config;

  // Derive address from private key and create signed message
  const privateKey = PrivateKey.fromWif(privateKeyWif);
  const publicKey = privateKey.toPublicKey();
  const address = publicKey.toAddress();

  // Create message that includes the deposit address
  const message = `I am registering my MNEE deposit address: ${address}`;

  // Sign the message
  const signed = signMessage(privateKeyWif, message);

  // Prepare registration payload
  const payload = {
    depositAddress: signed.address,
    publicKey: signed.pubKey,
    signature: signed.sig,
    message: signed.message,
    mneeApiKey,
    webhookUrl,
    name,
    email,
  };

  // Make registration request
  const response = await fetch(`${mneeCheckoutApiUrl}/api/merchant/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(
      (errorData as { message?: string }).message ||
        `Failed to register merchant: HTTP ${response.status}`
    );
  }

  const data = await response.json() as { merchantId: string };

  return {
    success: true,
    merchantId: data.merchantId,
    depositAddress: address,
  };
}
