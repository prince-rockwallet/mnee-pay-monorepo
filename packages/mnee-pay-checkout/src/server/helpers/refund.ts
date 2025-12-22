/**
 * MNEE Checkout Refund Utilities
 *
 * These utilities help merchants handle customer refunds for both STABLECOIN
 * and DIRECT_MNEE payment types.
 *
 * Two refund flows are supported:
 * 1. STABLECOIN: x402 flow where merchant sends MNEE to Fireblocks, gets stablecoin refunded to customer
 * 2. DIRECT_MNEE: P2P flow where merchant sends MNEE directly to customer
 *
 * @packageDocumentation
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type RefundType = 'STABLECOIN' | 'DIRECT_MNEE';

/**
 * Request to initiate a refund
 */
export interface InitiateRefundRequest {
  merchantOrderId: string; // Merchant's order ID
  amountUsdCents: number; // Amount to refund in USD cents
  reason?: string; // Optional reason for refund
}

/**
 * Response from initiateRefund for STABLECOIN payments (x402)
 */
export interface StablecoinRefundResponse {
  refundType: 'STABLECOIN';
  paymentRequired: true;
  mneeAmount: string; // MNEE amount merchant must send (decimal)
  mneeDepositAddress: string; // Fireblocks MNEE address
  refundDetails: {
    customerAddress: string; // Customer's address for refund
    chain: string; // Chain to refund on
    stablecoin: string; // Token to refund
    amountUsdCents: number; // Amount to refund
  };
  expiresAt: string; // ISO timestamp when refund request expires
  message: string;
}

/**
 * Response from initiateRefund for DIRECT_MNEE payments (P2P)
 */
export interface DirectMneeRefundResponse {
  refundType: 'DIRECT_MNEE';
  mneeAmount: string; // MNEE amount to send (decimal)
  customerAddress: string; // Customer's address for refund
  chain: 'BSV';
  message: string;
  expiresAt: string; // ISO timestamp when refund request expires
}

/**
 * Request to record a direct MNEE refund (P2P)
 */
export interface RecordDirectRefundRequest {
  merchantOrderId: string; // Merchant's order ID
  refundTxHash: string; // BSV transaction hash of MNEE refund
}

/**
 * Response from completing any refund
 */
export interface RefundCompletedResponse {
  success: true;
  refundTxHash: string; // Transaction hash of the refund
  refundedAmount: number; // Amount refunded in USD cents
  remainingRefundable: number; // Remaining amount that can be refunded
  message: string;
}

/**
 * Error response from refund operations
 */
export interface RefundError {
  success: false;
  error: string;
  code?: string;
}

// ============================================================================
// TODO: Implement initiateRefund function
// ============================================================================
/**
 * TODO: Implement initiateRefund function
 *
 * Purpose: Initiate a customer refund. This is the first step in the refund process.
 * Merchants call this when they want to refund a customer.
 *
 * Usage Example:
 * ```typescript
 * import { initiateRefund } from 'mnee-checkout/server';
 *
 * // In your merchant server endpoint:
 * app.post('/api/refund/initiate', async (req, res) => {
 *   try {
 *     const result = await initiateRefund({
 *       merchantOrderId: req.body.orderId,
 *       amountUsdCents: req.body.amountCents,
 *       reason: req.body.reason,
 *     }, MNEE_API_KEY, MNEE_API_URL);
 *
 *     if (result.refundType === 'STABLECOIN') {
 *       // x402 flow: Must send MNEE payment first
 *       res.status(402).json(result);
 *     } else {
 *       // P2P flow: Send MNEE directly to customer
 *       res.status(200).json(result);
 *     }
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * ```
 *
 * Function Signature:
 * ```typescript
 * export async function initiateRefund(
 *   request: InitiateRefundRequest,
 *   mneeApiKey: string,
 *   mneeApiUrl: string = 'https://checkout-api.mnee.com'
 * ): Promise<StablecoinRefundResponse | DirectMneeRefundResponse>
 * ```
 *
 * Implementation Steps:
 *
 * 1. Validate input parameters
 *    - Ensure merchantOrderId is provided and non-empty
 *    - Ensure amountUsdCents > 0
 *    - Ensure mneeApiKey is provided
 *
 * 2. Make POST request to MNEE API
 *    - Endpoint: POST {mneeApiUrl}/api/refund/initiate
 *    - Headers:
 *      {
 *        'Content-Type': 'application/json',
 *        'X-API-Key': mneeApiKey,
 *      }
 *    - Body: request (InitiateRefundRequest)
 *
 * 3. Handle response
 *    - If status 402: Parse as StablecoinRefundResponse
 *      * Return response for merchant to handle MNEE payment
 *    - If status 200: Parse as DirectMneeRefundResponse
 *      * Return response with customer address for P2P payment
 *    - If error: Throw with error details
 *
 * 4. Type guard helper (optional but recommended)
 *    ```typescript
 *    function isStablecoinRefund(
 *      response: StablecoinRefundResponse | DirectMneeRefundResponse
 *    ): response is StablecoinRefundResponse {
 *      return response.refundType === 'STABLECOIN';
 *    }
 *    ```
 *
 * Error Handling:
 * - Throw clear errors for validation failures
 * - Parse error responses from API and include helpful messages
 * - Handle network errors gracefully
 */

