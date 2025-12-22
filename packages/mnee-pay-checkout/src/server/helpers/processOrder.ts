/**
 * Process and complete an order in one function call
 *
 * This helper handles the entire order completion flow:
 * 1. Retrieve session from MNEE API
 * 2. Extract order data from session metadata
 * 3. Complete session with merchantOrderId
 * 4. Return complete order object
 *
 * Note: All calculations (totals, tax, shipping) were already done
 * during the /calculate-totals step and stored in the session.
 * This function just extracts that data and completes the order.
 */

import { getSession, completeSession } from './sessionHelpers';
import { type Session } from '../utils/extractLineItems';

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface OrderItem {
  externalId: string;
  quantity: number;
  priceUsdCents?: number;
  selectedOptions?: Record<string, any>;
}

export interface ProcessedOrder {
  id: string;
  items: OrderItem[];
  amountUsdCents: number;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: ShippingAddress;
  checkoutType?: string;
  sessionId: string;
  txHash: string;
}

export interface ProcessOrderConfig {
  sessionId: string;
  txHash: string;
  mneeApiKey: string;
  merchantOrderId: string;
  /** @internal Set by createCheckoutServer */
  mneeCheckoutApiUrl?: string;
}

export interface ProcessOrderResult {
  order: ProcessedOrder;
  session: Session;
}

export async function processOrder(config: ProcessOrderConfig): Promise<ProcessOrderResult> {
  const {
    sessionId,
    txHash,
    mneeApiKey,
    merchantOrderId,
    mneeCheckoutApiUrl,
  } = config;

  // 1. Get session from MNEE API
  const session = await getSession(sessionId, mneeApiKey, mneeCheckoutApiUrl);
  if (!session) {
    throw new Error('Session not found');
  }

  // 2. Validate session has required data
  const metadata = session.metadata;
  if (!metadata?.items || !Array.isArray(metadata.items) || metadata.items.length === 0) {
    throw new Error('No items in session');
  }

  // 3. Complete session with merchant order ID
  await completeSession({
    sessionId,
    mneeApiKey,
    txHash,
    merchantOrderId,
    mneeCheckoutApiUrl,
  });

  // 4. Return complete order object extracted from session metadata
  const order: ProcessedOrder = {
    id: merchantOrderId,
    items: metadata.items,
    amountUsdCents: session.amountUsdCents,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    shippingAddress: metadata.shippingAddress,
    checkoutType: metadata.checkoutType,
    sessionId,
    txHash,
  };

  return {
    order,
    session: {
      ...session,
      id: session.sessionId || sessionId, // Normalize sessionId to id
    },
  };
}
