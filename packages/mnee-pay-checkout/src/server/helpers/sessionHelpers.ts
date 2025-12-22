/**
 * MNEE Session Management Helpers
 *
 * These helpers allow merchants to proxy checkout session requests
 * through their own server, improving security by preventing direct
 * client access to the MNEE API.
 */

/**
 * MNEE Checkout API base URL - controlled by the package
 * Can be overridden with MNEE_CHECKOUT_API_URL environment variable for testing
 */
const MNEE_CHECKOUT_API_BASE_URL = process.env.MNEE_CHECKOUT_API_URL || 'https://checkout-api.mnee.net';

/**
 * Request parameters for creating a checkout session
 */
export interface CreateSessionRequest {
  /** Merchant's MNEE API key */
  mneeApiKey: string;
  /** Amount in USD cents (e.g., 2500 = $25.00) */
  amountUsdCents: number;
  /** Blockchain network to use */
  chain: "ETHEREUM" | "BASE" | "ARBITRUM" | "OPTIMISM" | "POLYGON" | "BSV";
  /** Stablecoin to accept (e.g., 'USDC', 'USDT', 'DAI') */
  stablecoin: string;
  /** Optional metadata to attach to the session */
  metadata?: any;
}

/**
 * Response from creating a checkout session
 */
export interface CreateSessionResponse {
  /** Unique session ID */
  sessionId: string;
  /** JWT session token for client-side authentication */
  sessionToken: string;
  /** Deposit address where customer sends payment */
  depositAddress: string;
  /** Amount of MNEE merchant will receive */
  mneeAmount: number;
  /** Merchant's MNEE deposit address */
  mneeDepositAddress: string;
  /** Session expiration timestamp */
  expiresAt: string;
}

/**
 * Create a new MNEE checkout session
 * @internal Used internally - merchants should use checkoutServer.createSessionHandler()
 */
export async function createSession(
  params: CreateSessionRequest
): Promise<CreateSessionResponse> {
  const response = await fetch(
    `${MNEE_CHECKOUT_API_BASE_URL}/api/checkout/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": params.mneeApiKey,
      },
      body: JSON.stringify({
        amountUsdCents: params.amountUsdCents,
        chain: params.chain,
        stablecoin: params.stablecoin,
        metadata: params.metadata,
      }),
    }
  );

  if (!response.ok) {
    const errorData: any = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      errorData.message ||
        `Failed to create session: HTTP ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as CreateSessionResponse;
}

/**
 * Transaction status response for client polling
 */
export interface TransactionStatusResponse {
  /** Transaction hash */
  txHash: string;
  /** Blockchain network */
  chain: string;
  /** Current confirmation count */
  confirmations: number;
  /** Required confirmation count */
  requiredConfirmations: number;
  /** Whether transaction has enough confirmations */
  isConfirmed: boolean;
  /** Confirmation progress (e.g., "3/12") */
  progress: string;
  /** Percentage complete (0-100) */
  percentComplete: number;
}

/**
 * Internal API response from MNEE API /transaction-status endpoint
 */
interface TransactionStatusApiResponse {
  found: boolean;
  txHash: string;
  chain: string;
  confirmations: number;
  requiredConfirmations: number;
  isConfirmed: boolean;
  progress: string;
  percentComplete: number;
  status?: string;
}

/**
 * Get transaction confirmation status
 * @internal Used internally - merchants should use checkoutServer.getTransactionStatus()
 */
export async function getTransactionStatus(
  txHash: string,
  mneeCheckoutApiUrl?: string
): Promise<TransactionStatusResponse | null> {
  const apiUrl = mneeCheckoutApiUrl || MNEE_CHECKOUT_API_BASE_URL;
  try {
    const response = await fetch(
      `${apiUrl}/api/checkout/transaction-status/${txHash}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch transaction status: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as TransactionStatusApiResponse;

    // If transaction not found in MNEE API, return null
    if (!data.found) {
      return null;
    }

    return {
      txHash: data.txHash,
      chain: data.chain,
      confirmations: data.confirmations,
      requiredConfirmations: data.requiredConfirmations,
      isConfirmed: data.isConfirmed,
      progress: data.progress,
      percentComplete: data.percentComplete,
    };
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    return null;
  }
}

/**
 * Get session response from MNEE API
 */
export interface GetSessionResponse {
  sessionId: string;
  amountUsdCents: number;
  chain: string;
  stablecoin: string;
  depositAddress: string;
  metadata: any; // Includes items, email, shipping, etc.
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

/**
 * Get session details by ID
 * @internal Used internally by processOrder - merchants should use checkoutServer.processOrder()
 */
export async function getSession(
  sessionId: string,
  mneeApiKey: string,
  mneeCheckoutApiUrl?: string
): Promise<GetSessionResponse> {
  const apiUrl = mneeCheckoutApiUrl || MNEE_CHECKOUT_API_BASE_URL;
  const response = await fetch(
    `${apiUrl}/api/checkout/sessions/${sessionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": mneeApiKey,
      },
    }
  );

  if (!response.ok) {
    const errorData: any = await response
      .json()
      .catch(() => ({ message: "Failed to get session" }));
    throw new Error(
      errorData.message || `Failed to get session: HTTP ${response.status}`
    );
  }

  return (await response.json()) as GetSessionResponse;
}

/**
 * Complete session request parameters
 * @internal Used internally by processOrder
 */
export interface CompleteSessionRequest {
  sessionId: string;
  mneeApiKey: string;
  txHash: string;
  merchantOrderId: string;
  /** @internal Set by createCheckoutServer */
  mneeCheckoutApiUrl?: string;
}

/**
 * Complete session response from MNEE API
 */
export interface CompleteSessionResponse {
  success: boolean;
  transactionId: string;
  mneeTransactionId?: string;
  status?: string;
  message: string;
}

/**
 * Complete a checkout session with payment transaction
 * @internal Used internally by processOrder - merchants should use checkoutServer.processOrder()
 */
export async function completeSession(
  params: CompleteSessionRequest
): Promise<CompleteSessionResponse> {
  const { sessionId, mneeApiKey, txHash, merchantOrderId, mneeCheckoutApiUrl } = params;
  const apiUrl = mneeCheckoutApiUrl || MNEE_CHECKOUT_API_BASE_URL;

  const response = await fetch(
    `${apiUrl}/api/checkout/sessions/${sessionId}/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: mneeApiKey,
        txHash,
        merchantOrderId,
      }),
    }
  );

  if (!response.ok) {
    const errorData: any = await response
      .json()
      .catch(() => ({ message: "Failed to complete session" }));
    throw new Error(
      errorData.message ||
        `Failed to complete session: HTTP ${response.status}`
    );
  }

  return (await response.json()) as CompleteSessionResponse;
}