// ============================================================================
// TODO: Implement completeStablecoinRefund function
// ============================================================================
/**
 * TODO: Implement completeStablecoinRefund function
 *
 * Purpose: Complete a STABLECOIN refund by sending the MNEE payment to Fireblocks.
 * After calling initiateRefund and receiving a 402 response, merchants use this
 * function to create and submit the MNEE payment.
 *
 * Usage Example:
 * ```typescript
 * import { initiateRefund, completeStablecoinRefund } from 'mnee-checkout/server';
 * import { createMneePayment } from 'yours-wallet-sdk'; // Example
 *
 * // Step 1: Initiate refund
 * const refundRequest = await initiateRefund({
 *   merchantOrderId: orderId,
 *   amountUsdCents: 1000, // $10.00
 * }, MNEE_API_KEY);
 *
 * if (refundRequest.refundType === 'STABLECOIN') {
 *   // Step 2: Create unbroadcasted MNEE payment
 *   const unbroadcastedTx = await createMneePayment({
 *     to: refundRequest.mneeDepositAddress,
 *     amount: refundRequest.mneeAmount,
 *     broadcast: false, // Important: Don't broadcast yet
 *   });
 *
 *   // Step 3: Complete refund with MNEE payment
 *   const result = await completeStablecoinRefund(
 *     orderId,
 *     unbroadcastedTx,
 *     MNEE_API_KEY,
 *   );
 *
 *   console.log('Refund completed:', result);
 * }
 * ```
 *
 * Function Signature:
 * ```typescript
 * export async function completeStablecoinRefund(
 *   merchantOrderId: string,
 *   unbroadcastedMneeTransaction: string,
 *   mneeApiKey: string,
 *   mneeApiUrl: string = 'https://checkout-api.mnee.com'
 * ): Promise<RefundCompletedResponse>
 * ```
 *
 * Implementation Steps:
 *
 * 1. Validate input parameters
 *    - Ensure merchantOrderId is provided
 *    - Ensure unbroadcastedMneeTransaction is provided (base64 or hex string)
 *    - Ensure mneeApiKey is provided
 *
 * 2. Make POST request to MNEE API
 *    - Endpoint: POST {mneeApiUrl}/api/refund/complete
 *    - Headers:
 *      {
 *        'Content-Type': 'application/json',
 *        'X-API-Key': mneeApiKey,
 *        'X-Payment': unbroadcastedMneeTransaction,
 *      }
 *    - Body: { merchantOrderId }
 *
 * 3. Handle response
 *    - If status 200: Parse as RefundCompletedResponse
 *      * API will have:
 *        a) Validated and broadcast the MNEE payment
 *        b) Sent stablecoin refund to customer via Fireblocks
 *        c) Updated transaction record
 *    - If error: Parse error response and throw
 *
 * 4. Return success response
 *    - Contains both MNEE payment hash and stablecoin refund hash
 *    - Shows remaining refundable amount for partial refunds
 *
 * Error Handling:
 * - Validation errors (invalid inputs)
 * - MNEE payment validation errors (wrong amount, wrong recipient, expired)
 * - Fireblocks errors (refund transaction failed)
 * - Network errors
 * - Include specific error codes for different failure types
 *
 * Security Considerations:
 * - Never broadcast the MNEE transaction yourself
 * - Let the API validate and broadcast it
 * - API ensures atomicity (MNEE received → stablecoin sent)
 */

// ============================================================================
// TODO: Implement recordDirectRefund function
// ============================================================================
/**
 * TODO: Implement recordDirectRefund function
 *
 * Purpose: Record a DIRECT_MNEE refund after merchant has sent MNEE directly
 * to the customer via P2P. This notifies the MNEE API to update records.
 *
 * Usage Example:
 * ```typescript
 * import { initiateRefund, recordDirectRefund } from 'mnee-checkout/server';
 * import { sendMnee } from 'yours-wallet-sdk'; // Example
 *
 * // Step 1: Initiate refund
 * const refundRequest = await initiateRefund({
 *   merchantOrderId: orderId,
 *   amountUsdCents: 500, // $5.00
 * }, MNEE_API_KEY);
 *
 * if (refundRequest.refundType === 'DIRECT_MNEE') {
 *   // Step 2: Send MNEE directly to customer (P2P)
 *   const txHash = await sendMnee({
 *     to: refundRequest.customerAddress,
 *     amount: refundRequest.mneeAmount,
 *     broadcast: true, // Broadcast immediately for P2P
 *   });
 *
 *   // Step 3: Wait for confirmation (recommended)
 *   await waitForConfirmation(txHash);
 *
 *   // Step 4: Record refund in MNEE API
 *   const result = await recordDirectRefund(
 *     orderId,
 *     txHash,
 *     MNEE_API_KEY,
 *   );
 *
 *   console.log('Refund recorded:', result);
 * }
 * ```
 *
 * Function Signature:
 * ```typescript
 * export async function recordDirectRefund(
 *   merchantOrderId: string,
 *   refundTxHash: string,
 *   mneeApiKey: string,
 *   mneeApiUrl: string = 'https://checkout-api.mnee.com'
 * ): Promise<RefundCompletedResponse>
 * ```
 *
 * Implementation Steps:
 *
 * 1. Validate input parameters
 *    - Ensure merchantOrderId is provided
 *    - Ensure refundTxHash is provided (BSV transaction hash)
 *    - Ensure mneeApiKey is provided
 *
 * 2. Make POST request to MNEE API
 *    - Endpoint: POST {mneeApiUrl}/api/refund/record-direct
 *    - Headers:
 *      {
 *        'Content-Type': 'application/json',
 *        'X-API-Key': mneeApiKey,
 *      }
 *    - Body: { merchantOrderId, refundTxHash }
 *
 * 3. Handle response
 *    - If status 200: Parse as RefundCompletedResponse
 *      * API will have:
 *        a) Verified the transaction on BSV blockchain
 *        b) Validated recipient and amount match expected values
 *        c) Updated transaction record
 *    - If error: Parse error response and throw
 *
 * 4. Return success response
 *    - Confirms refund was recorded
 *    - Shows remaining refundable amount for partial refunds
 *
 * Error Handling:
 * - Validation errors (invalid inputs)
 * - Blockchain verification errors (tx not found, unconfirmed, wrong amount)
 * - Network errors
 * - Duplicate refund submissions
 *
 * Security Considerations:
 * - API verifies transaction on-chain before accepting
 * - Cannot record same transaction twice
 * - Must match pending refund details (amount, recipient)
 */

// ============================================================================
// TODO: Implement helper functions
// ============================================================================
/**
 * TODO: Implement helper functions
 *
 * These helper functions make it easier for merchants to work with refunds:
 *
 * 1. isRefundable(transaction): boolean
 *    - Check if a transaction can be refunded
 *    - Returns false if: PENDING, VERIFIED, FAILED, PAYOUT_FAILED, REFUNDED
 *    - Returns true if: SENT, PARTIAL_REFUND
 *
 * 2. getRemainingRefundable(transaction): number
 *    - Calculate remaining refundable amount
 *    - Returns: transaction.amountUsdCents - transaction.refundedAmount
 *
 * 3. isStablecoinPayment(transaction): boolean
 *    - Check if original payment was STABLECOIN type
 *    - Returns: transaction.paymentType === 'STABLECOIN'
 *
 * 4. isDirectMneePayment(transaction): boolean
 *    - Check if original payment was DIRECT_MNEE type
 *    - Returns: transaction.paymentType === 'DIRECT_MNEE'
 *
 * 5. waitForRefundCompletion(merchantOrderId, apiKey, timeout): Promise<RefundCompletedResponse>
 *    - Poll API until refund completes
 *    - Useful for async refund processing
 *    - Throws timeout error if not completed in time
 *
 * Example:
 * ```typescript
 * import { isRefundable, getRemainingRefundable } from 'mnee-checkout/server';
 *
 * if (isRefundable(transaction)) {
 *   const maxRefund = getRemainingRefundable(transaction);
 *   console.log(`Can refund up to ${maxRefund} cents`);
 * }
 * ```
 */

// ============================================================================
// PLACEHOLDER EXPORTS (Remove when implementing)
// ============================================================================

/**
 * Temporary export to prevent module errors.
 * Remove this when implementing the actual functions above.
 */
export const REFUND_TODO = {
  message: 'Refund functionality not yet implemented. See TODO comments in this file.',
  functions: [
    'initiateRefund',
    'completeStablecoinRefund',
    'recordDirectRefund',
    'isRefundable',
    'getRemainingRefundable',
  ],
};
